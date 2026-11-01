import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, ExternalLink, Copy, Check, QrCode } from 'lucide-react';

export const QRCodeCard = ({ qrToken, studentName, studentId, size = 180 }) => {
  const [copied, setCopied] = useState(false);
  const profileUrl = `${window.location.origin}/verify/${qrToken}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSVG = () => {
    const svgElement = document.getElementById(`qr-svg-${qrToken}`);
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `QR-${studentId || 'student'}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col items-center text-center">
      <div className="flex items-center gap-2 mb-3 text-indigo-700">
        <QrCode className="w-5 h-5" />
        <span className="text-xs font-bold uppercase tracking-wider">Permanent Student QR</span>
      </div>

      <div className="p-3 bg-white rounded-xl border-2 border-dashed border-indigo-200 shadow-inner inline-block">
        <QRCodeSVG
          id={`qr-svg-${qrToken}`}
          value={profileUrl}
          size={size}
          level="H"
          includeMargin={true}
          fgColor="#1e1b4b"
          bgColor="#ffffff"
        />
      </div>

      <div className="mt-3">
        <h4 className="font-semibold text-slate-800 text-sm">{studentName}</h4>
        <p className="text-xs text-slate-500 font-mono mt-0.5">ID: {studentId}</p>
      </div>

      <div className="flex items-center gap-2 mt-4 w-full">
        <button
          onClick={handleCopyLink}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
          title="Copy public link"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied' : 'Copy URL'}
        </button>

        <button
          onClick={handleDownloadSVG}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg transition-colors"
          title="Download QR SVG"
        >
          <Download className="w-3.5 h-3.5" />
          Download
        </button>

        <a
          href={profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-indigo-600 rounded-lg transition-colors"
          title="Open Profile in New Tab"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};

export default QRCodeCard;
