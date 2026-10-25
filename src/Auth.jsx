import React, { useState } from 'react';
import { supabase } from './supabaseClient.js';
import {
  Heart,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  LoaderCircle,
  ArrowLeft,
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
        const { data, error: signupError } =
          await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: {
              data: {
                full_name: fullName.trim(),
              },
              emailRedirectTo: window.location.origin +
                import.meta.env.BASE_URL,
            },
          });

        if (signupError) throw signupError;

        if (data.session) {
          setMessage('Your account has been created successfully!');

          if (onSuccess) onSuccess(data.session);
        } else {
          setMessage(
            'Account created! Please check your email and confirm your account before logging in.'
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
          await supabase.auth.resetPasswordForEmail(
            email.trim(),
            { redirectTo }
          );

        if (resetError) throw resetError;

        setMessage(
          'If an account exists for this email, password-reset instructions will be sent.'
        );
      }
    } catch (err) {
      setError(
        err?.message || 'Something went wrong. Please try again.'
      );
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
      <div className="auth-card">
        <button
          type="button"
          className="auth-back"
          onClick={onBack}
          aria-label="Go back"
        >
          <ArrowLeft size={19} />
          <span>Back</span>
        </button>

        <div className="auth-brand">
          <div className="auth-brand-icon">
            <Heart size={26} fill="currentColor" />
          </div>

          <h1>Soulmates</h1>

          <p>
            {mode === 'signup'
              ? 'Your next beautiful chapter starts here.'
              : mode === 'forgot'
                ? 'Let’s help you get back in.'
                : 'Real connections. Meaningful relationships.'}
          </p>
        </div>

        <div className="auth-tabs">
          <button
            type="button"
            className={mode !== 'signup' && mode !== 'forgot' ? 'active' : ''}
            onClick={() => changeMode('login')}
          >
            Log in
          </button>

          <button
            type="button"
            className={mode === 'signup' ? 'active' : ''}
            onClick={() => changeMode('signup')}
          >
            Sign up
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div className="auth-field">
              <label htmlFor="auth-name">Full name</label>

              <div className="auth-input-wrap">
                <input
                  id="auth-name"
                  type="text"
                  placeholder="Enter your name"
                  value={fullName}
                  onChange={(event) =>
                    setFullName(event.target.value)
                  }
                  autoComplete="name"
                  required
                />
              </div>
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="auth-email">Email address</label>

            <div className="auth-input-wrap">
              <Mail size={19} />

              <input
                id="auth-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                autoComplete="email"
                required
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div className="auth-field">
              <label htmlFor="auth-password">Password</label>

              <div className="auth-input-wrap">
                <Lock size={19} />

                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
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
                  className="auth-password-toggle"
                  onClick={() =>
                    setShowPassword((previous) => !previous)
                  }
                  aria-label={
                    showPassword ? 'Hide password' : 'Show password'
                  }
                >
                  {showPassword
                    ? <EyeOff size={19} />
                    : <Eye size={19} />}
                </button>
              </div>
            </div>
          )}

          {mode === 'login' && (
            <div className="auth-forgot-row">
              <button
                type="button"
                className="auth-text-button"
                onClick={() => changeMode('forgot')}
              >
                Forgot password?
              </button>
            </div>
          )}

          {error && (
            <div className="auth-alert auth-alert-error" role="alert">
              {error}
            </div>
          )}

          {message && (
            <div
              className="auth-alert auth-alert-success"
              role="status"
            >
              {message}
            </div>
          )}

          <button
            className="auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <LoaderCircle className="auth-spinner" size={20} />
                Please wait...
              </>
            ) : (
              <>
                {mode === 'signup'
                  ? 'Create account'
                  : mode === 'forgot'
                    ? 'Send reset email'
                    : 'Log in'}

                <ArrowRight size={19} />
              </>
            )}
          </button>
        </form>

        {mode === 'forgot' && (
          <button
            type="button"
            className="auth-text-button auth-return-login"
            onClick={() => changeMode('login')}
          >
            Return to login
          </button>
        )}

        {mode !== 'forgot' && (
          <p className="auth-switch">
            {mode === 'signup'
              ? 'Already have an account?'
              : 'New to Soulmates?'}

            <button
              type="button"
              className="auth-text-button"
              onClick={() =>
                changeMode(
                  mode === 'signup' ? 'login' : 'signup'
                )
              }
            >
              {mode === 'signup' ? 'Log in' : 'Join for free'}
            </button>
          </p>
        )}

        <p className="auth-terms">
          By continuing, you agree to use Soulmates respectfully
          and follow our community guidelines.
        </p>
      </div>
    </div>
  );
}
