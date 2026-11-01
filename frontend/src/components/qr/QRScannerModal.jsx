import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { QrCode, Camera, ArrowRight, X, Sparkles, UserCheck } from 'lucide-react';

export const QRScannerModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [manualToken, setManualToken] = useState('');
  const [scanMode, setScanMode] = useState('token'); // 'token' | 'camera'
  const [errorMsg, setErrorMsg] = useState('');

  // Sample quick test students
  const quickTestStudents = [
    { name: 'Aarav Roy', id: 'STU-2024-001', token: 'aarav-roy-qr-2024-edutrack', class: 'Class 10A (2 Years History)' },
    { name: 'Ananya Roy', id: 'STU-2025-002', token: 'ananya-roy-qr-2025-edutrack', class: 'Class 9A' },
    { name: 'Rohan Sharma', id: 'STU-2024-003', token: 'rohan-sharma-qr-2024-edutrack', class: 'Class 10A' },
  ];

  useEffect(() => {
    let scanner = null;
    if (isOpen && scanMode === 'camera') {
      try {
        scanner = new Html5QrcodeScanner(
          'qr-reader-container',
          { fps: 10, qrbox: { width: 220, height: 220 } },
          false
        );

        scanner.render(
          (decodedText) => {
            // Check if it's a full URL or token
            let token = decodedText;
            if (decodedText.includes('/verify/')) {
              token = decodedText.split('/verify/')[1].split('?')[0];
            }
            scanner.clear();
            onClose();
            navigate(`/verify/${token}`);
          },
          (err) => {
            // scan failure callback ignored
          }
        );
      } catch (err) {
        console.error('Camera init error:', err);
      }
    }

    return () => {
      if (scanner) {
        try {
          scanner.clear();
        } catch (e) {}
      }
    };
  }, [isOpen, scanMode, navigate, onClose]);

  if (!isOpen) return null;

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualToken.trim()) {
      setErrorMsg('Please enter a QR token or student ID');
      return;
    }
    let token = manualToken.trim();
    if (token.includes('/verify/')) {
      token = token.split('/verify/')[1].split('?')[0];
    }
    onClose();
    navigate(`/verify/${token}`);
  };

  const handleSelectQuickStudent = (token) => {
    onClose();
    navigate(`/verify/${token}`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all w-full max-w-lg border border-slate-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50">
            <div className="flex items-center gap-2 text-indigo-700">
              <QrCode className="w-5 h-5" />
              <h3 className="text-base font-bold text-slate-800">Scan or Lookup Student QR Profile</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            {/* Mode switcher tabs */}
            <div className="flex rounded-xl bg-slate-100 p-1 mb-5">
              <button
                type="button"
                onClick={() => setScanMode('token')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                  scanMode === 'token'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Instant Token / ID Lookup
              </button>
              <button
                type="button"
                onClick={() => setScanMode('camera')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  scanMode === 'camera'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                Live Camera Scanner
              </button>
            </div>

            {scanMode === 'camera' ? (
              <div className="flex flex-col items-center">
                <div id="qr-reader-container" className="w-full rounded-xl overflow-hidden" />
                <p className="text-xs text-slate-500 mt-2 text-center">
                  Position the student QR badge in front of your camera.
                </p>
              </div>
            ) : (
              <div>
                <form onSubmit={handleManualSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Enter QR Token or Scan URL
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={manualToken}
                        onChange={(e) => {
                          setManualToken(e.target.value);
                          setErrorMsg('');
                        }}
                        placeholder="e.g. aarav-roy-qr-2024-edutrack"
                        className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-colors flex items-center gap-1.5"
                      >
                        Open <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                    {errorMsg && <p className="text-xs text-rose-500 mt-1">{errorMsg}</p>}
                  </div>
                </form>

                {/* Quick Test Demo Profiles */}
                <div className="mt-6 pt-5 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Quick Demo Student QR Profiles
                  </div>
                  <div className="space-y-2">
                    {quickTestStudents.map((s) => (
                      <button
                        key={s.token}
                        type="button"
                        onClick={() => handleSelectQuickStudent(s.token)}
                        className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 text-left transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                            <UserCheck className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-700">
                              {s.name}
                            </p>
                            <p className="text-xs text-slate-500">{s.class} • {s.id}</p>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-indigo-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                          View Profile &rarr;
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRScannerModal;
