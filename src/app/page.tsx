import BarcodeGenerator from "@/components/BarcodeGenerator";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Barcode & QR Code Apps
          </h1>
          <p className="text-gray-600 text-lg">
            Generator Barcode & QR Code dengan Fitur Save PNG
          </p>
        </div>

        {/* Main Content */}
        <div className="flex justify-center">
          <BarcodeGenerator />
        </div>

        {/* Footer Info */}
        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>
            Built with Next.js • Powered by JsBarcode, QRCode & html2canvas
          </p>
          <div className="mt-2 flex justify-center gap-4 text-xs">
            <span>📊 Barcode</span>
            <span>📱 QR Code</span>
            <span>💾 PNG Export</span>
            <span>⚡ Real-time</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
