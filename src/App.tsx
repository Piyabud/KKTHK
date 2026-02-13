import { useRef } from 'react'
import { useBarcodeScanner } from './hooks/useBarcodeScanner'
import { getBallotBookId, validateBallotId } from './utils/ballot'

function App() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    decodedText,
    error: scanError,
    isScanning,
    isCapturing,
    decodeFromFile,
    startCamera,
    stopCamera,
    captureAndDecode,
    setDecodedText,
    setError: setScanError,
  } = useBarcodeScanner()

  const ballotInput = decodedText ?? ''
  const validation = validateBallotId(ballotInput)
  const resultBook = validation.valid ? getBallotBookId(ballotInput.trim()) : ''
  const showError = !validation.valid && ballotInput.length > 0 ? validation.error : scanError

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.trim() || null
    setDecodedText(v)
    if (v) setScanError(null)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    await decodeFromFile(file)
    e.target.value = ''
  }

  const handleStartCamera = () => {
    if (videoRef.current) startCamera(videoRef.current)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-center text-white-500 mb-2">
          สแกนบาร์โค้ดบัตรเลือกตั้ง
        </h1>
        <p className="text-center text-slate-400 text-sm mb-6">
          เปิดกล้องแล้วกดถ่ายหนึ่งรูป หรืออัปโหลดรูปจากอัลบั้ม
        </p>

        {/* กล้อง */}
        <div className="rounded-xl overflow-hidden bg-black/40 border border-slate-600 mb-4 aspect-video flex items-center justify-center">
          {!isScanning ? (
            <div className="flex flex-col items-center gap-3 text-slate-400">
              <svg
                className="w-16 h-16"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
              </svg>
              <span className="text-sm">กดเปิดกล้อง แล้วกดถ่ายรูป หรืออัปโหลดรูปจากอัลบั้ม</span>
            </div>
          ) : null}
          <video
            ref={videoRef}
            className={`w-full h-full object-cover ${!isScanning ? 'hidden' : ''}`}
            muted
            playsInline
          />
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {!isScanning ? (
            <>
              <button
                type="button"
                onClick={handleStartCamera}
                className="flex-1 min-w-[140px] py-3 px-4 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-medium transition"
              >
                เปิดกล้อง
              </button>
              <label className="flex-1 min-w-[140px] py-3 px-4 rounded-lg bg-slate-600 hover:bg-slate-500 text-white font-medium text-center cursor-pointer transition">
                อัปโหลดรูปจากอัลบั้ม
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={captureAndDecode}
                disabled={isCapturing}
                className="flex-1 min-w-[140px] py-3 px-4 rounded-lg bg-green-500 hover:bg-green-600 disabled:opacity-50 text-slate-900 font-medium transition"
              >
                {isCapturing ? 'กำลังสแกน...' : 'ถ่ายรูป'}
              </button>
              <button
                type="button"
                onClick={stopCamera}
                className="py-3 px-4 rounded-lg bg-slate-600 hover:bg-slate-500 text-white font-medium transition"
              >
                ปิดกล้อง
              </button>
            </>
          )}
        </div>

        {/* กรอกมือ */}
        <div className="mb-4">
          <label className="block text-sm text-slate-400 mb-1">
            หรือกรอกเลขบัตรเลือกตั้ง
          </label>
          <div className="flex gap-2">
            <input
              id="ballotInput"
              type="text"
              value={ballotInput}
              onChange={handleInputChange}
              placeholder="เช่น A0000001"
              className="flex-1 rounded-lg bg-slate-800 border border-slate-600 px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <button
              type="button"
              id="generateBtn"
              className="py-3 px-5 rounded-lg bg-green-500 hover:bg-green-600 text-slate-900 font-medium transition"
            >
              คำนวณ
            </button>
          </div>
        </div>

        {/* ค่าจากบาร์โค้ด/ที่กรอก */}
        {ballotInput && (
          <div className="mb-2 rounded-lg bg-slate-800/80 px-4 py-2 border border-slate-600">
            <span className="text-slate-400 text-sm">เลขบัตร: </span>
            <span className="font-mono text-yellow-500">{ballotInput}</span>
          </div>
        )}

        {/* ข้อความ error */}
        {showError && (
          <div
            id="error"
            className="mb-3 rounded-lg bg-red-500/20 border border-red-500/50 px-4 py-2 text-red-300 text-sm"
          >
            {showError}
          </div>
        )}

        {/* ผลลัพธ์เล่มบัตร */}
        {resultBook && (
          <div
            id="result"
            className="rounded-xl bg-red-500/20 border border-red-500/50 px-5 py-4 text-center"
          >
            <span className="text-red-500 font-semibold text-lg">
              {resultBook}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
