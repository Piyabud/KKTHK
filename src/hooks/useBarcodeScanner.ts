import { useCallback, useRef, useState } from 'react'
import Quagga from '@ericblade/quagga2'

/** คอนฟิกสำหรับสแกนบาร์โค้ด 1D (บัตรเลือกตั้ง) - ใช้หลาย reader เพื่อความครอบคลุม */
function getDecodeConfig(src: string): Parameters<typeof Quagga.decodeSingle>[0] {
  return {
    src,
    decoder: {
      readers: [
        'code_128_reader',
        'code_39_reader',
        'ean_reader',
        'ean_8_reader',
        'upc_reader',
        'upc_e_reader',
        'codabar_reader',
        'i2of5_reader',
        '2of5_reader',
        'code_93_reader',
      ],
    },
    locate: true,
    inputStream: { size: 1200 },
  }
}

async function decodeImage(src: string): Promise<string> {
  const result = await Quagga.decodeSingle(getDecodeConfig(src))
  if (result?.codeResult?.code) {
    return result.codeResult.code
  }
  throw new Error('ไม่พบบาร์โค้ดในรูป')
}

function toFriendlyError(message: string): string {
  return message || 'ไม่พบบาร์โค้ดในรูป ลองจัดให้บาร์โค้ดชัดเจนหรือใช้รูปจากอัลบั้ม'
}

export function useBarcodeScanner() {
  const [decodedText, setDecodedText] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  /** สแกนจากไฟล์รูป (อัลบั้ม) */
  const decodeFromFile = useCallback(async (file: File) => {
    setError(null)
    setDecodedText(null)
    const url = URL.createObjectURL(file)
    try {
      const text = await decodeImage(url)
      setDecodedText(text)
      return text
    } catch (e) {
      const message = e instanceof Error ? e.message : 'ไม่พบบาร์โค้ดในรูป'
      setError(toFriendlyError(message))
      return null
    } finally {
      URL.revokeObjectURL(url)
    }
  }, [])

  /** หยุดกล้อง */
  const stopCamera = useCallback(async () => {
    setIsScanning(false)
    setIsCapturing(false)
    try {
      await Quagga.CameraAccess.release()
    } catch {
      // ignore
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
      videoRef.current = null
    }
  }, [])

  /** เปิดกล้องแบบพรีวิว */
  const startCamera = useCallback(
    async (videoElement: HTMLVideoElement) => {
      setError(null)
      setDecodedText(null)
      videoRef.current = videoElement
      try {
        await Quagga.CameraAccess.request(videoElement, {
          facingMode: 'environment',
        })
        setIsScanning(true)
      } catch (e) {
        const message =
          e instanceof Error ? e.message : 'ไม่สามารถเปิดกล้องได้'
        setError(message)
      }
    },
    []
  )

  /** ถ่ายหนึ่งรูปจากกล้องแล้วสแกนบาร์โค้ด */
  const captureAndDecode = useCallback(async () => {
    const video = videoRef.current
    if (!video?.srcObject || isCapturing) return
    setIsCapturing(true)
    setError(null)
    const canvas = document.createElement('canvas')
    const w = video.videoWidth
    const h = video.videoHeight
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      setIsCapturing(false)
      setError('ไม่สามารถถ่ายรูปได้')
      return
    }
    ctx.drawImage(video, 0, 0)
    const dataUrl = canvas.toDataURL('image/png')
    try {
      const text = await decodeImage(dataUrl)
      setDecodedText(text)
      await stopCamera()
    } catch (e) {
      const message = e instanceof Error ? e.message : 'ไม่พบบาร์โค้ดในรูป'
      setError(toFriendlyError(message))
    } finally {
      setIsCapturing(false)
    }
  }, [stopCamera, isCapturing])

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
