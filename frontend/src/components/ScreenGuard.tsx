import {  useEffect, useState } from 'react';
import { Spinner } from './Spinner'; // or whatever loading UI you already use

interface ScreenGuardProps {
    children: React.ReactNode;
    minWidth?: number;
    minHeight?: number;
    requireFullScreen?: boolean;
  }
  
  export default function ScreenGuard({
    children,
    minWidth = 1024,
    minHeight = 600,
    requireFullScreen = false,
  }: ScreenGuardProps) {
    const [loading, setLoading] = useState(true);
    const [ok, setOk]       = useState(false);
  
    // Check both size *and* fullscreen if required
    const check = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const fs = !!document.fullscreenElement;
      setOk(
        w >= minWidth &&
        h >= minHeight &&
        (!requireFullScreen || fs)
      );
      setLoading(false);
    };
  
    useEffect(() => {
      check();
      window.addEventListener('resize', check);
      document.addEventListener('fullscreenchange', check);
      return () => {
        window.removeEventListener('resize', check);
        document.removeEventListener('fullscreenchange', check);
      };
    }, [minWidth, minHeight, requireFullScreen]);
  
    if (loading) {
      return <Spinner />;
    }
  
    if (!ok) {
      return (
        <div className="w-full h-screen flex flex-col items-center justify-center p-4 text-center">
          <h2 className="text-2xl font-bold mb-2">
            Large Screen Required!
          </h2>
          <p className="text-gray-600 mb-4">
            To open the Art Wall Designer, you need to use your computer, or enlarge your window
            {requireFullScreen && ' or enter full‑screen mode'}.
          </p>
          {requireFullScreen && (
            <button
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              onClick={() =>
                document.documentElement.requestFullscreen()
              }
            >
              Go Full Screen
            </button>
          )}
        </div>
      );
    }
  
    return <>{children}</>;
  }
  