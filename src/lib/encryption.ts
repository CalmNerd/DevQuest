import crypto from 'crypto'

//  Uses AES-256-CBC encryption (compatible with all Node.js versions)
class TokenEncryption {
  private readonly algorithm = 'aes-256-cbc'
  private readonly keyLength = 32
  private readonly ivLength = 16

  // Get encryption key from environment variable
  // Falls back to a derived key if ENCRYPTION_KEY is not set
  private getKey(): Buffer {
    const envKey = process.env.ENCRYPTION_KEY

    if (!envKey) {
      console.warn('ENCRYPTION_KEY not set, using fallback key. This is not secure for production!')
      // Fallback key for development - DO NOT USE IN PRODUCTION
      return crypto.scryptSync('devquest-fallback-key', 'salt', this.keyLength)
    }

    // Convert hex string to buffer
    if (envKey.length === 64) { // 32 bytes = 64 hex chars
      return Buffer.from(envKey, 'hex')
    }

    // Derive key from string
    return crypto.scryptSync(envKey, 'devquest-salt', this.keyLength)
  }

  // Encrypted token string in format: iv:encrypted
  encryptToken(token: string): string {
    if (!token) {
      throw new Error('Token cannot be empty')
    }

    try {
      const key = this.getKey()
      const iv = crypto.randomBytes(this.ivLength)

      // Use createCipheriv instead of createCipher (required for Node 17+)
      const cipher = crypto.createCipheriv(this.algorithm, key, iv)

      let encrypted = cipher.update(token, 'utf8', 'hex')
      encrypted += cipher.final('hex')

      // Return format: iv:encrypted
      return `${iv.toString('hex')}:${encrypted}`
    } catch (error) {
      console.error('Token encryption failed:', error)
      throw new Error('Failed to encrypt token')
    }
  }

  // Decrypt a token for use in API calls
  decryptToken(encryptedToken: string): string {
    if (!encryptedToken) {
      throw new Error('Encrypted token cannot be empty')
    }

    try {
      const parts = encryptedToken.split(':')
      if (parts.length !== 2) {
        throw new Error('Invalid encrypted token format')
      }

      const [ivHex, encrypted] = parts

      const key = this.getKey()
      const iv = Buffer.from(ivHex, 'hex')

      // Use createDecipheriv instead of createDecipher (required for Node 17+)
      const decipher = crypto.createDecipheriv(this.algorithm, key, iv)

      let decrypted = decipher.update(encrypted, 'hex', 'utf8')
      decrypted += decipher.final('utf8')

      return decrypted
    } catch (error) {
      console.error('Token decryption failed:', error)
      throw new Error('Failed to decrypt token')
    }
  }

  // Check if a string looks like an encrypted token
  isEncrypted(token: string): boolean {
    if (!token) return false
    const parts = token.split(':')
    return parts.length === 2 &&
      parts[0].length === 32 && // IV hex length
      parts[1].length > 0       // Encrypted data
  }

  // Safely decrypt a token, handling both encrypted and plaintext tokens
  safeDecryptToken(token: string): string {
    if (!token) {
      throw new Error('Token is required')
    }

    // If it looks encrypted, decrypt it
    if (this.isEncrypted(token)) {
      return this.decryptToken(token)
    }

    // Otherwise, assume it's plaintext (for backward compatibility)
    return token
  }
}

// Export singleton instance
export const tokenEncryption = new TokenEncryption()

// Export types
export interface EncryptedToken {
  encrypted: string
  iv: string
  tag: string
}

export default tokenEncryption
