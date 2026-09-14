import React, { useState } from 'react';
import {
  X,
  Download,
  Smartphone,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Package,
  Sparkles,
  Terminal,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { downloadFile } from '../utils/geo';

interface ApkExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApkExportModal: React.FC<ApkExportModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [copiedStep, setCopiedStep] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(id);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  const handleDownloadAndroidManifest = () => {
    const androidManifest = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.jagabadlo.gpsemulator"
    android:versionCode="1"
    android:versionName="1.0.0">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_MOCK_LOCATION" />
    <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="Jaga Badlo"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.JagaBadlo">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|screenSize|keyboardHidden"
            android:theme="@style/Theme.JagaBadlo.Fullscreen">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;

    downloadFile(androidManifest, 'AndroidManifest.xml', 'application/xml');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-slate-100 text-lg flex items-center gap-2">
                <span>Install APK for Android</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                  Jaga Badlo
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Install as native Android WebAPK or build standalone APK
              </p>
            </div>
          </div>
          <button
            id="btn-close-apk-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-300 text-xs">
          {/* Method 1: Instant WebAPK Install */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 to-slate-800/60 border border-emerald-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <Sparkles className="w-4 h-4" />
                <span>Option 1: Instant Android 1-Click Install (WebAPK)</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-medium">
                Fastest
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Google Chrome / Android will automatically generate and install a genuine Android <strong>.apk</strong> (WebAPK) package directly on your smartphone. It will appear on your home screen and app launcher with the Jaga Badlo icon!
            </p>

            {isInstalled ? (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-900/30 text-emerald-300 border border-emerald-600/40">
                <CheckCircle2 className="w-4 h-4" />
                <span className="font-medium">Already installed on this device in Standalone Mode!</span>
              </div>
            ) : isInstallable ? (
              <button
                id="btn-install-webapk"
                onClick={install}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Install Jaga Badlo APK on this Phone</span>
              </button>
            ) : (
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/80 space-y-1.5">
                <p className="font-medium text-slate-200">How to install directly from your mobile browser:</p>
                <ol className="list-decimal list-inside space-y-1 text-slate-400">
                  <li>Open this app URL in <strong>Google Chrome</strong> on Android.</li>
                  <li>Tap the <strong>three dots (⋮)</strong> menu in the top right.</li>
                  <li>Tap <strong>&quot;Install app&quot;</strong> or <strong>&quot;Add to Home screen&quot;</strong>.</li>
                  <li>Android will build the signed APK package and add it to your apps!</li>
                </ol>
              </div>
            )}
          </div>

          {/* Method 2: Android Package Builder (PWABuilder / Bubblewrap) */}
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-3">
            <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
              <Package className="w-4 h-4" />
              <span>Option 2: Generate Signed Standalone .APK File</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              To convert this app into a standalone downloadable <strong>.apk</strong> file for sideloading or sharing:
            </p>

            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-200 font-medium">A. PWABuilder (No coding required, free):</span>
                  <a
                    href="https://www.pwabuilder.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-sky-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>Open pwabuilder.com</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-slate-400">
                  Enter your app URL into PWABuilder, click <strong>Package for Android</strong>, and it will compile and download a ready-to-install <strong>.apk</strong> and signed Google Play <strong>.aab</strong> bundle.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-200 font-medium">B. Download AndroidManifest.xml:</span>
                  <button
                    onClick={handleDownloadAndroidManifest}
                    className="text-xs px-2.5 py-1 rounded bg-sky-600/30 hover:bg-sky-600/50 text-sky-300 border border-sky-500/30 flex items-center gap-1 font-medium transition"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download Manifest</span>
                  </button>
                </div>
                <p className="text-slate-400">
                  Pre-configured with <code className="text-sky-300 font-mono">ACCESS_MOCK_LOCATION</code> and <code className="text-sky-300 font-mono">ACCESS_FINE_LOCATION</code> permissions for Android Studio.
                </p>
              </div>
            </div>
          </div>

          {/* Android Mock Location Setup Guide */}
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <ShieldCheck className="w-4 h-4" />
              <span>How to Enable Mock Location in Android Settings</span>
            </div>
            <p className="text-slate-400">
              For any GPS emulator to override system GPS on Android, Developer Options must have mock locations enabled:
            </p>

            <div className="space-y-2 font-sans">
              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-950/50 border border-slate-800">
                <span className="w-5 h-5 rounded-full bg-amber-600/30 text-amber-400 font-bold flex items-center justify-center shrink-0">1</span>
                <div>
                  <strong className="text-slate-200">Enable Developer Options:</strong>
                  <p className="text-slate-400">Go to Android <strong>Settings &gt; About Phone</strong> and tap <strong>&quot;Build Number&quot;</strong> 7 times until you see &quot;You are now a developer!&quot;.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-950/50 border border-slate-800">
                <span className="w-5 h-5 rounded-full bg-amber-600/30 text-amber-400 font-bold flex items-center justify-center shrink-0">2</span>
                <div>
                  <strong className="text-slate-200">Select Mock Location App:</strong>
                  <p className="text-slate-400">Go to <strong>Settings &gt; System &gt; Developer options</strong>, scroll down to <strong>&quot;Select mock location app&quot;</strong>, and choose <strong>Jaga Badlo</strong> (or Chrome).</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-950/50 border border-slate-800">
                <span className="w-5 h-5 rounded-full bg-amber-600/30 text-amber-400 font-bold flex items-center justify-center shrink-0">3</span>
                <div>
                  <strong className="text-slate-200">Start Spoofing:</strong>
                  <p className="text-slate-400">Open Jaga Badlo, select any location on the map, and press <strong>&quot;Start Jaga Badlo&quot;</strong>. All apps will now see your simulated location!</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
