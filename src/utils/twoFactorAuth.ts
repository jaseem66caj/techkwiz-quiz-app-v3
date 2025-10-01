// Two-Factor Authentication service
import { settingsDataManager } from './settingsDataManager'

interface TwoFactorSetup {
  secret: string
  qrCode: string
  backupCodes: string[]
}

interface TwoFactorVerification {
  success: boolean
  message: string
  remainingAttempts?: number
}

class TwoFactorAuthService {
  private static instance: TwoFactorAuthService
  private readonly TOTP_WINDOW = 30 // 30 seconds
  private readonly BACKUP_CODE_LENGTH = 8
  private readonly MAX_ATTEMPTS = 3

  static getInstance(): TwoFactorAuthService {
    if (!TwoFactorAuthService.instance) {
      TwoFactorAuthService.instance = new TwoFactorAuthService()
    }
    return TwoFactorAuthService.instance
  }

  // Generate a random secret for TOTP
  private generateSecret(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
    let secret = ''
    for (let i = 0; i < 32; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return secret
  }

  // Generate backup codes
  private generateBackupCodes(): string[] {
    const codes: string[] = []
    for (let i = 0; i < 10; i++) {
      let code = ''
      for (let j = 0; j < this.BACKUP_CODE_LENGTH; j++) {
        code += Math.floor(Math.random() * 10).toString()
      }
      codes.push(code)
    }
    return codes
  }

  // Generate QR code data URL
  private generateQRCode(secret: string, accountName: string = 'TechKwiz Admin'): string {
    const issuer = 'TechKwiz'

    // In a real implementation, you would use a QR code library
    // For now, we'll return a placeholder data URL
    const canvas = document.createElement('canvas')
    canvas.width = 200
    canvas.height = 200
    const ctx = canvas.getContext('2d')!
    
    // Simple QR code placeholder
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, 200, 200)
    ctx.fillStyle = '#FFFFFF'
    ctx.font = '12px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('QR Code', 100, 90)
    ctx.fillText('Scan with', 100, 110)
    ctx.fillText('Authenticator App', 100, 130)
    ctx.fillText(`${issuer} • ${accountName}`, 100, 150)
    
    return canvas.toDataURL()
  }

