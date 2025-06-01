import { useState, useEffect } from 'react';

export const useXRDetection = () => {
  const [isXRDevice, setIsXRDevice] = useState<boolean | null>(null);

  useEffect(() => {
    const detectXR = async () => {
      if ('xr' in navigator) {
        try {
          const isSupported = await navigator.xr.isSessionSupported('immersive-vr');
          setIsXRDevice(isSupported);
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
