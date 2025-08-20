'use client';

import { useState, useRef, useEffect } from 'react';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';

type CodeType = 'barcode' | 'qrcode';
type TabType = 'crate' | 'package';

interface CrateData {
  crate_number: string;
  width: string;
  length: string;
  height: string;
  gross_weight: string;
  net_weight: string;
}

interface PackageData {
  package: string;
  pn: string;
  description: string;
  nsn: string;
  qty: string;
  item_number: string;
  manufactur_code: string;
}

interface GeneratedCode {
  fieldKey: string;
  fieldLabel: string;
  value: string;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export default function BarcodeGenerator() {
  const [generatedCodes, setGeneratedCodes] = useState<GeneratedCode[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [codeType, setCodeType] = useState<CodeType>('barcode');
  const [activeTab, setActiveTab] = useState<TabType>('crate');
  const containerRef = useRef<HTMLDivElement>(null);

  // Form data states
  const [crateData, setCrateData] = useState<CrateData>({
    crate_number: '',
    width: '',
    length: '',
    height: '',
    gross_weight: '',
    net_weight: ''
  });

  const [packageData, setPackageData] = useState<PackageData>({
    package: '',
    pn: '',
    description: '',
    nsn: '',
    qty: '',
    item_number: '',
    manufactur_code: ''
  });

  // Get available fields with data
  const getAvailableFields = () => {
    if (activeTab === 'crate') {
      return [
        { key: 'crate_number', label: 'Crate Number', value: crateData.crate_number },
        { key: 'width', label: 'Width', value: crateData.width },
        { key: 'length', label: 'Length', value: crateData.length },
        { key: 'height', label: 'Height', value: crateData.height },
        { key: 'gross_weight', label: 'Gross Weight', value: crateData.gross_weight },
        { key: 'net_weight', label: 'Net Weight', value: crateData.net_weight }
      ];
    } else {
      return [
        { key: 'package', label: 'Package', value: packageData.package },
        { key: 'pn', label: 'P/N (Part Number)', value: packageData.pn },
        { key: 'description', label: 'Description', value: packageData.description },
        { key: 'nsn', label: 'NSN', value: packageData.nsn },
        { key: 'qty', label: 'QTY (Quantity)', value: packageData.qty },
        { key: 'item_number', label: 'Item Number', value: packageData.item_number },
        { key: 'manufactur_code', label: 'Manufacturer Code', value: packageData.manufactur_code }
      ];
    }
  };

  // Get fields that have data
  const getFilledFields = () => {
    return getAvailableFields().filter(field => field.value.trim() !== '');
  };

  // Handle mode switching
  useEffect(() => {
    // Clear generated codes when mode changes
    setGeneratedCodes([]);
    setError('');
  }, [codeType]);

  // Handle tab switching
  useEffect(() => {
    // Clear generated codes when tab changes
    setGeneratedCodes([]);
    setError('');
  }, [activeTab]);

  // Generate single code on canvas
  const generateSingleCode = async (canvas: HTMLCanvasElement, value: string) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Tidak dapat mendapatkan canvas context');
    }

    // Clear previous code
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (codeType === 'barcode') {
      // Generate barcode
      JsBarcode(canvas, value, {
        format: "CODE128",
        width: 1.2,
        height: 60,
        displayValue: true,
        fontSize: 10,
        textMargin: 4,
        background: 'rgba(0,0,0,0)',
        lineColor: "#000000",
        margin: 0
      });
    } else {
      // Generate QR code
      await QRCode.toCanvas(canvas, value, {
        width: 120,
        margin: 0,
        color: {
          dark: '#000000',
          light: '#0000'
        }
      });
    }
  };

