# 📊 Barcode & QR Code Generator Apps

Aplikasi web modern untuk generate **Barcode CODE128** dan **QR Code** dengan fitur export PNG. Dibangun menggunakan Next.js 15, TypeScript, dan TailwindCSS dengan UI yang responsif dan user-friendly.

## ✨ Fitur Utama

- 🔄 **Dual Mode Generator**: Barcode CODE128 dan QR Code dalam satu aplikasi
- 📱 **Responsive Design**: Optimal di desktop dan mobile
- 💾 **Export PNG**: Download barcode/QR code berkualitas tinggi
- ⚡ **Real-time Generation**: Generate code secara instant
- 🎨 **Modern UI**: Clean design dengan TailwindCSS
- 🔄 **Mode Switching**: Toggle seamless antara barcode dan QR code
- ⌨️ **Keyboard Support**: Tekan Enter untuk generate
- 🧹 **Clear Function**: Reset input dan output dengan mudah

## 🛠 Tech Stack

| Technology | Version | Description |
|------------|---------|-------------|
| **Next.js** | 15.4.7 | React framework untuk production |
| **React** | 19.1.0 | UI library dengan hooks |
| **TypeScript** | ^5 | Type safety dan better DX |
| **TailwindCSS** | ^4 | Utility-first CSS framework |
| **JsBarcode** | ^3.12.1 | Library untuk generate barcode |
| **QRCode** | Latest | Library untuk generate QR code |
| **html2canvas** | Latest | Convert HTML elements ke PNG |

## 📁 Struktur Project

```
barcode-apps/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── globals.css         # Global styles
│   │   ├── layout.tsx          # Root layout component
│   │   └── page.tsx            # Homepage
│   └── components/             # React components
│       └── BarcodeGenerator.tsx # Main generator component
├── public/                     # Static assets
├── package.json               # Dependencies & scripts
├── tsconfig.json             # TypeScript configuration
├── tailwind.config.js        # TailwindCSS configuration
└── next.config.ts            # Next.js configuration
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm atau yarn

### Installation

1. **Clone repository**
```bash
git clone <repository-url>
cd barcode-apps
```

2. **Install dependencies**
```bash
npm install
```

3. **Run development server**
```bash
npm run dev
```

4. **Open aplikasi**
```
http://localhost:3000
```

## 📖 Dokumentasi Komponen

### 🎯 BarcodeGenerator Component

Komponen utama yang mengelola generation barcode dan QR code.

#### Props & State

```typescript
// Types
type CodeType = 'barcode' | 'qrcode';

// State Management
const [inputText, setInputText] = useState<string>('');     // Input text dari user
const [displayText, setDisplayText] = useState<string>(''); // Text yang ditampilkan
const [isGenerating, setIsGenerating] = useState<boolean>(false); // Loading state
const [error, setError] = useState<string>('');            // Error messages
const [codeType, setCodeType] = useState<CodeType>('barcode'); // Mode: barcode/qrcode
```

#### Key Functions

##### 🔄 `generateCode()`
```typescript
const generateCode = () => {
  // 1. Validasi input text
  // 2. Set loading state
  // 3. Clear canvas previous content
  // 4. Generate barcode atau QR code berdasarkan mode
  // 5. Update display state
}
```

**Barcode Generation:**
```typescript
JsBarcode(canvas, inputText.trim(), {
  format: "CODE128",        // Standard barcode format
  width: 2,                // Line width
  height: 80,              // Barcode height
  displayValue: true,      // Show text below barcode
  fontSize: 14,            // Text size
  textMargin: 8,          // Space between bars and text
  background: "#ffffff",   // White background
  lineColor: "#000000",   // Black lines
  margin: 10              // Margin around barcode
});
```

**QR Code Generation:**
```typescript
await QRCode.toCanvas(canvas, inputText.trim(), {
  width: 200,             // QR code size
  margin: 2,              // Margin around QR
  color: {
    dark: '#000000',      // Dark squares
    light: '#ffffff'      // Light background
  }
});
```

##### 🧹 `clearCode()`
```typescript
const clearCode = () => {
  // 1. Clear canvas content
  // 2. Reset semua state ke default
  // 3. Clear error messages
}
```

##### 💾 `saveAsPNG()`
```typescript
const saveAsPNG = async () => {
  // 1. Validasi ada content untuk disave
  // 2. Override styles untuk menghindari OKLCH color issues
  // 3. Capture element menggunakan html2canvas
  // 4. Convert ke PNG dan trigger download
  // 5. Restore original styles
}
```

#### Event Handlers

```typescript
// Mode switching dengan auto-regenerate
useEffect(() => {
  // Clear canvas saat mode berubah
  // Reset display state
  // Auto-regenerate jika ada input text
}, [codeType]);

