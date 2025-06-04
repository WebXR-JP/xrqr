import { useRef, useEffect, useState } from 'react';
import jsQR from 'jsqr';

export const useQRScanner = (onScan: (data: string) => void) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startScanning = async () => {
    try {
      // カメラの設定を最適化
      // より小さな解像度で開始し、必要に応じて調整
      const constraints = {
        video: {
          facingMode: 'environment',
          width: { min: 640, ideal: 1280, max: 1920 },
          height: { min: 480, ideal: 720, max: 1080 },
          aspectRatio: 1.777777778
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsScanning(true);
          scanFrame();
        };
      }
    } catch (error) {
      setError('カメラにアクセスできません');
      console.error('Camera access failed:', error);
    }
  };

  const stopScanning = () => {
    setIsScanning(false);
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
  };

  const scanFrame = () => {
    if (!videoRef.current || !canvasRef.current || !isScanning) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      // ビデオのアスペクト比を維持しながら、適切なサイズでキャンバスに描画
      const videoAspect = video.videoWidth / video.videoHeight;
      let canvasWidth = 640;
      let canvasHeight = canvasWidth / videoAspect;

      // キャンバスサイズを設定
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      // ビデオ全体を描画
      context?.drawImage(video, 0, 0, canvasWidth, canvasHeight);

      // グレースケール変換とコントラスト強調
      const imageData = context?.getImageData(0, 0, canvasWidth, canvasHeight);
      if (imageData) {
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          // グレースケール変換
          const gray = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);

          // コントラスト強調
          const contrast = 1.5;
          const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
          const newGray = factor * (gray - 128) + 128;

          // RGBすべてに同じ値を設定
          data[i] = data[i + 1] = data[i + 2] = Math.max(0, Math.min(255, newGray));
        }
        context?.putImageData(imageData, 0, 0);

        // QRコード検出を複数の向きで試行
        const angles = [0, 90, 180, 270];
        for (const angle of angles) {
          if (angle > 0) {
            // キャンバスを回転
            const tempCanvas = document.createElement('canvas');
            const tempContext = tempCanvas.getContext('2d');
            if (!tempContext) continue;

            if (angle === 90 || angle === 270) {
              tempCanvas.width = canvasHeight;
              tempCanvas.height = canvasWidth;
            } else {
              tempCanvas.width = canvasWidth;
              tempCanvas.height = canvasHeight;
            }

            tempContext.translate(tempCanvas.width / 2, tempCanvas.height / 2);
            tempContext.rotate((angle * Math.PI) / 180);
            tempContext.drawImage(canvas, -canvasWidth / 2, -canvasHeight / 2);

            const rotatedImageData = tempContext.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
            const code = jsQR(rotatedImageData.data, tempCanvas.width, tempCanvas.height);
            if (code) {
              console.log('QRコード検出成功 (回転角度:', angle, '度)');
              onScan(code.data);
              stopScanning();
              return;
            }
          } else {
            const code = jsQR(data, canvasWidth, canvasHeight);
            if (code) {
              console.log('QRコード検出成功');
              onScan(code.data);
              stopScanning();
              return;
            }
          }
        }
      }
    }

    if (isScanning) {
      requestAnimationFrame(scanFrame);
    }
  };

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  return {
    videoRef,
    canvasRef,
    startScanning,
    stopScanning,
    isScanning,
    error
  };
};
