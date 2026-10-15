import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import { Heart, ArrowLeft, Mail, Lock, User } from 'lucide-react';

export default function Auth({ onClose, initialMode = 'signup' }) {
  const [mode, setMode] = useState(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name }
          }
        });

        if (error) throw error;

        setMessage(
          data.user && !data.session
            ? 'Account created! Check your email for a confirmation link.'
            : 'Welcome to Soulmates! Your account is ready.'
        );
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;

        setMessage('You are logged in successfully!');
      }
    } catch (error) {
      setMessage(error.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        <button onClick={onClose} style={styles.backButton}>
          <ArrowLeft size={18} /> Back to home
        </button>

        <div style={styles.logo}>
          <Heart size={27} fill="currentColor" />
        </div>

        <h1 style={styles.title}>
          {mode === 'signup' ? 'Find your person.' : 'Welcome back.'}
        </h1>

        <p style={styles.subtitle}>
          {mode === 'signup'
            ? 'Your next chapter could start with a hello.'
            : 'Your next chapter is waiting for you.'}
        </p>

        <div style={styles.switcher}>
          <button
            onClick={() => {
              setMode('signup');
              setMessage('');
            }}
            style={{
              ...styles.switchButton,
              ...(mode === 'signup' ? styles.activeSwitch : {})
            }}
          >
            Create account
          </button>

          <button
            onClick={() => {
              setMode('login');
              setMessage('');
            }}
            style={{
              ...styles.switchButton,
              ...(mode === 'login' ? styles.activeSwitch : {})
            }}
          >
            Log in
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <label style={styles.label}>
              Your name
              <span style={styles.inputWrap}>
                <User size={18} />
                <input
                  style={styles.input}
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  required
                />
              </span>
            </label>
          )}

          <label style={styles.label}>
            Email address
            <span style={styles.inputWrap}>
              <Mail size={18} />
              <input
                style={styles.input}
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </span>
          </label>

          <label style={styles.label}>
            Password
            <span style={styles.inputWrap}>
              <Lock size={18} />
              <input
                style={styles.input}
                type="password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={
                  mode === 'signup' ? 'new-password' : 'current-password'
                }
                minLength={8}
                required
              />
            </span>
          </label>

          {mode === 'signup' && (
            <p style={styles.ageNote}>
              By creating an account, you confirm that you are at least 18.
            </p>
          )}

          <button style={styles.submitButton} disabled={loading}>
            {loading
              ? 'Please wait...'
              : mode === 'signup'
                ? 'Create my account →'
                : 'Log in →'}
          </button>
        </form>

        {message && (
          <div role="status" aria-live="polite" style={styles.message}>
            {message}
          </div>
        )}

        <p style={styles.footerNote}>
          Your journey matters. Your privacy matters, too. ❤️
        </p>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #fff8f8, #fff0f2)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '24px 16px',
    boxSizing: 'border-box',
    fontFamily: "'DM Sans', sans-serif"
  },
  card: {
    width: '100%',
    maxWidth: '430px',
    background: '#ffffff',
    borderRadius: '25px',
    padding: '28px',
    boxSizing: 'border-box',
    boxShadow: '0 20px 70px rgba(120, 40, 65, 0.10)'
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    border: 'none',
    background: 'transparent',
    color: '#71646a',
    cursor: 'pointer',
    padding: '5px 0',
    fontSize: '14px'
  },
  logo: {
    width: '54px',
    height: '54px',
    borderRadius: '18px',
    background: '#ffe8ed',
    color: '#e65b79',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '25px'
  },
  title: {
    fontSize: '32px',
    lineHeight: 1.2,
    letterSpacing: '-1px',
    margin: '22px 0 8px',
    color: '#30232a'
  },
  subtitle: {
    color: '#7d6e75',
    lineHeight: 1.6,
    fontSize: '14px',
    marginBottom: '25px'
  },
  switcher: {
    display: 'flex',
    background: '#fff2f4',
    padding: '5px',
    borderRadius: '12px',
    marginBottom: '24px'
  },
  switchButton: {
    flex: 1,
    padding: '12px 6px',
    border: 'none',
    borderRadius: '9px',
    background: 'transparent',
    color: '#806c74',
    cursor: 'pointer',
    fontWeight: 600
  },
  activeSwitch: {
    background: '#ffffff',
    color: '#d94f70',
    boxShadow: '0 2px 8px rgba(70, 20, 40, 0.07)'
  },
  label: {
    display: 'block',
    marginBottom: '17px',
    color: '#43353b',
    fontSize: '13px',
    fontWeight: 600
  },
  inputWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    border: '1px solid #eadfe3',
    borderRadius: '12px',
    padding: '0 13px',
    marginTop: '8px',
    color: '#b18a98',
    minHeight: '49px'
  },
  input: {
    width: '100%',
    minWidth: 0,
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontSize: '14px',
    color: '#30232a'
  },
  ageNote: {
    fontSize: '12px',
    color: '#82727a',
    lineHeight: 1.5,
    margin: '0 0 17px'
  },
  submitButton: {
    width: '100%',
    border: 'none',
    borderRadius: '12px',
    padding: '15px',
    background: 'linear-gradient(100deg, #ed6a86, #df5074)',
    color: '#ffffff',
    fontWeight: 700,
    fontSize: '15px',
    cursor: 'pointer'
  },
  message: {
    marginTop: '18px',
    padding: '12px',
    borderRadius: '10px',
    background: '#fff2f4',
    color: '#9e3854',
    fontSize: '13px',
    lineHeight: 1.6,
    overflowWrap: 'anywhere'
  },
  footerNote: {
    textAlign: 'center',
    color: '#8a7b82',
    fontSize: '12px',
    lineHeight: 1.6,
    margin: '24px 0 0'
  }
};