// Enter key support
onKeyPress={(e) => e.key === 'Enter' && generateCode()}
```

### 🎨 UI Components

#### Mode Toggle
```tsx
<div className="flex bg-gray-100 rounded-lg p-1">
  <button onClick={() => setCodeType('barcode')}>
    📊 Barcode
  </button>
  <button onClick={() => setCodeType('qrcode')}>
    📱 QR Code
  </button>
</div>
```

#### Dynamic Canvas
```tsx
<canvas
  key={`canvas-${codeType}`}           // Force remount on mode change
  ref={canvasRef}
  width={codeType === 'qrcode' ? 250 : 500}
  height={codeType === 'qrcode' ? 250 : 120}
  className={`${displayText ? 'block' : 'hidden'}`}
/>
```

#### Responsive Container
```tsx
<div className={`w-full mx-auto bg-white rounded-lg shadow-lg p-6 ${
  codeType === 'barcode' ? 'max-w-2xl' : 'max-w-md'  // Dynamic width
}`}>
```

## 🎮 Cara Penggunaan

### 1. Generate Barcode
1. Pilih tab "📊 Barcode"
2. Masukkan text di input field
3. Klik "Generate Barcode" atau tekan Enter
4. Barcode akan muncul dengan text terintegrasi di bawah
5. Klik "💾 Simpan sebagai PNG" untuk download

### 2. Generate QR Code  
1. Pilih tab "📱 QR Code"
2. Masukkan text/URL di input field
3. Klik "Generate QR Code" atau tekan Enter
4. QR code akan muncul dengan text terpisah di bawah
5. Klik "💾 Simpan sebagai PNG" untuk download

### 3. Fitur Tambahan
- **Clear**: Reset semua input dan output
- **Mode Switching**: Otomatis regenerate saat ganti mode
- **Error Handling**: Pesan error yang informatif
- **Loading States**: Visual feedback saat processing

## 🔧 Development

### Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Linting
npm run lint
```

### Environment Setup

```bash
# Install dependencies
npm install

# Add new dependency
npm install <package-name>

# Update dependencies
npm update
```

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Next.js recommended rules
- **Prettier**: Code formatting (optional)
- **Component Structure**: Functional components with hooks

## 📱 Responsive Breakpoints

| Device | Width | Container Max Width |
|--------|-------|-------------------|
| Mobile | < 640px | 100% |
| Tablet | 640px - 1024px | max-w-md / max-w-2xl |
| Desktop | > 1024px | max-w-md / max-w-2xl |

## 🐛 Troubleshooting

### Common Issues

1. **Canvas tidak muncul**
   - Pastikan browser support HTML5 Canvas
   - Check console untuk error messages

2. **Export PNG gagal**
   - Issue dengan OKLCH colors → Fixed dengan inline styles
   - Check browser permissions untuk download

3. **Mode switching bermasalah**
   - Canvas di-clear otomatis saat mode berubah
   - Auto-regenerate jika ada input text

### Debug Mode

Buka Developer Console (F12) untuk melihat logs:
```
- Canvas ref status: Available/Not available
- Canvas dimensions: 500x120 / 250x250  
- Barcode/QR generated successfully
```

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set domain (optional)
vercel --prod
```

### Manual Build
```bash
# Create production build
npm run build

# Start production server
npm start
```

## 📄 License

MIT License - bebas digunakan untuk personal dan komersial.

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -am 'Add new feature'`)
4. Push branch (`git push origin feature/new-feature`) 
5. Create Pull Request

---

**Built with ❤️ using Next.js 15 & TypeScript**
