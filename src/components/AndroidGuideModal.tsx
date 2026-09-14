import React from 'react';
import {
  X,
  Smartphone,
  ShieldAlert,
  CheckCircle2,
  Terminal,
  Settings,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

interface AndroidGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenApkModal: () => void;
}

export const AndroidGuideModal: React.FC<AndroidGuideModalProps> = ({
  isOpen,
  onClose,
  onOpenApkModal,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-sky-950/40 via-slate-900 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-slate-100 text-base">Android Mock Location Guide</h2>
              <p className="text-xs text-slate-400">Step-by-step setup for Jaga Badlo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300">
          <div className="p-3.5 rounded-2xl bg-sky-950/30 border border-sky-500/30 text-sky-200 leading-relaxed">
            Just like the original <strong>GPS Emulator</strong> app, Android requires giving the app mock location privileges via Android Developer Options. Follow these 3 simple steps:
          </div>

          <div className="space-y-3">
            {/* Step 1 */}
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-sky-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                1
              </div>
              <div>
                <h4 className="font-semibold text-slate-100 text-sm">Enable Android Developer Options</h4>
                <p className="text-slate-400 mt-1 leading-relaxed">
                  Open your Android phone&apos;s <strong>Settings &gt; About Phone</strong>. Find <strong>&quot;Build Number&quot;</strong> and tap it repeatedly <strong>7 times</strong>. A popup message will say <em>&quot;You are now a developer!&quot;</em>.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-sky-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                2
              </div>
              <div>
                <h4 className="font-semibold text-slate-100 text-sm">Select Mock Location App</h4>
                <p className="text-slate-400 mt-1 leading-relaxed">
                  Go back to <strong>Settings &gt; System &gt; Developer options</strong> (or search &quot;Developer options&quot; in Settings search bar). Scroll to the <em>Location</em> or <em>Debugging</em> section, tap <strong>&quot;Select mock location app&quot;</strong>, and choose <strong>Jaga Badlo</strong> (or your browser if running as WebAPK).
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                3
              </div>
              <div>
                <h4 className="font-semibold text-slate-100 text-sm">Pick Any Location &amp; Press Start</h4>
                <p className="text-slate-400 mt-1 leading-relaxed">
                  Open Jaga Badlo, move the target crosshair to your desired location (or use Search / Favorites), and click the big green <strong>&quot;Start Jaga Badlo (Mock GPS)&quot;</strong> button!
                </p>
              </div>
            </div>
          </div>

          {/* Need APK banner */}
          <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between gap-3">
            <div>
              <span className="font-bold text-emerald-400 block text-xs">Need to install on your Android device?</span>
              <span className="text-[11px] text-slate-400">Install 1-click WebAPK or download the package.</span>
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenApkModal();
              }}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shrink-0"
            >
              Get APK
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
