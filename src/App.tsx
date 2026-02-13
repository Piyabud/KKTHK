import { useBarcodeScanner } from './hooks/useBarcodeScanner'
import { getBallotBookId, validateBallotId } from './utils/ballot'

function App() {
  const {
    decodedText,
    error: scanError,
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

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-center text-white-500 mb-2">
          สแกนบาร์โค้ดบัตรเลือกตั้ง
        </h1>
        <p className="text-center text-slate-400 text-sm mb-6">
          กรอกเลขบัตรเลือกตั้งด้านล่างเพื่อคำนวณเล่มบัตร
        </p>

        {/* กล้อง + อัปโหลด: Coming soon */}
        <div className="rounded-xl border border-slate-600 bg-slate-800/40 mb-6 py-12 flex flex-col items-center justify-center gap-2">
          <span className="text-2xl font-semibold text-slate-400 tracking-widest">
            Coming soon
          </span>
          <span className="text-slate-500 text-sm">
            สแกนบาร์โค้ดและอัปโหลดรูปจะเปิดให้ใช้เร็วๆ นี้
          </span>
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
            <span className="text-green-500 font-bold text-[48px]">
              {resultBook}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
