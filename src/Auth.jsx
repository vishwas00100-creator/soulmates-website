import React, { useState } from 'react';
import { supabase } from './supabaseClient.js';
import {
  Heart,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  LoaderCircle,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Check,
} from 'lucide-react';

export default function Auth({
  onSuccess,
  onBack,
  initialMode = 'login',
}) {
  const [mode, setMode] = useState(initialMode);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const clearMessages = () => {
    setMessage('');
    setError('');
  };

  const getPasswordStrength = (pass) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 10) score++;
    if (/[A-Z]/.test(pass) && /[0-9]/.test(pass)) score++;
    return score; // 0, 1, 2, or 3
  };

  const passwordStrength = getPasswordStrength(password);

  const handleSubmit = async (event) => {
    event.preventDefault();
    clearMessages();

    if (!supabase) {
      setError(
        'The Supabase connection is not configured. Please check src/supabaseClient.js.'
      );
      return;
    }

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    if (mode !== 'forgot' && password.length < 6) {
      setError('Your password must contain at least 6 characters.');
      return;
    }

    if (mode === 'signup' && !fullName.trim()) {
      setError('Please enter your name.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signup') {
        const { data, error: signupError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
            },
            emailRedirectTo:
              window.location.origin + import.meta.env.BASE_URL,
          },
        });

        if (signupError) throw signupError;

        if (data.session) {
          setMessage('Welcome! Your account has been created successfully.');
          if (onSuccess) onSuccess(data.session);
        } else {
          setMessage(
            'Account created! Please check your email to confirm your account before logging in.'
          );
          setMode('login');
        }
      } else if (mode === 'login') {
        const { data, error: loginError } =
          await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });

        if (loginError) throw loginError;

        setMessage('Login successful!');
        if (onSuccess) onSuccess(data.session);
      } else if (mode === 'forgot') {
        const redirectTo =
          window.location.origin + import.meta.env.BASE_URL;

        const { error: resetError } =
          await supabase.auth.resetPasswordForEmail(email.trim(), {
            redirectTo,
          });

        if (resetError) throw resetError;

        setMessage(
          'If an account exists for this email, password-reset instructions have been sent.'
        );
      }
    } catch (err) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const changeMode = (nextMode) => {
    clearMessages();
    setMode(nextMode);
  };

  return (
    <div className="auth-page">
      <div className="auth-card-wrapper">
        {/* Left Editorial Visual Panel (Desktop) */}
        <div className="auth-showcase">
          <div className="showcase-badge">
            <span className="pulse-dot"></span>
            <span>24,000+ Active Singles</span>
          </div>

          <div className="showcase-content">
            <div className="showcase-icon-box">
              <Heart size={26} fill="currentColor" />
            </div>
            <h2>Where true connections bloom.</h2>
            <p>
              An intentional, safe sanctuary built for real people, deep
              chemistry, and genuine conversations.
            </p>

            <div className="showcase-perks">
              <div className="perk-item">
                <Check size={16} /> Verified, authentic profiles
              </div>
              <div className="perk-item">
                <Check size={16} /> Privacy-first matchmaking
              </div>
              <div className="perk-item">
                <Check size={16} /> Meaningful conversations only
              </div>
            </div>
          </div>

          <div className="showcase-quote">
            <p>
              “We connected on Soulmates last spring. It was the first time an
              app felt real, respectful, and magical.”
            </p>
            <span>— Maya &amp; Rohan, Bangalore</span>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="auth-form-panel">
          {onBack && (
            <button
              type="button"
              className="auth-back-btn"
              onClick={onBack}
              aria-label="Go back"
            >
              <ArrowLeft size={16} />
              <span>Back to home</span>
            </button>
          )}

          <div className="auth-header">
            <div className="mobile-brand">
              <div className="brand-heart small">
                <Heart size={16} fill="currentColor" />
              </div>
              <span>Soulmates<span className="brand-dot">.</span></span>
            </div>

            <h1>
              {mode === 'signup'
                ? 'Create Your Profile'
                : mode === 'forgot'
                  ? 'Reset Your Password'
                  : 'Welcome Back'}
            </h1>
            <p>
              {mode === 'signup'
                ? 'Take the first step toward someone extraordinary.'
                : mode === 'forgot'
                  ? 'Enter your registered email and we’ll help you get back in.'
                  : 'Enter your credentials to continue your journey.'}
            </p>
          </div>

          {/* Mode Tabs */}
          {mode !== 'forgot' && (
            <div className="auth-segmented-tabs">
              <button
                type="button"
                className={mode === 'login' ? 'active' : ''}
                onClick={() => changeMode('login')}
              >
                Log In
              </button>
              <button
                type="button"
                className={mode === 'signup' ? 'active' : ''}
                onClick={() => changeMode('signup')}
              >
                Sign Up
              </button>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <div className="field-group">
                <label htmlFor="auth-name">Your Full Name</label>
                <div className="input-wrap">
                  <User className="input-icon" size={18} />
                  <input
                    id="auth-name"
                    type="text"
                    placeholder="e.g. Maya Sharma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    autoComplete="name"
                    required
                  />
                </div>
              </div>
            )}

            <div className="field-group">
              <label htmlFor="auth-email">Email Address</label>
              <div className="input-wrap">
                <Mail className="input-icon" size={18} />
                <input
                  id="auth-email"
                  type="email"
                  placeholder="you@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div className="field-group">
                <div className="field-label-row">
                  <label htmlFor="auth-password">Password</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      className="inline-forgot-btn"
                      onClick={() => changeMode('forgot')}
                    >
                      Forgot?
                    </button>
                  )}
                </div>

                <div className="input-wrap">
                  <Lock className="input-icon" size={18} />
                  <input
                    id="auth-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete={
                      mode === 'signup'
                        ? 'new-password'
                        : 'current-password'
                    }
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={
                      showPassword ? 'Hide password' : 'Show password'
                    }
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Password Strength Meter on Signup */}
                {mode === 'signup' && password.length > 0 && (
                  <div className="password-meter-wrap">
                    <div className="password-meter-bars">
                      <span className={`bar ${passwordStrength >= 1 ? 'active' : ''}`} />
                      <span className={`bar ${passwordStrength >= 2 ? 'active' : ''}`} />
                      <span className={`bar ${passwordStrength >= 3 ? 'active' : ''}`} />
                    </div>
                    <span className="password-meter-label">
                      {passwordStrength === 1 && 'Basic'}
                      {passwordStrength === 2 && 'Good'}
                      {passwordStrength >= 3 && 'Strong'}
                    </span>
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="auth-feedback-alert error" role="alert">
                <span>{error}</span>
              </div>
            )}

            {message && (
              <div className="auth-feedback-alert success" role="status">
                <span>{message}</span>
              </div>
            )}

            <button
              className="auth-primary-submit"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <LoaderCircle className="auth-btn-spinner" size={18} />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <span>
                    {mode === 'signup'
                      ? 'Create My Account'
                      : mode === 'forgot'
                        ? 'Send Reset Link'
                        : 'Sign In'}
                  </span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {mode === 'forgot' && (
            <div className="auth-switch-box">
              <button
                type="button"
                className="auth-link-btn"
                onClick={() => changeMode('login')}
              >
                <ArrowLeft size={14} /> Back to Sign In
              </button>
            </div>
          )}

          {mode !== 'forgot' && (
            <div className="auth-switch-box">
              <span>
                {mode === 'signup'
                  ? 'Already have an account?'
                  : "Don't have an account yet?"}
              </span>
              <button
                type="button"
                className="auth-link-btn highlight"
                onClick={() =>
                  changeMode(mode === 'signup' ? 'login' : 'signup')
                }
              >
                {mode === 'signup' ? 'Sign In' : 'Join Soulmates'}
              </button>
            </div>
          )}

          <div className="auth-footer-note">
            <ShieldCheck size={14} />
            <span>End-to-end encrypted &amp; community guarded.</span>
          </div>
        </div>
      </div>
    </div>
  );
                  }
