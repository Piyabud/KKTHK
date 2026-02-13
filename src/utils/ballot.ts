/**
 * คำนวณเล่มบัตรจากเลขบัตรเลือกตั้ง
 * รูปแบบ ballotId: ตัวอักษรนำ (prefix) + ตัวเลข เช่น A0000001
 */
export function getBallotBookId(ballotId: string): string {
  const BOOK_SIZE = 20
  const prefix = ballotId[0]
  const ballotNumber = Number(ballotId.slice(1))

  return `เล่มที่ : ${prefix}${(Math.floor(ballotNumber / BOOK_SIZE) + 1)
    .toString()
    .padStart(7, '0')}`
}

export interface ValidateBallotResult {
  valid: boolean
  error?: string
}

/**
 * ตรวจสอบรูปแบบเลขบัตรเลือกตั้ง
 * - ต้องมีอย่างน้อย 2 ตัว (prefix + อย่างน้อย 1 หลัก)
 * - หลัง prefix ต้องเป็นตัวเลขเท่านั้น
 */
export function validateBallotId(input: string): ValidateBallotResult {
  const trimmed = input.trim()

  if (!trimmed || trimmed.length < 2) {
    return { valid: false, error: 'กรอกเลขบัตรเลือกตั้งให้ถูกต้อง' }
  }

  const numberPart = trimmed.slice(1)
  if (!/^\d+$/.test(numberPart)) {
    return { valid: false, error: 'รูปแบบบัตรเลือกตั้งไม่ถูกต้อง' }
  }

  return { valid: true }
}
