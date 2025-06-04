import { useState, useEffect } from 'react';

export const useXRDetection = () => {
  const [isXRDevice, setIsXRDevice] = useState<boolean | null>(null);

  useEffect(() => {
    const detectXR = async () => {
      // PCのブラウザでもWebXR APIが利用可能な場合があるため、
      // より厳密な判定を行う
      if ('xr' in navigator && 'userAgent' in navigator) {
        try {
          const userAgent = navigator.userAgent.toLowerCase();
          // Questのブラウザを判定
          const isQuestBrowser = userAgent.includes('quest') ||
                                userAgent.includes('oculus') ||
                                userAgent.includes('meta');

          if (!isQuestBrowser) {
            setIsXRDevice(false);
            return;
          }

          // VRとパススルーカメラの両方のサポートを確認
          const [isVRSupported, isPassthroughSupported] = await Promise.all([
            navigator.xr?.isSessionSupported('immersive-vr') ?? false,
            navigator.xr?.isSessionSupported('immersive-ar') ?? false
          ]);

          // 両方サポートされている場合のみtrueを返す
          setIsXRDevice(isVRSupported && isPassthroughSupported);
        } catch {
          setIsXRDevice(false);
        }
      } else {
        setIsXRDevice(false);
      }
    };

    detectXR();
  }, []);

  return isXRDevice;
};
