// Simple hash function for password verification
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}

// Default development password
const DEFAULT_PASSWORD = 'TechKwiz2024!Admin';
const DEFAULT_PASSWORD_HASH = simpleHash(DEFAULT_PASSWORD);

export interface AdminSession {
  isAuthenticated: boolean;
  loginTime: number;
  lastActivity: number;
  sessionId: string;
  failedAttempts: number;
  lockoutUntil?: number;
}

export class AdminAuth {
  private static readonly SESSION_KEY = 'admin_session';
  private static readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  private static readonly MAX_FAILED_ATTEMPTS = 5;
  private static readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

  static getPasswordHash(): string {
    // In production, this should come from environment variables
    return process.env.NEXT_PUBLIC_ADMIN_PASSWORD_HASH || DEFAULT_PASSWORD_HASH;
  }

  static verifyPassword(password: string): boolean {
    const inputHash = simpleHash(password);
    const expectedHash = this.getPasswordHash();
    return inputHash === expectedHash;
  }

  static getSession(): AdminSession | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const sessionData = localStorage.getItem(this.SESSION_KEY);
      if (!sessionData) return null;
      
      const session: AdminSession = JSON.parse(sessionData);
      
      // Check if session is expired
      const now = Date.now();
      if (now - session.lastActivity > this.SESSION_TIMEOUT) {
        this.clearSession();
        return null;
      }
      
      // Check if account is locked out
      if (session.lockoutUntil && now < session.lockoutUntil) {
        return session;
      }
      
      // Update last activity
      session.lastActivity = now;
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
      
      return session;
    } catch (error) {
      console.error('Error reading admin session:', error);
      this.clearSession();
      return null;
    }
  }

  static login(password: string): { success: boolean; message: string; lockoutUntil?: number } {
    const startTime = performance.now()

    const session = this.getSession() || {
      isAuthenticated: false,
      loginTime: 0,
      lastActivity: 0,
      sessionId: '',
      failedAttempts: 0
    };

    const now = Date.now();

    // Check if account is locked out
    if (session.lockoutUntil && now < session.lockoutUntil) {
      const remainingTime = Math.ceil((session.lockoutUntil - now) / 60000);
      return {
        success: false,
        message: `Account locked. Try again in ${remainingTime} minutes.`,
        lockoutUntil: session.lockoutUntil
      };
    }

    // Verify password (optimized)
    const passwordVerifyStart = performance.now()
    const isValidPassword = this.verifyPassword(password)
    const passwordVerifyEnd = performance.now()
    console.log(`🔐 Password verification took: ${passwordVerifyEnd - passwordVerifyStart}ms`)

    if (isValidPassword) {
      const sessionCreateStart = performance.now()

      const newSession: AdminSession = {
        isAuthenticated: true,
        loginTime: now,
        lastActivity: now,
        sessionId: Math.random().toString(36).substring(2, 15),
        failedAttempts: 0
      };

      // Optimized: Use a single localStorage operation
      const sessionData = JSON.stringify(newSession)
      localStorage.setItem(this.SESSION_KEY, sessionData);

      const sessionCreateEnd = performance.now()
      console.log(`🔐 Session creation took: ${sessionCreateEnd - sessionCreateStart}ms`)

      // Log activity asynchronously to avoid blocking
      setTimeout(() => {
        this.logActivity('login_success', 'User logged in successfully');
      }, 0)

      const totalTime = performance.now() - startTime
      console.log(`🔐 AdminAuth.login took: ${totalTime}ms`)

      return { success: true, message: 'Login successful' };
    } else {
      // Increment failed attempts
      session.failedAttempts = (session.failedAttempts || 0) + 1;
      
      if (session.failedAttempts >= this.MAX_FAILED_ATTEMPTS) {
        session.lockoutUntil = now + this.LOCKOUT_DURATION;
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
        this.logActivity('account_locked', `Account locked after ${this.MAX_FAILED_ATTEMPTS} failed attempts`);
        
        return {
          success: false,
          message: `Too many failed attempts. Account locked for 15 minutes.`,
          lockoutUntil: session.lockoutUntil
        };
      } else {
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
        const remainingAttempts = this.MAX_FAILED_ATTEMPTS - session.failedAttempts;
        this.logActivity('login_failed', `Failed login attempt. ${remainingAttempts} attempts remaining`);
        
        return {
          success: false,
          message: `Invalid password. ${remainingAttempts} attempts remaining.`
        };
      }
    }
  }

  static logout(): void {
    this.logActivity('logout', 'User logged out');
    this.clearSession();
  }

  static clearSession(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.SESSION_KEY);
    }
  }

  static isAuthenticated(): boolean {
    const session = this.getSession();
    return session?.isAuthenticated === true;
  }

  static updateActivity(): void {
    const session = this.getSession();
    if (session && session.isAuthenticated) {
      session.lastActivity = Date.now();
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    }
  }

  static logActivity(action: string, details: string): void {
    if (typeof window === 'undefined') return;

    try {
      const logs = JSON.parse(localStorage.getItem('admin_activity_logs') || '[]');
      const logEntry = {
        timestamp: Date.now(),
        action,
        details,
        sessionId: this.getSession()?.sessionId || 'unknown'
      };

      logs.push(logEntry);

      // Keep only last 1000 entries
      if (logs.length > 1000) {
        logs.splice(0, logs.length - 1000);
      }

      localStorage.setItem('admin_activity_logs', JSON.stringify(logs));
    } catch (error) {
      console.error('Error logging admin activity:', error);
    }
  }

  static getActivityLogs(): Array<{
    timestamp: number;
    action: string;
    details: string;
    sessionId: string;
  }> {
    if (typeof window === 'undefined') return [];

    try {
      return JSON.parse(localStorage.getItem('admin_activity_logs') || '[]');
    } catch (error) {
      console.error('Error reading activity logs:', error);
      return [];
    }
  }
}
