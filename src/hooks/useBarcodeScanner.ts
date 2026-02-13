import { useCallback, useRef, useState } from 'react'
import { BrowserMultiFormatReader, DecodeHintType } from '@zxing/library'

/** สร้าง reader ที่ตั้งค่าให้สแกนบาร์โค้ดได้ดีขึ้น (TRY_HARDER = ความละเอียดสูงขึ้น) */
function createReader() {
  const hints = new Map()
  hints.set(DecodeHintType.TRY_HARDER, true)
  return new BrowserMultiFormatReader(hints)
}

function toFriendlyError(message: string): string {
  if (
    message.includes('No MultiFormat Readers') ||
    message.includes('detect the code')
  ) {
    return 'ไม่พบบาร์โค้ดในรูป ลองจัดให้บาร์โค้ดชัดเจนหรือใช้รูปจากอัลบั้ม'
  }
  return message || 'ไม่พบบาร์โค้ดในรูป'
}

export function useBarcodeScanner() {
  const [decodedText, setDecodedText] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)
  const readerRef = useRef<BrowserMultiFormatReader | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const getReader = useCallback(() => {
    if (!readerRef.current) {
      readerRef.current = createReader()
    }
    return readerRef.current
  }, [])

  /** สแกนจากไฟล์รูป (อัลบั้ม) */
  const decodeFromFile = useCallback(
    async (file: File) => {
      setError(null)
      setDecodedText(null)
      const url = URL.createObjectURL(file)
      try {
        const reader = getReader()
        const result = await reader.decodeFromImageUrl(url)
        const text = result.getText()
        setDecodedText(text)
        return text
      } catch (e) {
        const message = e instanceof Error ? e.message : 'ไม่พบบาร์โค้ดในรูป'
        setError(toFriendlyError(message))
        return null
      } finally {
        URL.revokeObjectURL(url)
      }
    },
    [getReader]
  )

  /** หยุดกล้อง */
  const stopCamera = useCallback(() => {
    setIsScanning(false)
    setIsCapturing(false)
    readerRef.current?.reset()
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
      videoRef.current = null
    }
  }, [])

  /** เปิดกล้องแบบพรีวิว (ไม่สแกนต่อเนื่อง) */
  const startCamera = useCallback(
    async (videoElement: HTMLVideoElement) => {
      setError(null)
      setDecodedText(null)
      videoRef.current = videoElement
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        })
        streamRef.current = stream
        videoElement.srcObject = stream
        await videoElement.play()
        setIsScanning(true)
      } catch (e) {
        const message =
          e instanceof Error ? e.message : 'ไม่สามารถเปิดกล้องได้'
        setError(message)
      }
    },
    []
  )

  /** ถ่ายหนึ่งรูปจากกล้องแล้วสแกนบาร์โค้ด (ขยาย 2 เท่าเพื่อให้สแกนบาร์โค้ดได้ดีขึ้น) */
  const captureAndDecode = useCallback(async () => {
    const video = videoRef.current
    if (!video || !streamRef.current || isCapturing) return
    setIsCapturing(true)
    setError(null)
    const scale = 2
    const w = video.videoWidth
    const h = video.videoHeight
    const canvas = document.createElement('canvas')
    canvas.width = w * scale
    canvas.height = h * scale
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      setIsCapturing(false)
      setError('ไม่สามารถถ่ายรูปได้')
      return
    }
    ctx.drawImage(video, 0, 0, w, h, 0, 0, canvas.width, canvas.height)
    const url = canvas.toDataURL('image/png')
    try {
      const reader = getReader()
      const result = await reader.decodeFromImageUrl(url)
      const text = result.getText()
      setDecodedText(text)
      stopCamera()
    } catch (e) {
      const message = e instanceof Error ? e.message : 'ไม่พบบาร์โค้ดในรูป'
      setError(toFriendlyError(message))
    } finally {
      setIsCapturing(false)
    }
  }, [getReader, stopCamera, isCapturing])

  return {
    decodedText,
    error,
    isScanning,
    isCapturing,
    decodeFromFile,
    startCamera,
    stopCamera,
    captureAndDecode,
    setDecodedText,
    setError,
  }
}
