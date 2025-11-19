import React, { useState, useEffect } from 'react';
import { Share, PlusSquare, X, Smartphone } from 'lucide-react';

const InstallPrompt: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    if (isInStandaloneMode) { setIsStandalone(true); return; }
    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));
    setTimeout(() => { if (!sessionStorage.getItem('dismissInstall')) setShowPrompt(true); }, 3000);
  }, []);

  if (isStandalone || !showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-in slide-in-from-bottom-4 duration-700">
      <div className="bg-brand-900/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl border border-brand-700 relative overflow-hidden">
        <button onClick={() => { setShowPrompt(false); sessionStorage.setItem('dismissInstall', 'true'); }} className="absolute top-2 right-2 text-brand-300 hover:text-white p-1"><X className="w-4 h-4" /></button>
        <div className="flex items-start gap-4">
          <div className="bg-gradient-to-br from-brand-500 to-brand-700 p-3 rounded-xl shadow-lg"><Smartphone className="w-6 h-6 text-white" /></div>
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wide text-brand-300 mb-1">Install App</h3>
            <p className="text-sm font-medium leading-snug mb-3">Add <span className="font-bold text-white">Bears TC</span> to your home screen.</p>
            {isIOS ? (
              <div className="text-xs bg-white/10 p-3 rounded-lg border border-white/5 space-y-2">
                <div className="flex items-center gap-2"><span className="bg-white/20 w-5 h-5 flex items-center justify-center rounded-full font-bold">1</span><span>Tap <Share className="w-3 h-3 inline mx-1" /> <span className="font-bold">Share</span> below.</span></div>
                <div className="flex items-center gap-2"><span className="bg-white/20 w-5 h-5 flex items-center justify-center rounded-full font-bold">2</span><span>Select <span className="font-bold">Add to Home Screen</span> <PlusSquare className="w-3 h-3 inline mx-1" />.</span></div>
              </div>
            ) : (
              <div className="text-xs bg-white/10 p-3 rounded-lg border border-white/5">Tap menu (⋮) {'->'} "Install App".</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default InstallPrompt;