import React, { useState, useId } from 'react';
import { Zap, Eye, EyeOff, AlertTriangle, CheckCircle, Loader2, ShieldCheck } from 'lucide-react';
import {
  apiLogin, apiRegister,
  validateEmail, validatePassword, validateDisplayName,
} from '../lib/auth';
import { AuthUser } from '../lib/supabase';

interface LoginPageProps {
  onSuccess: (user: AuthUser) => void;
}

type Mode = 'login' | 'register';

interface FieldErrors {
  displayName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  global?: string;
}

export function LoginPage({ onSuccess }: LoginPageProps) {
  const uid = useId();
  const [mode, setMode] = useState<Mode>('login');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const switchMode = (next: Mode) => {
    setMode(next);
    setErrors({});
    setSuccessMsg('');
    setDisplayName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  const validate = (): FieldErrors => {
    const errs: FieldErrors = {};
    if (mode === 'register') {
      const dnErr = validateDisplayName(displayName);
      if (dnErr) errs.displayName = dnErr;
    }
    const emailErr = validateEmail(email);
    if (emailErr) errs.email = emailErr;
    const passErr = validatePassword(password);
    if (passErr) errs.password = passErr;
    if (mode === 'register' && password !== confirmPassword) {
      errs.confirmPassword = 'ACCESS KEYS DO NOT MATCH';
    }
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitting(true);

    if (mode === 'login') {
      const { user, error } = await apiLogin(email, password);
      setSubmitting(false);
      if (error) { setErrors({ global: error }); return; }
      setSuccessMsg('ACCESS GRANTED ✓');
      setTimeout(() => onSuccess(user!), 800);
    } else {
      const { user, error } = await apiRegister(email, password, displayName);
      setSubmitting(false);
      if (error) {
        if (error.includes('ALREADY REGISTERED')) setErrors({ email: error });
        else setErrors({ global: error });
        return;
      }
      setSuccessMsg('OPERATOR REGISTERED ✓ — ACCESS GRANTED');
      setTimeout(() => onSuccess(user!), 900);
    }
  };

  return (
    <div className="login-root">
      {/* Animated grid background */}
      <div className="login-grid" aria-hidden="true" />

      {/* Floating orbs */}
      <div className="login-orb login-orb-1" aria-hidden="true" />
      <div className="login-orb login-orb-2" aria-hidden="true" />

      {/* Status badge — top right */}
      <div className="login-status-badge" aria-label="System status: online">
        <span className="login-status-dot" />
        <span className="login-status-pulse" />
        <span>SYSTEM STATUS · ACTIVE · ONLINE</span>
      </div>

      {/* Card */}
      <div className="login-card" role="main">
        {/* Top accent bar */}
        <div className="login-card-accent" aria-hidden="true" />

        {/* Logo */}
        <div className="login-logo" aria-label="Momentum Habit OS">
          <div className="login-logo-icon">
            <div className="login-logo-glow" aria-hidden="true" />
            <div className="login-logo-box">
              <Zap size={22} className="login-logo-zap" />
            </div>
          </div>
          <div>
            <span className="login-brand-name">Momentum</span>
            <span className="login-brand-sub">Habit OS</span>
          </div>
        </div>

        {/* Panel title */}
        <div className="login-panel-header">
          <span className="section-label">Authentication Portal</span>
          <h1 className="login-panel-title">OPERATOR AUTHENTICATION</h1>
        </div>

        {/* Mode toggle */}
        <div className="login-mode-toggle" role="tablist" aria-label="Authentication mode">
          <button
            role="tab"
            aria-selected={mode === 'login'}
            className={`login-mode-btn ${mode === 'login' ? 'active' : ''}`}
            onClick={() => switchMode('login')}
            type="button"
            id={`${uid}-login-tab`}
          >
            LOGIN
          </button>
          <button
            role="tab"
            aria-selected={mode === 'register'}
            className={`login-mode-btn ${mode === 'register' ? 'active' : ''}`}
            onClick={() => switchMode('register')}
            type="button"
            id={`${uid}-register-tab`}
          >
            REGISTER
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          noValidate
          aria-labelledby={mode === 'login' ? `${uid}-login-tab` : `${uid}-register-tab`}
        >
          <div className={`login-fields ${mode === 'register' ? 'register-mode' : ''}`}>

            {/* Display name — register only */}
            {mode === 'register' && (
              <div className="login-field" style={{ animation: 'login-field-in 0.3s ease both' }}>
                <label className="login-label" htmlFor={`${uid}-callsign`}>
                  CALL SIGN
                </label>
                <input
                  id={`${uid}-callsign`}
                  type="text"
                  autoComplete="name"
                  placeholder="Your operator name"
                  value={displayName}
                  onChange={e => { setDisplayName(e.target.value); setErrors(p => ({ ...p, displayName: undefined })); }}
                  className={`login-input ${errors.displayName ? 'error' : ''}`}
                  maxLength={32}
                  aria-describedby={errors.displayName ? `${uid}-dn-err` : undefined}
                  aria-invalid={!!errors.displayName}
                />
                {errors.displayName && (
                  <p className="login-field-error" id={`${uid}-dn-err`} role="alert">
                    <AlertTriangle size={12} /> {errors.displayName}
                  </p>
                )}
              </div>
            )}

            {/* Email */}
            <div className="login-field">
              <label className="login-label" htmlFor={`${uid}-email`}>
                OPERATOR EMAIL
              </label>
              <input
                id={`${uid}-email`}
                type="email"
                autoComplete="email"
                placeholder="operator@domain.com"
                value={email}
                onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: undefined })); }}
                className={`login-input ${errors.email ? 'error' : ''}`}
                aria-describedby={errors.email ? `${uid}-email-err` : undefined}
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className="login-field-error" id={`${uid}-email-err`} role="alert">
                  <AlertTriangle size={12} /> {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="login-field">
              <label className="login-label" htmlFor={`${uid}-password`}>
                ACCESS KEY
              </label>
              <div className="login-input-wrap">
                <input
                  id={`${uid}-password`}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: undefined })); }}
                  className={`login-input with-icon ${errors.password ? 'error' : ''}`}
                  aria-describedby={errors.password ? `${uid}-pw-err` : `${uid}-pw-hint`}
                  aria-invalid={!!errors.password}
                />
                <button
                  type="button"
                  className="login-eye"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {mode === 'register' && !errors.password && (
                <p className="login-hint" id={`${uid}-pw-hint`}>
                  Min 8 chars · 1 number · 1 special character
                </p>
              )}
              {errors.password && (
                <p className="login-field-error" id={`${uid}-pw-err`} role="alert">
                  <AlertTriangle size={12} /> {errors.password}
                </p>
              )}
            </div>

            {/* Confirm password — register only */}
            {mode === 'register' && (
              <div className="login-field" style={{ animation: 'login-field-in 0.3s 0.05s ease both' }}>
                <label className="login-label" htmlFor={`${uid}-confirm`}>
                  CONFIRM ACCESS KEY
                </label>
                <div className="login-input-wrap">
                  <input
                    id={`${uid}-confirm`}
                    type={showConfirm ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={e => { setConfirmPassword(e.target.value); setErrors(p => ({ ...p, confirmPassword: undefined })); }}
                    className={`login-input with-icon ${errors.confirmPassword ? 'error' : ''}`}
                    aria-describedby={errors.confirmPassword ? `${uid}-cp-err` : undefined}
                    aria-invalid={!!errors.confirmPassword}
                  />
                  <button
                    type="button"
                    className="login-eye"
                    onClick={() => setShowConfirm(v => !v)}
                    aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="login-field-error" id={`${uid}-cp-err`} role="alert">
                    <AlertTriangle size={12} /> {errors.confirmPassword}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Global error */}
          {errors.global && (
            <div className="login-global-error" role="alert" aria-live="assertive">
              <AlertTriangle size={16} />
              <span>{errors.global}</span>
            </div>
          )}

          {/* Success flash */}
          {successMsg && (
            <div className="login-success" role="status" aria-live="polite">
              <CheckCircle size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={submitting || !!successMsg}
            className={`login-submit ${successMsg ? 'granted' : ''}`}
            id={`${uid}-submit`}
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="login-spinner" />
                AUTHENTICATING…
              </>
            ) : successMsg ? (
              <>
                <CheckCircle size={18} />
                ACCESS GRANTED
              </>
            ) : (
              <>
                <ShieldCheck size={18} />
                {mode === 'login' ? 'AUTHENTICATE' : 'REGISTER OPERATOR'}
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="login-footer">
          {mode === 'login' ? (
            <>NEW OPERATOR?{' '}
              <button type="button" onClick={() => switchMode('register')} className="login-footer-link">
                REQUEST ACCESS
              </button>
            </>
          ) : (
            <>ALREADY REGISTERED?{' '}
              <button type="button" onClick={() => switchMode('login')} className="login-footer-link">
                AUTHENTICATE
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