  // Generate codes for all filled fields
  const generateAllCodes = async () => {
    const filledFields = getFilledFields();
    
    if (filledFields.length === 0) {
      setError('Isi minimal satu field untuk generate code!');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      // Create canvas refs for each field
      const newCodes: GeneratedCode[] = filledFields.map(field => ({
        fieldKey: field.key,
        fieldLabel: field.label,
        value: field.value,
        canvasRef: { current: null }
      }));

      setGeneratedCodes(newCodes);

      // Wait for canvases to be created in DOM
      setTimeout(async () => {
        try {
          for (let i = 0; i < newCodes.length; i++) {
            const code = newCodes[i];
            const canvas = document.getElementById(`canvas-${code.fieldKey}`) as HTMLCanvasElement;
            
            if (canvas) {
              code.canvasRef.current = canvas;
              await generateSingleCode(canvas, code.value);
              console.log(`Generated ${codeType} for ${code.fieldLabel}: ${code.value}`);
            }
          }
        } catch (error) {
          console.error(`Error generating ${codeType}:`, error);
          setError(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
          setIsGenerating(false);
        }
      }, 100);
      
    } catch (error) {
      console.error(`Error setting up codes:`, error);
      setError(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsGenerating(false);
    }
  };

  // Clear all codes and data
  const clearCode = () => {
    // Clear all generated codes
    setGeneratedCodes([]);
    setError('');
    
    // Clear form data based on active tab
    if (activeTab === 'crate') {
      setCrateData({
        crate_number: '',
        width: '',
        length: '',
        height: '',
        gross_weight: '',
        net_weight: ''
      });
    } else {
      setPackageData({
        package: '',
        pn: '',
        description: '',
        nsn: '',
        qty: '',
        item_number: '',
        manufactur_code: ''
      });
    }
  };

  // Save individual code as PNG
  const saveIndividualPNG = async (code: GeneratedCode) => {
    const canvas = code.canvasRef.current;
    if (!canvas) {
      alert(`Canvas tidak ditemukan untuk ${code.fieldLabel}!`);
      return;
    }

    try {
      const link = document.createElement('a');
      const fileName = `${codeType}-${code.fieldLabel.replace(/[^a-zA-Z0-9]/g, '_')}-${code.value.replace(/[^a-zA-Z0-9]/g, '_')}-${Date.now()}.png`;
      link.download = fileName;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error(`Error saving ${codeType}:`, error);
      alert(`Gagal menyimpan ${codeType === 'barcode' ? 'barcode' : 'QR code'}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Save all codes as ZIP (future enhancement could be added here)
  const saveAllPNG = async () => {
    if (generatedCodes.length === 0) {
      alert('Tidak ada code untuk disimpan!');
      return;
    }

    // For now, download each individually
    for (const code of generatedCodes) {
      await saveIndividualPNG(code);
      // Small delay between downloads
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
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

      {/* Data Type Toggle */}
      <div className="mb-6">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('crate')}
            disabled={isGenerating}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              activeTab === 'crate'
                ? 'bg-green-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-800'
            } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            📦 Crate Data
          </button>
          <button
            onClick={() => setActiveTab('package')}
            disabled={isGenerating}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              activeTab === 'package'
                ? 'bg-green-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-800'
            } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            📋 Package Data
          </button>
        </div>
      </div>

      {/* Form Fields */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
        {activeTab === 'crate' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Crate Number
              </label>
              <input
                type="text"
                value={crateData.crate_number}
                onChange={(e) => setCrateData({...crateData, crate_number: e.target.value})}
                placeholder="Enter crate number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white text-gray-900 placeholder-gray-500"
                disabled={isGenerating}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Width
              </label>
              <input
                type="text"
                value={crateData.width}
                onChange={(e) => setCrateData({...crateData, width: e.target.value})}
                placeholder="Width (e.g. 100cm)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white text-gray-900 placeholder-gray-500"
                disabled={isGenerating}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Length
              </label>
              <input
                type="text"
                value={crateData.length}
                onChange={(e) => setCrateData({...crateData, length: e.target.value})}
                placeholder="Length (e.g. 200cm)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white text-gray-900 placeholder-gray-500"
                disabled={isGenerating}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Height
              </label>
              <input
                type="text"
                value={crateData.height}
                onChange={(e) => setCrateData({...crateData, height: e.target.value})}
                placeholder="Height (e.g. 150cm)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white text-gray-900 placeholder-gray-500"
                disabled={isGenerating}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gross Weight
              </label>
              <input
                type="text"
                value={crateData.gross_weight}
                onChange={(e) => setCrateData({...crateData, gross_weight: e.target.value})}
                placeholder="Gross weight (e.g. 50kg)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white text-gray-900 placeholder-gray-500"
                disabled={isGenerating}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Net Weight
              </label>
              <input
                type="text"
                value={crateData.net_weight}
                onChange={(e) => setCrateData({...crateData, net_weight: e.target.value})}
                placeholder="Net weight (e.g. 45kg)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white text-gray-900 placeholder-gray-500"
                disabled={isGenerating}
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Package
              </label>
              <input
                type="text"
                value={packageData.package}
                onChange={(e) => setPackageData({...packageData, package: e.target.value})}
                placeholder="Package name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white text-gray-900 placeholder-gray-500"
                disabled={isGenerating}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                P/N (Part Number)
              </label>
              <input
                type="text"
                value={packageData.pn}
                onChange={(e) => setPackageData({...packageData, pn: e.target.value})}
                placeholder="Part number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white text-gray-900 placeholder-gray-500"
                disabled={isGenerating}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <input
                type="text"
                value={packageData.description}
                onChange={(e) => setPackageData({...packageData, description: e.target.value})}
                placeholder="Item description"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white text-gray-900 placeholder-gray-500"
                disabled={isGenerating}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                NSN
              </label>
              <input
                type="text"
                value={packageData.nsn}
                onChange={(e) => setPackageData({...packageData, nsn: e.target.value})}
                placeholder="National Stock Number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white text-gray-900 placeholder-gray-500"
                disabled={isGenerating}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                QTY (Quantity)
              </label>
              <input
                type="text"
                value={packageData.qty}
                onChange={(e) => setPackageData({...packageData, qty: e.target.value})}
                placeholder="Quantity"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white text-gray-900 placeholder-gray-500"
                disabled={isGenerating}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Item Number
              </label>
              <input
                type="text"
                value={packageData.item_number}
                onChange={(e) => setPackageData({...packageData, item_number: e.target.value})}
                placeholder="Item number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white text-gray-900 placeholder-gray-500"
                disabled={isGenerating}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Manufacturer Code
              </label>
              <input
                type="text"
                value={packageData.manufactur_code}
                onChange={(e) => setPackageData({...packageData, manufactur_code: e.target.value})}
                placeholder="Manufacturer code"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white text-gray-900 placeholder-gray-500"
                disabled={isGenerating}
              />
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mb-4 flex gap-3">
        <button
          onClick={generateAllCodes}
          disabled={isGenerating}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
            isGenerating
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
              {codeType === 'barcode' ? '📊 Generate All Barcodes' : '📱 Generate All QR Codes'}
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

        {generatedCodes.length > 0 && (
          <button
            onClick={saveAllPNG}
            disabled={isGenerating}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isGenerating
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            💾 Save All
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">❌ {error}</p>
        </div>
      )}

      {/* Codes Display */}
      {generatedCodes.length > 0 ? (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Generated {codeType === 'barcode' ? 'Barcodes' : 'QR Codes'} ({generatedCodes.length})
          </h3>
          <div className={`grid gap-4 ${
            codeType === 'barcode' 
              ? 'grid-cols-1 md:grid-cols-2' 
              : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
          }`}>
            {generatedCodes.map((code) => (
              <div 
                key={code.fieldKey}
                className="border border-gray-200 rounded-lg p-4 bg-gray-50"
              >
                <div className="text-center mb-3">
                  <h4 className="text-sm font-medium text-gray-700">{code.fieldLabel}</h4>
                  <p className="text-xs text-gray-500 break-all">{code.value}</p>
                </div>
                
                <div className="flex justify-center mb-3">
                  <canvas
                    id={`canvas-${code.fieldKey}`}
                    width={codeType === 'qrcode' ? 120 : 280}
                    height={codeType === 'qrcode' ? 120 : 80}
                    style={{
                      border: '0',
                      borderRadius: '0',
                      backgroundColor: 'transparent'
                    }}
                  />
                </div>
                
                <button
                  onClick={() => saveIndividualPNG(code)}
                  className="w-full py-2 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                >
                  💾 Save PNG
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div 
          ref={containerRef}
          className={`border border-gray-200 rounded-lg p-6 mb-4 flex flex-col items-center justify-center ${
            codeType === 'barcode' ? 'min-h-[140px]' : 'min-h-[180px]'
          }`}
          style={{
            backgroundColor: 'transparent',
            border: '1px solid #e5e7eb',
            borderRadius: '8px'
          }}
        >
          <div className="text-center text-gray-400" style={{ color: '#9ca3af' }}>
            {isGenerating ? (
              <>
                <div className="text-4xl mb-2">
                  <span className="inline-block animate-spin">⏳</span>
                </div>
                <p className="text-sm" style={{ fontSize: '14px' }}>
                  Generating {codeType === 'barcode' ? 'barcodes' : 'QR codes'}...
                </p>
              </>
            ) : (
              <>
                <div className="text-4xl mb-2">{codeType === 'barcode' ? '📊' : '📱'}</div>
                <p className="text-sm" style={{ fontSize: '14px' }}>
                  Isi form {activeTab === 'crate' ? 'Crate Data' : 'Package Data'} lalu klik "Generate All"
                </p>
                <p className="text-xs mt-1 text-gray-500" style={{ fontSize: '12px', color: '#6b7280' }}>
                  Setiap field terisi akan menghasilkan {codeType === 'barcode' ? 'barcode' : 'QR code'} sendiri
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Info */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        <p>
          {codeType === 'barcode' 
            ? 'Format: CODE128 • Multiple Codes • Transparent Background'
            : 'QR Code • Error Correction: Medium • Multiple Codes • Transparent'
          }
        </p>
        <p className="mt-1">
          💡 Mode: {activeTab === 'crate' ? '📦 Crate Data' : '📋 Package Data'} • 
          {generatedCodes.length > 0 
            ? ` ${generatedCodes.length} code${generatedCodes.length > 1 ? 's' : ''} generated`
            : ' Isi field untuk generate multiple codes sekaligus'
          }
        </p>
      </div>
    </div>
  );
}
