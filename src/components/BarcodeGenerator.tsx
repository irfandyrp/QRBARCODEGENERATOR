'use client';

import { useState, useRef, useEffect } from 'react';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';

type CodeType = 'barcode' | 'qrcode';

export default function BarcodeGenerator() {
  const [inputText, setInputText] = useState('');
  const [displayText, setDisplayText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [codeType, setCodeType] = useState<CodeType>('barcode');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle mode switching
  useEffect(() => {
    // Clear canvas when mode changes
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    
    // Clear display text to force re-render
    setDisplayText('');
    setError('');
    
    // Auto-regenerate if there's input text
    if (inputText.trim()) {
      setTimeout(() => {
        generateCode();
      }, 100);
    }
  }, [codeType]); // eslint-disable-line react-hooks/exhaustive-deps

  // Generate code function (barcode or QR code)
  const generateCode = () => {
    if (!inputText.trim()) {
      setError('Masukkan teks terlebih dahulu!');
      return;
    }

    setIsGenerating(true);
    setError('');

    // Add small delay to ensure canvas is ready
    setTimeout(async () => {
      try {
        console.log(`Generating ${codeType} for:`, inputText);
        console.log('Canvas ref status:', canvasRef.current ? 'Available' : 'Not available');
        
        const canvas = canvasRef.current;
        if (!canvas) {
          throw new Error('Canvas element tidak ditemukan - pastikan component sudah ter-render');
        }

        console.log('Canvas dimensions:', canvas.width, 'x', canvas.height);
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Tidak dapat mendapatkan canvas context');
        }

        // Clear previous code
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        console.log('Canvas cleared');

        if (codeType === 'barcode') {
          // Generate barcode
          JsBarcode(canvas, inputText.trim(), {
            format: "CODE128",
            width: 2,
            height: 80,
            displayValue: true,
            fontSize: 14,
            textMargin: 8,
            // Transparent background so exported PNG has no white box
            background: 'rgba(0,0,0,0)',
            lineColor: "#000000",
            // Remove extra margins/quiet zones to minimize empty space
            margin: 0
          });
          console.log('Barcode generated successfully');
        } else {
          // Generate QR code
          await QRCode.toCanvas(canvas, inputText.trim(), {
            width: 200,
            margin: 0,
            color: {
              dark: '#000000',
              // Transparent background for QR code
              light: '#0000'
            }
          });
          console.log('QR code generated successfully');
        }
        
        setDisplayText(inputText.trim());
        
      } catch (error) {
        console.error(`Error generating ${codeType}:`, error);
        setError(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setDisplayText('');
      } finally {
        setIsGenerating(false);
      }
    }, 100);
  };

  // Clear code
  const clearCode = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    setDisplayText('');
    setInputText('');
    setError('');
  };

  // Save code as PNG (transparent, only the canvas content)
  const saveAsPNG = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !displayText) {
      alert(`Tidak ada ${codeType === 'barcode' ? 'barcode' : 'QR code'} untuk disimpan!`);
      return;
    }

    try {
      const link = document.createElement('a');
      link.download = `${codeType}-${displayText}-${Date.now()}.png`;
      // Export only the canvas bitmap (transparent background preserved)
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error(`Error saving ${codeType}:`, error);
      alert(`Gagal menyimpan ${codeType === 'barcode' ? 'barcode' : 'QR code'}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className={`w-full mx-auto bg-white rounded-lg shadow-lg p-6 ${
      codeType === 'barcode' ? 'max-w-2xl' : 'max-w-md'
    }`}>
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Code Generator
        </h1>
        <p className="text-gray-600 text-sm">
          Masukkan teks untuk menghasilkan {codeType === 'barcode' ? 'Barcode' : 'QR Code'}
        </p>
      </div>

      {/* Code Type Toggle */}
      <div className="mb-4">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => {
              if (codeType !== 'barcode') {
                setCodeType('barcode');
              }
            }}
            disabled={isGenerating}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              codeType === 'barcode'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-800'
            } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            📊 Barcode
          </button>
          <button
            onClick={() => {
              if (codeType !== 'qrcode') {
                setCodeType('qrcode');
              }
            }}
            disabled={isGenerating}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              codeType === 'qrcode'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-800'
            } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            📱 QR Code
          </button>
        </div>
      </div>

      {/* Input Field */}
      <div className="mb-4">
        <label 
          htmlFor="codeInput" 
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Teks untuk {codeType === 'barcode' ? 'Barcode' : 'QR Code'}:
        </label>
        <input
          id="codeInput"
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && generateCode()}
          placeholder={`Masukkan teks untuk ${codeType === 'barcode' ? 'barcode' : 'QR code'}...`}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
          disabled={isGenerating}
        />
      </div>

      {/* Action Buttons */}
      <div className="mb-4 flex gap-3">
        <button
          onClick={generateCode}
          disabled={!inputText.trim() || isGenerating}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
            !inputText.trim() || isGenerating
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
          }`}
        >
          {isGenerating ? (
            <>
              <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
              Generating...
            </>
          ) : (
            <>
              {codeType === 'barcode' ? '📊 Generate Barcode' : '📱 Generate QR Code'}
            </>
          )}
        </button>
        
        <button
          onClick={clearCode}
          disabled={isGenerating}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            isGenerating
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gray-600 hover:bg-gray-700 text-white'
          }`}
        >
          🗑️ Clear
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">❌ {error}</p>
        </div>
      )}

      {/* Code Display Container */}
      <div 
        ref={containerRef}
        className={`border border-gray-200 rounded-lg p-6 mb-4 flex flex-col items-center justify-center ${
          codeType === 'barcode' ? 'min-h-[140px]' : 'min-h-[180px]'
        }`}
        style={{
          // Transparent container to avoid white background in capture/export
          backgroundColor: 'transparent',
          border: '1px solid #e5e7eb',
          borderRadius: '8px'
        }}
      >
        {/* Code Canvas - Always rendered */}
        <canvas
          key={`canvas-${codeType}`}
          ref={canvasRef}
          width={codeType === 'qrcode' ? 250 : 500}
          height={codeType === 'qrcode' ? 250 : 120}
          className={`${displayText ? 'block' : 'hidden'}`}
          style={{
            // Remove decorative borders so exported image has no extra space
            border: '0',
            borderRadius: '0',
            backgroundColor: 'transparent'
          }}
        />
        
        {displayText ? (
          <>
            {/* Display Text Below QR Code Only */}
            {codeType === 'qrcode' && (
              <div className="text-center mt-4">
                <p 
                  className="text-sm font-mono text-gray-800 bg-gray-50 px-3 py-1 rounded"
                  style={{
                    fontSize: '14px',
                    fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                    color: '#1f2937',
                    backgroundColor: '#f9fafb',
                    padding: '4px 12px',
                    borderRadius: '4px'
                  }}
                >
                  {displayText}
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center text-gray-400" style={{ color: '#9ca3af' }}>
            {isGenerating ? (
              <>
                <div className="text-4xl mb-2">
                  <span className="inline-block animate-spin">⏳</span>
                </div>
                <p className="text-sm" style={{ fontSize: '14px' }}>
                  Generating {codeType === 'barcode' ? 'barcode' : 'QR code'}...
                </p>
              </>
            ) : (
              <>
                <div className="text-4xl mb-2">{codeType === 'barcode' ? '📊' : '📱'}</div>
                <p className="text-sm" style={{ fontSize: '14px' }}>
                  Klik "Generate {codeType === 'barcode' ? 'Barcode' : 'QR Code'}" untuk membuat {codeType === 'barcode' ? 'barcode' : 'QR code'}
                </p>
                <p className="text-xs mt-1 text-gray-500" style={{ fontSize: '12px', color: '#6b7280' }}>Masukkan teks terlebih dahulu</p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Save Button */}
      <button
        onClick={saveAsPNG}
        disabled={!displayText}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
          displayText
            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        💾 Simpan sebagai PNG
      </button>

      {/* Info */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        <p>
          {codeType === 'barcode' 
            ? 'Format: CODE128 • Text: Terintegrasi • Ukuran: 500x120px'
            : 'QR Code • Error Correction: Medium • Ukuran: 250x250px'
          }
        </p>
        <p className="mt-1">💡 Tip: Tekan Enter di input field untuk generate {codeType === 'barcode' ? 'barcode' : 'QR code'}</p>
      </div>
    </div>
  );
}
