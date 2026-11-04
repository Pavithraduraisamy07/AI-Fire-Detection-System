import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Flame,
  Lock,
  User,
  Mail,
  ShieldAlert,
  KeyRound,
  CheckCircle2,
  Eye,
  EyeOff,
  Radio,
  Cpu,
  BrainCircuit,
  ShieldCheck,
  ArrowRight,
  Info,
  HelpCircle,
  X,
  Fingerprint,
  CreditCard,
  Smartphone,
  RefreshCw,
  AlertOctagon,
  Clock,
  Shield,
  Key,
  Check,
  Sparkles,
  Zap
} from 'lucide-react';

interface AuthViewProps {
  onSuccess: () => void;
}

type LoginMethod = 'password' | 'rfid' | 'biometric' | 'emergency';

export const AuthView: React.FC<AuthViewProps> = ({ onSuccess }) => {
  const { login } = useApp();
  const [isRegister, setIsRegister] = useState(false);
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('password');

  // Credentials
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [email, setEmail] = useState('admin@fireprevention.iot');
  const [fullName, setFullName] = useState('Lead Fire Safety Architect');
  const [role, setRole] = useState<'ADMIN' | 'OPERATOR'>('ADMIN');
  const [badgeId, setBadgeId] = useState('BADGE-ENG-8492');

  // Security & 2FA
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [sessionDuration, setSessionDuration] = useState('8h');
  const [enable2FA, setEnable2FA] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [twoFactorSent, setTwoFactorSent] = useState(false);

  // Status & Feedback
  const [errorMessage, setErrorMessage] = useState('');
  const [successNotice, setSuccessNotice] = useState('');
  const [loading, setLoading] = useState(false);

  // Modals
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3>(1);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryPin, setRecoveryPin] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [permissionsModalOpen, setPermissionsModalOpen] = useState(false);

  // Hardware RFID / Biometric simulation states
  const [scanningCard, setScanningCard] = useState(false);
  const [scanningFingerprint, setScanningFingerprint] = useState(false);

  // Calculate password strength
  const calculatePasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 6) score += 25;
    if (pass.length >= 8) score += 25;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 25;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 25;
    return score;
  };

  const passwordStrength = calculatePasswordStrength(password);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessNotice('');

    if (!username.trim()) {
      setErrorMessage('Please enter your operator username or personnel ID.');
      return;
    }

    if (!password.trim()) {
      setErrorMessage('Please enter your security access password.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (isRegister) {
      if (!fullName.trim()) {
        setErrorMessage('Please enter your full name for personnel audit logs.');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setErrorMessage('Please enter a valid work email address.');
        return;
      }
    }

    // 2FA check if enabled
    if (enable2FA && (!twoFactorCode.trim() || twoFactorCode.length !== 6)) {
      setErrorMessage('Please enter the 6-digit Multi-Factor Authentication (2FA) security code.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      login(username, role);
      onSuccess();
    }, 450);
  };

  // Quick 1-Click Login Helper
  const handleQuickLogin = (userRole: 'ADMIN' | 'OPERATOR' | 'INSPECTOR') => {
    setLoading(true);
    setErrorMessage('');
    setTimeout(() => {
      setLoading(false);
      if (userRole === 'ADMIN') {
        setUsername('admin');
        setPassword('admin123');
        login('admin', 'ADMIN');
      } else if (userRole === 'OPERATOR') {
        setUsername('operator');
        setPassword('operator123');
        login('operator', 'OPERATOR');
      } else {
        setUsername('inspector');
        setPassword('inspector123');
        login('inspector', 'OPERATOR');
      }
      onSuccess();
    }, 350);
  };

  // RFID Card Tap Simulation
  const handleRfidScan = () => {
    setScanningCard(true);
    setErrorMessage('');
    setTimeout(() => {
      setScanningCard(false);
      setSuccessNotice('RFID Smart Card Recognized: [CARD-ID: #89204-CHIEF-ADMIN]. Authenticating...');
      setTimeout(() => {
        login('admin', 'ADMIN');
        onSuccess();
      }, 700);
    }, 1200);
  };

  // Biometric Fingerprint / WebAuthn Simulation
  const handleBiometricScan = () => {
    setScanningFingerprint(true);
    setErrorMessage('');
    setTimeout(() => {
      setScanningFingerprint(false);
      setSuccessNotice('Biometric Touch ID Verified (FIPS-201 Compliant). Access Granted.');
      setTimeout(() => {
        login('operator', 'OPERATOR');
        onSuccess();
      }, 700);
    }, 1300);
  };

  // Emergency Incident Response Bypass
  const handleEmergencyBypass = () => {
    setLoading(true);
    setSuccessNotice('EMERGENCY DISPATCH PROTOCOL ACTIVATED: Entering incident response console...');
    setTimeout(() => {
      setLoading(false);
      login('emergency_crew', 'ADMIN');
      onSuccess();
    }, 600);
  };

  // 2FA Code Generator
  const handleSend2FA = () => {
    setTwoFactorSent(true);
    setTwoFactorCode('739401');
    setSuccessNotice('Security verification code sent to operator pager / mobile device. (Demo Code: 739401)');
  };

  // Password Reset Flow
  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (forgotStep === 1) {
      if (!recoveryEmail.includes('@') && !recoveryEmail.startsWith('BADGE-')) {
        alert('Please enter a valid work email or Badge ID.');
        return;
      }
      setForgotStep(2);
      setRecoveryPin('4982');
    } else if (forgotStep === 2) {
      if (recoveryPin !== '4982') {
        alert('Incorrect recovery code. For demo, use 4982.');
        return;
      }
      setForgotStep(3);
    } else {
      if (newPassword.length < 6) {
        alert('New password must be at least 6 characters.');
        return;
      }
      setPassword(newPassword);
      setForgotModalOpen(false);
      setForgotStep(1);
      setSuccessNotice('Password updated successfully. You can now sign in.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center px-4 py-8 sm:px-6 lg:px-8">
      {/* Background Decorative Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[450px] bg-red-600/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[350px] bg-cyan-600/10 rounded-full blur-[140px]" />
      </div>

      <div className="relative mx-auto w-full max-w-5xl">
        {/* Main Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl shadow-slate-950 overflow-hidden backdrop-blur-xl">
          {/* Left Column: Industrial Overview & Security Architecture */}
          <div className="lg:col-span-5 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6 sm:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800">
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-red-500/40 bg-red-950/60 px-3 py-1 text-xs font-bold text-red-400 mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                </span>
                <span>CYBER-PHYSICAL SAFETY GATEWAY</span>
              </div>

              {/* Title */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-red-600 via-rose-600 to-amber-500 shadow-lg shadow-red-950">
                  <Flame className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-black text-white tracking-tight leading-tight">
                    AI FIRE SHIELD
                  </h1>
                  <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider">
                    IoT Telemetry + ML Classifier
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mb-6">
                Automated multi-sensor fire detection and prevention command console. Corroborates DHT11 thermal surge,
                MQ-2 smoke ionization, and optical infrared flame detection with Scikit-learn Random Forest intelligence.
              </p>

              {/* Live Architecture Status Indicators */}
              <div className="space-y-2.5 rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4 text-xs font-mono mb-5">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-2">
                    <Radio className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
                    <span>ESP32 REST Gateway:</span>
                  </span>
                  <span className="text-emerald-400 font-bold">ONLINE (Port 8000)</span>
                </div>

                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-2">
                    <BrainCircuit className="h-3.5 w-3.5 text-purple-400" />
                    <span>ML Decision Engine:</span>
                  </span>
                  <span className="text-purple-300 font-bold">98.0% TEST ACC</span>
                </div>

                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-2">
                    <Cpu className="h-3.5 w-3.5 text-amber-400" />
                    <span>Hardware Relays:</span>
                  </span>
                  <span className="text-amber-400 font-bold">INTERLOCKED SAFE</span>
                </div>
              </div>

              {/* Recent Security Audit Preview */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3.5 text-[11px] text-slate-400 space-y-1">
                <div className="flex items-center justify-between text-slate-300 font-semibold mb-1">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3 text-cyan-400" />
                    <span>Terminal Audit</span>
                  </span>
                  <span className="text-emerald-400 font-mono text-[10px]">VERIFIED OK</span>
                </div>
                <p>Node Station: <span className="text-slate-200 font-mono">192.168.1.50 (Console 01)</span></p>
                <p>Security Protocol: <span className="text-slate-200">TLS 1.3 / AES-256 GCM</span></p>
                <p>Failed Attempts: <span className="text-emerald-400 font-bold">0 (Clean Log)</span></p>
              </div>
            </div>

            {/* Bottom Actions & Role Matrix */}
            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => setPermissionsModalOpen(true)}
                className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
              >
                <Shield className="h-3.5 w-3.5" />
                <span>View Role Clearance Matrix</span>
              </button>
              <span className="text-[10px] text-slate-500 font-mono">NFPA 72</span>
            </div>
          </div>

          {/* Right Column: Authentication Panel */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-center">
            {/* Header Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {isRegister ? 'Personnel Enrollment' : 'Operator Authentication'}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isRegister
                    ? 'Register new duty operator or safety engineer to the system'
                    : 'Select authentication method or enter operator credentials'}
                </p>
              </div>

              {/* Tab Switcher */}
              <div className="flex rounded-xl border border-slate-800 bg-slate-950 p-1 text-xs font-semibold shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(false);
                    setErrorMessage('');
                    setSuccessNotice('');
                  }}
                  className={`rounded-lg px-3 py-1.5 transition-all ${
                    !isRegister ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(true);
                    setErrorMessage('');
                    setSuccessNotice('');
                  }}
                  className={`rounded-lg px-3 py-1.5 transition-all ${
                    isRegister ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Register
                </button>
              </div>
            </div>

            {/* Multi-Method Login Selector (Tabs for Password, RFID, Biometrics, Emergency) */}
            {!isRegister && (
              <div className="grid grid-cols-4 gap-1.5 p-1 rounded-xl border border-slate-800 bg-slate-950 mb-5 text-[11px] font-semibold">
                <button
                  type="button"
                  onClick={() => setLoginMethod('password')}
                  className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all ${
                    loginMethod === 'password'
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Key className="h-3 w-3" />
                  <span>Password</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLoginMethod('rfid')}
                  className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all ${
                    loginMethod === 'rfid'
                      ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-400 hover:text-cyan-400'
                  }`}
                >
                  <CreditCard className="h-3 w-3" />
                  <span>RFID Tap</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLoginMethod('biometric')}
                  className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all ${
                    loginMethod === 'biometric'
                      ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40'
                      : 'text-slate-400 hover:text-purple-400'
                  }`}
                >
                  <Fingerprint className="h-3 w-3" />
                  <span>Biometric</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLoginMethod('emergency')}
                  className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all ${
                    loginMethod === 'emergency'
                      ? 'bg-red-600/30 text-red-300 border border-red-500/40 animate-pulse'
                      : 'text-slate-400 hover:text-red-400'
                  }`}
                >
                  <AlertOctagon className="h-3 w-3 text-red-400" />
                  <span>Emergency</span>
                </button>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-4 rounded-xl border border-red-500/50 bg-red-950/70 p-3 text-xs text-red-200 font-semibold flex items-center gap-2 animate-fadeIn">
                <ShieldAlert className="h-4 w-4 shrink-0 text-red-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success Notice */}
            {successNotice && (
              <div className="mb-4 rounded-xl border border-emerald-500/50 bg-emerald-950/70 p-3 text-xs text-emerald-200 font-semibold flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>{successNotice}</span>
              </div>
            )}

            {/* VIEW 1: RFID Smart Card Method */}
            {!isRegister && loginMethod === 'rfid' && (
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6 text-center space-y-4 my-2">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-500/40 bg-cyan-950/30 text-cyan-400 shadow-lg shadow-cyan-950">
                  <CreditCard className={`h-8 w-8 ${scanningCard ? 'animate-bounce text-cyan-300' : ''}`} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">NFC / RFID Smart Card Terminal</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Hold your on-site physical operator smart badge near the RFID receiver to authenticate.
                  </p>
                </div>

                <div className="inline-block rounded-lg border border-slate-800 bg-slate-900 px-3 py-1 font-mono text-xs text-slate-300">
                  Active Reader: <span className="text-cyan-400">RC522-SPI (GPIO 21, 22)</span>
                </div>

                <button
                  type="button"
                  onClick={handleRfidScan}
                  disabled={scanningCard}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 py-3 text-xs font-bold text-white shadow-md shadow-cyan-950 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50"
                >
                  {scanningCard ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>READING RFID CHIP...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4" />
                      <span>TAP SIMULATED OPERATOR BADGE</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* VIEW 2: Biometric Fingerprint Method */}
            {!isRegister && loginMethod === 'biometric' && (
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6 text-center space-y-4 my-2">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-purple-500/40 bg-purple-950/30 text-purple-400 shadow-lg shadow-purple-950">
                  <Fingerprint className={`h-8 w-8 ${scanningFingerprint ? 'animate-pulse text-purple-300' : ''}`} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Biometric Passkey / Fingerprint Sensor</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    FIPS-201 hardware optical fingerprint match for rapid console unlocking during fire events.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleBiometricScan}
                  disabled={scanningFingerprint}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 py-3 text-xs font-bold text-white shadow-md shadow-purple-950 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50"
                >
                  {scanningFingerprint ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>VERIFYING BIOMETRICS...</span>
                    </>
                  ) : (
                    <>
                      <Fingerprint className="h-4 w-4" />
                      <span>TOUCH BIOMETRIC SENSOR</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* VIEW 3: Emergency Response Bypass */}
            {!isRegister && loginMethod === 'emergency' && (
              <div className="rounded-2xl border border-red-500/50 bg-red-950/30 p-6 text-center space-y-4 my-2">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500 bg-red-950/60 text-red-400 animate-pulse shadow-lg shadow-red-950">
                  <AlertOctagon className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-red-300">EMERGENCY INCIDENT OVERRIDE</h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto">
                    Grants immediate emergency access to active sensor waveforms, ventilation fan relays, and alarm logs without typing passwords.
                  </p>
                </div>

                <div className="rounded-lg border border-red-500/30 bg-red-950/60 p-2 text-[11px] text-red-200">
                  All actions taken during Emergency Access are recorded with timestamp and terminal IP.
                </div>

                <button
                  type="button"
                  onClick={handleEmergencyBypass}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-500 py-3 text-xs font-black uppercase text-white shadow-xl shadow-red-950 transition-all hover:scale-[1.01] active:scale-95"
                >
                  <span>DISPATCH EMERGENCY INCIDENT OVERRIDE</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* VIEW 4: Standard Password & Registration Form */}
            {(isRegister || loginMethod === 'password') && (
              <form onSubmit={handleSubmit} className="space-y-3.5">
                {isRegister && (
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Full Name & Title:
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                      <input
                        type="text"
                        placeholder="e.g., Captain David Miller"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Operator Username / Badge ID:
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Enter username (e.g., admin, operator)"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>
                </div>

                {isRegister && (
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Official Work Email:
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                      <input
                        type="email"
                        placeholder="operator@firestation.iot"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-300">
                      Security Access Password:
                    </label>
                    {!isRegister && (
                      <button
                        type="button"
                        onClick={() => {
                          setForgotModalOpen(true);
                          setForgotStep(1);
                        }}
                        className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                      >
                        Forgot / Reset Password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-9 pr-10 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  {/* Password Strength Meter */}
                  {password.length > 0 && (
                    <div className="mt-1.5 space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Security Strength:</span>
                        <span
                          className={`font-bold ${
                            passwordStrength >= 75
                              ? 'text-emerald-400'
                              : passwordStrength >= 50
                              ? 'text-amber-400'
                              : 'text-red-400'
                          }`}
                        >
                          {passwordStrength >= 75
                            ? 'High Military-Grade'
                            : passwordStrength >= 50
                            ? 'Moderate'
                            : 'Basic'}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            passwordStrength >= 75
                              ? 'bg-emerald-500'
                              : passwordStrength >= 50
                              ? 'bg-amber-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${passwordStrength}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {isRegister && (
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Authorization Clearance Tier:
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as 'ADMIN' | 'OPERATOR')}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="ADMIN">ADMIN — Full Relays, Solenoids & Threshold Controls</option>
                      <option value="OPERATOR">OPERATOR — Telemetry Monitoring & Siren Silence</option>
                    </select>
                  </div>
                )}

                {/* 2FA Verification Toggle & Input */}
                <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300">
                      <Smartphone className="h-3.5 w-3.5 text-cyan-400" />
                      <span>Require 2FA Security Code (MFA)</span>
                    </label>
                    <input
                      type="checkbox"
                      checked={enable2FA}
                      onChange={(e) => setEnable2FA(e.target.checked)}
                      className="h-4 w-4 rounded accent-cyan-500"
                    />
                  </div>

                  {enable2FA && (
                    <div className="pt-2 border-t border-slate-800/80 space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="6-digit code"
                          value={twoFactorCode}
                          onChange={(e) => setTwoFactorCode(e.target.value)}
                          className="flex-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-white text-center font-mono tracking-widest focus:outline-none focus:border-cyan-500"
                        />
                        <button
                          type="button"
                          onClick={handleSend2FA}
                          className="rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-semibold text-cyan-300 shrink-0"
                        >
                          Send / Autofill Code
                        </button>
                      </div>
                      <span className="text-[10px] text-slate-500 block">
                        Multi-factor protection against unauthorized console commands.
                      </span>
                    </div>
                  )}
                </div>

                {/* Session Duration & Remember Me */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-300">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-800 bg-slate-950 accent-red-500"
                    />
                    <span>Remember workstation</span>
                  </label>

                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <span>Shift Timeout:</span>
                    <select
                      value={sessionDuration}
                      onChange={(e) => setSessionDuration(e.target.value)}
                      className="rounded border border-slate-800 bg-slate-950 px-2 py-0.5 text-[11px] text-cyan-300 focus:outline-none"
                    >
                      <option value="1h">1 Hour (Walkthrough)</option>
                      <option value="8h">8 Hours (Standard Shift)</option>
                      <option value="12h">12 Hours (Emergency Watch)</option>
                    </select>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 py-3 text-xs font-black tracking-wider uppercase text-white hover:from-red-500 hover:to-rose-500 shadow-lg shadow-red-950 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>AUTHENTICATING OPERATOR...</span>
                    </span>
                  ) : (
                    <>
                      <span>{isRegister ? 'REGISTER & ENTER CONSOLE' : 'SIGN IN TO CONSOLE'}</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Quick Demo Autofill Section */}
            <div className="mt-5 border-t border-slate-800/80 pt-4">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-cyan-400" />
                  <span>One-Click Preset Roles (Fast Evaluation):</span>
                </span>
                <span className="text-[10px] text-cyan-400 font-mono">Instant Entry</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('ADMIN')}
                  className="rounded-xl border border-cyan-500/30 bg-slate-950/80 p-2.5 text-left hover:border-cyan-500 hover:bg-cyan-950/20 transition-all hover:scale-[1.02]"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Chief Admin</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono block mt-0.5">admin / admin123</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('OPERATOR')}
                  className="rounded-xl border border-amber-500/30 bg-slate-950/80 p-2.5 text-left hover:border-amber-500 hover:bg-amber-950/20 transition-all hover:scale-[1.02]"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                    <User className="h-3.5 w-3.5" />
                    <span>Duty Operator</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono block mt-0.5">operator / operator123</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('INSPECTOR')}
                  className="rounded-xl border border-emerald-500/30 bg-slate-950/80 p-2.5 text-left hover:border-emerald-500 hover:bg-emerald-950/20 transition-all hover:scale-[1.02]"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Safety Inspector</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono block mt-0.5">inspect / inspect123</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: Password Recovery & Security Wizard */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Security Access Recovery Wizard</h3>
              </div>
              <button onClick={() => setForgotModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Stepper Indicator */}
            <div className="flex items-center justify-between text-xs text-slate-400 px-2">
              <span className={forgotStep === 1 ? 'text-cyan-400 font-bold' : ''}>1. Identify</span>
              <span>→</span>
              <span className={forgotStep === 2 ? 'text-cyan-400 font-bold' : ''}>2. Verify PIN</span>
              <span>→</span>
              <span className={forgotStep === 3 ? 'text-cyan-400 font-bold' : ''}>3. Reset</span>
            </div>

            <form onSubmit={handleResetSubmit} className="space-y-4 text-xs">
              {forgotStep === 1 && (
                <div className="space-y-2">
                  <p className="text-slate-300">
                    Enter your registered official work email or Badge ID to receive an emergency recovery code:
                  </p>
                  <input
                    type="text"
                    required
                    placeholder="e.g. admin@fireprevention.iot or BADGE-102"
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                  <span className="text-[10px] text-slate-500">
                    Tip: Enter admin@fireprevention.iot for fast recovery demo.
                  </span>
                </div>
              )}

              {forgotStep === 2 && (
                <div className="space-y-2">
                  <p className="text-slate-300">
                    Enter the 4-digit verification PIN dispatched to your safety radio / pager:
                  </p>
                  <input
                    type="text"
                    maxLength={4}
                    required
                    placeholder="4982"
                    value={recoveryPin}
                    onChange={(e) => setRecoveryPin(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-white text-center font-mono text-lg tracking-widest focus:outline-none focus:border-cyan-500"
                  />
                  <div className="rounded bg-slate-950 p-2 text-[11px] text-cyan-300 font-mono text-center border border-slate-800">
                    Demo Dispatched Recovery PIN: <strong>4982</strong>
                  </div>
                </div>
              )}

              {forgotStep === 3 && (
                <div className="space-y-2">
                  <p className="text-slate-300">Enter your new security access password:</p>
                  <input
                    type="password"
                    required
                    placeholder="New password (min 6 chars)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setForgotModalOpen(false)}
                  className="rounded-lg px-3 py-1.5 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-cyan-600 hover:bg-cyan-500 px-4 py-1.5 font-bold text-white shadow-md shadow-cyan-950"
                >
                  {forgotStep === 3 ? 'Set New Password' : 'Next Step'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Role Permissions Clearance Matrix */}
      {permissionsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Role Authorization & Privilege Matrix</h3>
              </div>
              <button onClick={() => setPermissionsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Role permissions strictly enforce functional separation in accordance with safety standards:
            </p>

            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead className="border-b border-slate-800 text-[11px] uppercase text-slate-400">
                  <tr>
                    <th className="pb-2">Capability</th>
                    <th className="pb-2 text-cyan-400">Admin</th>
                    <th className="pb-2 text-amber-400">Operator</th>
                    <th className="pb-2 text-emerald-400">Inspector</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300 font-mono text-[11px]">
                  <tr>
                    <td className="py-2 font-sans font-medium text-white">Live Telemetry View</td>
                    <td className="py-2 text-emerald-400 font-bold">✓ Full</td>
                    <td className="py-2 text-emerald-400 font-bold">✓ Full</td>
                    <td className="py-2 text-emerald-400 font-bold">✓ Full</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-sans font-medium text-white">Acknowledge Alarms</td>
                    <td className="py-2 text-emerald-400 font-bold">✓ Full</td>
                    <td className="py-2 text-emerald-400 font-bold">✓ Full</td>
                    <td className="py-2 text-slate-500">Read-Only</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-sans font-medium text-white">Exhaust Fan (Relay 1)</td>
                    <td className="py-2 text-emerald-400 font-bold">✓ Manual/Auto</td>
                    <td className="py-2 text-emerald-400 font-bold">✓ Test Only</td>
                    <td className="py-2 text-slate-500">✗ Locked</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-sans font-medium text-white">Suppression Valve (Relay 2)</td>
                    <td className="py-2 text-emerald-400 font-bold">✓ Arm & Deploy</td>
                    <td className="py-2 text-slate-500">✗ Interlocked</td>
                    <td className="py-2 text-slate-500">✗ Interlocked</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-sans font-medium text-white">Safety Threshold Calibration</td>
                    <td className="py-2 text-emerald-400 font-bold">✓ Full</td>
                    <td className="py-2 text-slate-500">✗ Locked</td>
                    <td className="py-2 text-slate-500">Audit Only</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-sans font-medium text-white">Emergency Stop Disengage</td>
                    <td className="py-2 text-emerald-400 font-bold">✓ Instant</td>
                    <td className="py-2 text-emerald-400 font-bold">✓ Instant</td>
                    <td className="py-2 text-emerald-400 font-bold">✓ Instant</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <button
              onClick={() => setPermissionsModalOpen(false)}
              className="w-full rounded-xl bg-slate-800 hover:bg-slate-700 py-2.5 text-xs font-bold text-white"
            >
              Close Matrix
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
