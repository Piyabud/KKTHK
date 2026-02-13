import { useCallback, useRef, useState } from 'react'
import { BrowserMultiFormatReader } from '@zxing/library'

export function useBarcodeScanner() {
  const [decodedText, setDecodedText] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const readerRef = useRef<BrowserMultiFormatReader | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const getReader = useCallback(() => {
    if (!readerRef.current) {
      readerRef.current = new BrowserMultiFormatReader()
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
        setError(message)
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

  const stopCameraRef = useRef(stopCamera)
  stopCameraRef.current = stopCamera

  /** เริ่มสแกนจากกล้อง (continuous decode with callback) */
  const startCamera = useCallback(
    async (videoElement: HTMLVideoElement) => {
      setError(null)
      setDecodedText(null)
      videoRef.current = videoElement
      try {
        const reader = getReader()
        setIsScanning(true)
        await reader.decodeFromVideoDevice(
          null,
          videoElement,
          (result, err) => {
            if (result) {
              const text = result.getText()
              setDecodedText(text)
              reader.reset()
              stopCameraRef.current()
            }
            if (err) {
              // NotFoundException เป็นเรื่องปกติเมื่อยังสแกนไม่เจอ
            }
          }
        )
      } catch (e) {
        setIsScanning(false)
        const message =
          e instanceof Error ? e.message : 'ไม่สามารถเปิดกล้องได้'
        setError(message)
      }
    },
    [getReader]
  )

  return {
    decodedText,
    error,
    isScanning,
    decodeFromFile,
    startCamera,
    stopCamera,
    setDecodedText,
    setError,
  }
}