  // Setup 2FA for user
  async setup2FA(accountName?: string): Promise<TwoFactorSetup> {
    try {
      const secret = this.generateSecret()
      const qrCode = this.generateQRCode(secret, accountName)
      const backupCodes = this.generateBackupCodes()

      // Store setup data temporarily (not enabled yet)
      const setupData = {
        secret,
        backupCodes,
        setupTime: Date.now(),
        verified: false
      }

      localStorage.setItem('admin_2fa_setup', JSON.stringify(setupData))

      return {
        secret,
        qrCode,
        backupCodes
      }
    } catch (error) {
      throw new Error('Failed to setup 2FA: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  // Verify setup code and enable 2FA
  async verifySetup(code: string): Promise<TwoFactorVerification> {
    try {
      const setupData = localStorage.getItem('admin_2fa_setup')
      if (!setupData) {
        return {
          success: false,
          message: '2FA setup not found. Please start setup again.'
        }
      }

      const setup = JSON.parse(setupData)
      const isValid = this.verifyTOTP(setup.secret, code)

      if (isValid) {
        // Enable 2FA
        const twoFactorData = {
          enabled: true,
          secret: setup.secret,
          backupCodes: setup.backupCodes,
          enabledAt: Date.now(),
          lastUsed: null
        }

        localStorage.setItem('admin_2fa_data', JSON.stringify(twoFactorData))
        localStorage.removeItem('admin_2fa_setup')

        // Update security settings
        const securitySettings = settingsDataManager.getSecuritySettings()
        securitySettings.twoFactorAuth = {
          enabled: true,
          methods: ['authenticator']
        }
        settingsDataManager.saveSecuritySettings(securitySettings)

        return {
          success: true,
          message: '2FA enabled successfully!'
        }
      } else {
        return {
          success: false,
          message: 'Invalid verification code. Please try again.'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: 'Verification failed: ' + (error instanceof Error ? error.message : 'Unknown error')
      }
    }
  }

  // Verify TOTP code
  private verifyTOTP(secret: string, code: string): boolean {
    const currentTime = Math.floor(Date.now() / 1000)
    const timeWindow = Math.floor(currentTime / this.TOTP_WINDOW)

    // Check current window and ±1 window for clock drift
    for (let i = -1; i <= 1; i++) {
      const testWindow = timeWindow + i
      const expectedCode = this.generateTOTP(secret, testWindow)
      if (expectedCode === code) {
        return true
      }
    }

    return false
  }

  // Generate TOTP code (simplified implementation)
  private generateTOTP(secret: string, timeWindow: number): string {
    // This is a simplified TOTP implementation
    // In production, use a proper TOTP library like 'otplib'
    const hash = this.simpleHash(secret + timeWindow.toString())
    const code = (hash % 1000000).toString().padStart(6, '0')
    return code
  }

  // Simple hash function (replace with proper HMAC-SHA1 in production)
  private simpleHash(input: string): number {
    let hash = 0
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }

  // Verify 2FA code during login
  async verify2FA(code: string): Promise<TwoFactorVerification> {
    try {
      const twoFactorData = localStorage.getItem('admin_2fa_data')
      if (!twoFactorData) {
        return {
          success: false,
          message: '2FA not enabled'
        }
      }

      const data = JSON.parse(twoFactorData)
      if (!data.enabled) {
        return {
          success: false,
          message: '2FA not enabled'
        }
      }

      // Check if it's a backup code
      if (data.backupCodes.includes(code)) {
        // Remove used backup code
        data.backupCodes = data.backupCodes.filter((c: string) => c !== code)
        data.lastUsed = Date.now()
        localStorage.setItem('admin_2fa_data', JSON.stringify(data))

        return {
          success: true,
          message: 'Backup code verified successfully'
        }
      }

      // Verify TOTP code
      const isValid = this.verifyTOTP(data.secret, code)
      if (isValid) {
        data.lastUsed = Date.now()
        localStorage.setItem('admin_2fa_data', JSON.stringify(data))

        return {
          success: true,
          message: '2FA code verified successfully'
        }
      } else {
        // Track failed attempts
        const attempts = this.getFailedAttempts()
        const newAttempts = attempts + 1
        this.setFailedAttempts(newAttempts)

        const remainingAttempts = this.MAX_ATTEMPTS - newAttempts

        if (remainingAttempts <= 0) {
          // Lock account temporarily
          this.lockAccount()
          return {
            success: false,
            message: 'Too many failed attempts. Account locked for 15 minutes.',
            remainingAttempts: 0
          }
        }

        return {
          success: false,
          message: 'Invalid 2FA code',
          remainingAttempts
        }
      }
    } catch (error) {
      return {
        success: false,
        message: '2FA verification failed: ' + (error instanceof Error ? error.message : 'Unknown error')
      }
    }
  }

  // Check if 2FA is enabled
  is2FAEnabled(): boolean {
    try {
      const twoFactorData = localStorage.getItem('admin_2fa_data')
      if (!twoFactorData) return false

      const data = JSON.parse(twoFactorData)
      return data.enabled === true
    } catch {
      return false
    }
  }

  // Disable 2FA
  async disable2FA(_password: string): Promise<TwoFactorVerification> {
    try {
      // In a real implementation, verify the password
      // For now, we'll just disable it
      localStorage.removeItem('admin_2fa_data')
      localStorage.removeItem('admin_2fa_setup')

      // Update security settings
      const securitySettings = settingsDataManager.getSecuritySettings()
      securitySettings.twoFactorAuth = {
        enabled: false,
        methods: []
      }
      settingsDataManager.saveSecuritySettings(securitySettings)

      return {
        success: true,
        message: '2FA disabled successfully'
      }
    } catch (error) {
      return {
        success: false,
        message: 'Failed to disable 2FA: ' + (error instanceof Error ? error.message : 'Unknown error')
      }
    }
  }

  // Get backup codes
  getBackupCodes(): string[] {
    try {
      const twoFactorData = localStorage.getItem('admin_2fa_data')
      if (!twoFactorData) return []

      const data = JSON.parse(twoFactorData)
      return data.backupCodes || []
    } catch {
      return []
    }
  }

  // Generate new backup codes
  async regenerateBackupCodes(): Promise<string[]> {
    try {
      const twoFactorData = localStorage.getItem('admin_2fa_data')
      if (!twoFactorData) throw new Error('2FA not enabled')

      const data = JSON.parse(twoFactorData)
      const newBackupCodes = this.generateBackupCodes()
      
      data.backupCodes = newBackupCodes
      localStorage.setItem('admin_2fa_data', JSON.stringify(data))

      return newBackupCodes
    } catch (error) {
      throw new Error('Failed to regenerate backup codes: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  // Failed attempts tracking
  private getFailedAttempts(): number {
    const attempts = localStorage.getItem('admin_2fa_failed_attempts')
    return attempts ? parseInt(attempts) : 0
  }

  private setFailedAttempts(attempts: number): void {
    localStorage.setItem('admin_2fa_failed_attempts', attempts.toString())
  }

  private clearFailedAttempts(): void {
    localStorage.removeItem('admin_2fa_failed_attempts')
  }

  // Account locking
  private lockAccount(): void {
    const lockTime = Date.now() + (15 * 60 * 1000) // 15 minutes
    localStorage.setItem('admin_2fa_locked_until', lockTime.toString())
  }

  isAccountLocked(): boolean {
    const lockTime = localStorage.getItem('admin_2fa_locked_until')
    if (!lockTime) return false

    const unlockTime = parseInt(lockTime)
    if (Date.now() >= unlockTime) {
      localStorage.removeItem('admin_2fa_locked_until')
      this.clearFailedAttempts()
      return false
    }

    return true
  }

  getUnlockTime(): number | null {
    const lockTime = localStorage.getItem('admin_2fa_locked_until')
    return lockTime ? parseInt(lockTime) : null
  }
}

export const twoFactorAuthService = TwoFactorAuthService.getInstance()
