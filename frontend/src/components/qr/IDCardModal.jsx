import React, { useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, X, Download, ShieldCheck, FileCheck, Check, Sparkles } from 'lucide-react';

export const IDCardModal = ({ isOpen, onClose, student, academicRecord }) => {
  const cardRef = useRef(null);
  const [downloadingImg, setDownloadingImg] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen || !student) return null;

  const profileUrl = `${window.location.origin}/verify/${student.qrToken}`;

  const handlePrint = () => {
    window.print();
  };

  // Convert SVG/Card elements to PNG Image Download
  const handleDownloadPNG = async () => {
    try {
      setDownloadingImg(true);
      const cardEl = cardRef.current;
      if (!cardEl) return;

      // Extract QR code SVG
      const qrSvg = cardEl.querySelector('svg');
      let qrImgData = '';
      if (qrSvg) {
        const svgString = new XMLSerializer().serializeToString(qrSvg);
        qrImgData = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const width = 720; // 2x retina
      const height = 1100;
      canvas.width = width;
      canvas.height = height;

      // Draw background
      ctx.fillStyle = '#ffffff';
      ctx.roundRect(0, 0, width, height, 32);
      ctx.fill();

      // Top Header Gradient
      const grad = ctx.createLinearGradient(0, 0, width, 180);
      grad.addColorStop(0, '#1e1b4b');
      grad.addColorStop(0.5, '#312e81');
      grad.addColorStop(1, '#1e1b4b');
      ctx.fillStyle = grad;
      ctx.roundRect(0, 0, width, 180, [32, 32, 0, 0]);
      ctx.fill();

      // Header Text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 30px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('DELHI PUBLIC ACADEMY', width / 2, 70);

      ctx.fillStyle = '#c7d2fe';
      ctx.font = '500 18px Inter, sans-serif';
      ctx.fillText('STUDENT IDENTITY & ACADEMIC CARD', width / 2, 105);

      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 16px Inter, sans-serif';
      ctx.fillText('● VERIFIED ACTIVE', width / 2, 140);

      // Student Name & ID
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 36px Inter, sans-serif';
      ctx.fillText(`${student.firstName} ${student.lastName}`, width / 2, 390);

      ctx.fillStyle = '#4f46e5';
      ctx.font = 'bold 22px Inter, monospace';
      ctx.fillText(`Student ID: ${student.studentId}`, width / 2, 430);

      // Academic details block
      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2;
      ctx.roundRect(40, 460, width - 80, 240, 20);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 18px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('CLASS & SECTION', 70, 505);
      ctx.fillText('ROLL NUMBER', 410, 505);
      ctx.fillText('ADMISSION NO', 70, 585);
      ctx.fillText('BLOOD GROUP', 410, 585);
      ctx.fillText('EMERGENCY CONTACT', 70, 665);

      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 24px Inter, sans-serif';
      ctx.fillText(`${academicRecord?.class?.name || 'Class 10'} - ${academicRecord?.section?.name || 'Sec A'}`, 70, 540);
      ctx.fillText(`${academicRecord?.rollNumber || 'N/A'}`, 410, 540);
      ctx.fillText(`${student.admissionNumber}`, 70, 620);
      ctx.fillText(`${student.bloodGroup || 'O+'}`, 410, 620);
      ctx.font = '600 20px Inter, sans-serif';
      ctx.fillText(`${student.emergencyContact?.name || student.parentInfo?.fatherName || 'Parent'} (${student.emergencyContact?.phone || student.phone || 'N/A'})`, 70, 690);

      // QR Code Box
      ctx.fillStyle = '#eef2ff';
      ctx.strokeStyle = '#c7d2fe';
      ctx.roundRect(140, 730, width - 280, 290, 24);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#1e1b4b';
      ctx.font = 'bold 20px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SCAN FOR DYNAMIC ACADEMIC PROFILE', width / 2, 980);
      ctx.fillStyle = '#64748b';
      ctx.font = '500 15px Inter, sans-serif';
      ctx.fillText('Permanent Invariant Token Across All Academic Years', width / 2, 1005);

      // Bottom barcode bar
      ctx.fillStyle = '#0f172a';
      ctx.roundRect(0, height - 55, width, 55, [0, 0, 32, 32]);
      ctx.fill();

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 15px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('VALID FOR ENTIRE TENURE', 40, height - 22);
      ctx.textAlign = 'right';
      ctx.fillText('|||||| | |||| || ||| ||||||', width - 40, height - 22);

      // Draw QR Code Image onto canvas
      if (qrImgData) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          ctx.drawImage(img, width / 2 - 95, 755, 190, 190);
          downloadCanvas(canvas);
        };
        img.src = qrImgData;
      } else {
        downloadCanvas(canvas);
      }
    } catch (e) {
      console.error('Error downloading image:', e);
      setDownloadingImg(false);
    }
  };

  const downloadCanvas = (canvas) => {
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `ID-Badge-${student.studentId || 'student'}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setDownloadingImg(false);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Dark backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm transition-opacity no-print"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-3 sm:p-4 text-center print-modal-portal">
        <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all w-full max-w-md border border-slate-200">
          {/* Header (Hidden on print) */}
          <div className="flex items-center justify-between border-b border-slate-100 px-4 sm:px-6 py-3.5 bg-slate-50 no-print">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-800">
                  Student Identity Badge
                </h3>
                <span className="text-[10px] text-emerald-600 font-bold block">
                  Single-Page PDF Ready
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Action Bar (Hidden on print) */}
          <div className="px-4 sm:px-6 py-2.5 bg-indigo-50/60 border-b border-indigo-100 flex items-center justify-between gap-2 flex-wrap no-print">
            <button
              onClick={handlePrint}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
              title="Prints strictly on a single sheet of paper"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>

            <button
              onClick={handleDownloadPNG}
              disabled={downloadingImg}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-indigo-700 border border-indigo-200 text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-50"
              title="Download crystal clear PNG badge image"
            >
              {downloadSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>{downloadingImg ? 'Generating...' : 'Download Image'}</span>
                </>
              )}
            </button>
          </div>

          {/* Printable Card Container */}
          <div className="p-4 sm:p-6 bg-slate-100 flex justify-center">
            <div
              ref={cardRef}
              className="print-container w-[320px] sm:w-[340px] bg-white rounded-2xl shadow-xl border border-slate-300 overflow-hidden relative"
            >
              {/* Card Header Strip */}
              <div className="bg-gradient-to-r from-indigo-950 via-indigo-900 to-indigo-950 text-white p-3.5 text-center relative">
                <div className="flex items-center justify-center gap-2 mb-0.5">
                  <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center text-white font-extrabold text-[11px]">
                    ED
                  </div>
                  <h4 className="font-extrabold text-xs sm:text-sm tracking-wide uppercase">
                    Delhi Public Academy
                  </h4>
                </div>
                <p className="text-[9px] sm:text-[10px] text-indigo-200 font-medium tracking-wider">
                  STUDENT IDENTITY & ACADEMIC CARD
                </p>
                <div className="absolute top-2 right-2.5 text-[8px] bg-emerald-500 text-white px-2 py-0.5 rounded-full font-bold">
                  VERIFIED
                </div>
              </div>

              {/* Photo & Key Info */}
              <div className="p-4 flex flex-col items-center text-center">
                <div className="relative mb-2.5">
                  <img
                    src={student.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    alt={student.firstName}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-white shadow-md ring-2 ring-indigo-200"
                    onError={(e) => {
                      e.target.src =
                        'https://ui-avatars.com/api/?name=' +
                        encodeURIComponent(student.firstName + ' ' + student.lastName) +
                        '&background=4f46e5&color=fff';
                    }}
                  />
                  <span className="absolute bottom-0 right-0 px-1.5 py-0.5 text-[9px] font-extrabold bg-indigo-600 text-white rounded-md uppercase">
                    {student.bloodGroup || 'O+'}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                  {student.firstName} {student.lastName}
                </h3>
                <p className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full mt-1">
                  Student ID: {student.studentId}
                </p>

                {/* Details Grid */}
                <div className="w-full grid grid-cols-2 gap-1.5 sm:gap-2 text-left bg-slate-50 border border-slate-200 rounded-xl p-2.5 my-3 text-[11px]">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">Class & Sec</span>
                    <span className="font-bold text-slate-800">
                      {academicRecord?.class?.name || 'Class 10'} - {academicRecord?.section?.name || 'Sec A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">Roll Number</span>
                    <span className="font-bold text-slate-800">{academicRecord?.rollNumber || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">Admission No</span>
                    <span className="font-semibold text-slate-700">{student.admissionNumber}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">DOB</span>
                    <span className="font-semibold text-slate-700">
                      {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-slate-200">
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">Emergency Contact</span>
                    <span className="font-semibold text-slate-700 truncate block">
                      {student.emergencyContact?.name || student.parentInfo?.fatherName || 'Parent'} ({student.emergencyContact?.phone || student.phone || 'N/A'})
                    </span>
                  </div>
                </div>

                {/* Dynamic QR Code Section */}
                <div className="flex flex-col items-center bg-indigo-50/70 border border-indigo-100 rounded-xl p-2.5 w-full">
                  <div className="bg-white p-2 rounded-lg shadow-sm border border-indigo-200">
                    <QRCodeSVG
                      value={profileUrl}
                      size={110}
                      level="H"
                      includeMargin={false}
                      fgColor="#1e1b4b"
                    />
                  </div>
                  <p className="text-[10px] font-bold text-indigo-900 mt-1.5 uppercase">
                    SCAN FOR DYNAMIC ACADEMIC PROFILE
                  </p>
                  <p className="text-[8px] text-slate-500">
                    Permanent QR • Persists across all academic years
                  </p>
                </div>
              </div>

              {/* Card Footer Barcode Representation */}
              <div className="bg-slate-900 text-white px-3 py-1.5 flex items-center justify-between text-[8px] font-mono">
                <span>VALID FOR ENTIRE TENURE</span>
                <span className="tracking-widest">||||| | |||| || ||| |||||</span>
              </div>
            </div>
          </div>

          {/* Footer note (Hidden on print) */}
          <div className="px-4 py-2.5 bg-white border-t border-slate-100 text-center text-[11px] text-slate-500 no-print flex items-center justify-center gap-1.5">
            <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Guaranteed <strong>single-page PDF export</strong> with zero extra blank pages.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IDCardModal;
