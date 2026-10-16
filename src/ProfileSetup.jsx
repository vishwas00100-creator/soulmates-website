import React, { useState } from 'react';
import { Heart, MapPin, UserRound, Sparkles } from 'lucide-react';
import { supabase } from './supabaseClient';

export default function ProfileSetup({ onComplete }) {
  const [form, setForm] = useState({
    full_name: '',
    date_of_birth: '',
    gender: '',
    bio: '',
    interests: [],
    country: '',
    city: ''
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const interestOptions = [
    'Music',
    'Travel',
    'Movies',
    'Reading',
    'Fitness',
    'Cooking',
    'Gaming',
    'Photography',
    'Nature',
    'Art',
    'Technology',
    'Sports'
  ];

  function handleChange(event) {
    const { name, value } = event.target;

    setForm(previous => ({
      ...previous,
      [name]: value
    }));
  }

  function toggleInterest(interest) {
    setForm(previous => ({
      ...previous,
      interests: previous.interests.includes(interest)
        ? previous.interests.filter(item => item !== interest)
        : [...previous.interests, interest]
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError('');
    setMessage('');

    if (!form.full_name.trim()) {
      setError('Please enter your name.');
      return;
    }

    if (!form.date_of_birth) {
      setError('Please enter your date of birth.');
      return;
    }

    const birthDate = new Date(`${form.date_of_birth}T00:00:00`);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();

    const birthdayNotReached =
      today.getMonth() < birthDate.getMonth() ||
      (
        today.getMonth() === birthDate.getMonth() &&
        today.getDate() < birthDate.getDate()
      );

    if (birthdayNotReached) {
      age--;
    }

    if (Number.isNaN(birthDate.getTime()) || age < 18 || birthDate > today) {
      setError('Soulmates is for adults aged 18 and above.');
      return;
    }

    setSaving(true);

    try {
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      if (!user) {
        throw new Error('Please log in again to continue.');
      }

      const { error: saveError } = await supabase
        .from('profiles')
        .upsert(
          {
            id: user.id,
            full_name: form.full_name.trim(),
            date_of_birth: form.date_of_birth,
            gender: form.gender || null,
            bio: form.bio.trim(),
            interests: form.interests,
            country: form.country.trim() || null,
            city: form.city.trim() || null,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'id' }
        );

      if (saveError) throw saveError;

      setMessage('Your profile has been saved successfully! ❤️');

      if (onComplete) {
        await onComplete();
      }
    } catch (err) {
      setError(err.message || 'Unable to save your profile. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <Heart size={27} fill="currentColor" />
          <span>SOULMATES.</span>
        </div>

        <div style={styles.iconBox}>
          <UserRound size={32} />
        </div>

        <h1 style={styles.heading}>Let's create your profile</h1>

        <p style={styles.subtitle}>
          Tell us a little about yourself. Your next meaningful connection
          starts here.
        </p>

        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Your full name *</label>

          <input
            style={styles.input}
            type="text"
            name="full_name"
            placeholder="Enter your name"
            value={form.full_name}
            onChange={handleChange}
            maxLength={80}
            required
          />

          <label style={styles.label}>Date of birth *</label>

          <input
            style={styles.input}
            type="date"
            name="date_of_birth"
            value={form.date_of_birth}
            onChange={handleChange}
            required
          />

          <label style={styles.label}>Gender</label>

          <select
            style={styles.input}
            name="gender"
            value={form.gender}
            onChange={handleChange}
          >
            <option value="">Select gender</option>
            <option value="Woman">Woman</option>
            <option value="Man">Man</option>
            <option value="Non-binary">Non-binary</option>
            <option value="Other">Other</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>

          <label style={styles.label}>About you</label>

          <textarea
            style={{ ...styles.input, minHeight: '100px', resize: 'vertical' }}
            name="bio"
            placeholder="Tell people about your personality and interests..."
            value={form.bio}
            onChange={handleChange}
            maxLength={500}
          />

          <div style={styles.counter}>
            {form.bio.length}/500 characters
          </div>

          <label style={styles.label}>
            <Sparkles size={16} style={{ verticalAlign: 'middle' }} /> Your
            interests
          </label>

          <p style={styles.helper}>
            Choose a few things you enjoy.
          </p>

          <div style={styles.interestGrid}>
            {interestOptions.map(interest => {
              const selected = form.interests.includes(interest);

              return (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  style={{
                    ...styles.interest,
                    ...(selected ? styles.interestSelected : {})
                  }}
                >
                  {selected ? '✓ ' : '+ '}
                  {interest}
                </button>
              );
            })}
          </div>

          <label style={styles.label}>
            <MapPin size={16} style={{ verticalAlign: 'middle' }} /> Country
          </label>

          <input
            style={styles.input}
            type="text"
            name="country"
            placeholder="e.g. India"
            value={form.country}
            onChange={handleChange}
            maxLength={100}
          />

          <label style={styles.label}>City</label>

          <input
            style={styles.input}
            type="text"
            name="city"
            placeholder="e.g. Mandya"
            value={form.city}
            onChange={handleChange}
            maxLength={100}
          />

          {error && <div style={styles.error}>{error}</div>}

          {message && <div style={styles.success}>{message}</div>}

          <button
            type="submit"
            disabled={saving}
            style={{
              ...styles.submit,
              opacity: saving ? 0.7 : 1
            }}
          >
            {saving ? 'Saving your profile...' : 'Save & Continue ❤️'}
          </button>

          <p style={styles.footer}>
            Your profile information will be saved securely in your account.
          </p>
        </form>
      </div>
    </main>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    padding: '25px 16px',
    boxSizing: 'border-box',
    background: 'linear-gradient(135deg, #fff8f8, #fff0f2)',
    fontFamily: "'DM Sans', sans-serif",
    color: '#30232a'
  },
  card: {
    maxWidth: '520px',
    margin: '0 auto',
    padding: '30px 24px',
    background: '#ffffff',
    borderRadius: '24px',
    boxShadow: '0 20px 70px rgba(120, 40, 65, 0.10)'
  },
  logo: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '9px',
    color: '#d94f70',
    fontWeight: 800,
    letterSpacing: '1px',
    fontSize: '17px',
    marginBottom: '30px'
  },
  iconBox: {
    width: '65px',
    height: '65px',
    margin: '0 auto 18px',
    borderRadius: '21px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#ffe8ed',
    color: '#e65b79'
  },
  heading: {
    textAlign: 'center',
    fontSize: '28px',
    lineHeight: 1.3,
    margin: '0 0 12px'
  },
  subtitle: {
    textAlign: 'center',
    color: '#7d6e75',
    lineHeight: 1.7,
    fontSize: '14px',
    marginBottom: '28px'
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: 700,
    margin: '20px 0 8px'
  },
  input: {
    display: 'block',
    width: '100%',
    boxSizing: 'border-box',
    padding: '13px 14px',
    border: '1px solid #eadfe3',
    borderRadius: '11px',
    background: '#fff',
    color: '#30232a',
    fontSize: '15px',
    outlineColor: '#e65b79'
  },
  counter: {
    textAlign: 'right',
    color: '#8a7b82',
    fontSize: '11px',
    marginTop: '5px'
  },
  helper: {
    fontSize: '12px',
    color: '#8a7b82',
    marginTop: '-2px'
  },
  interestGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '9px',
    marginTop: '12px'
  },
  interest: {
    padding: '10px 13px',
    borderRadius: '22px',
    border: '1px solid #eadfe3',
    background: '#fff',
    color: '#65545c',
    cursor: 'pointer',
    fontSize: '13px'
  },
  interestSelected: {
    background: '#ffe8ed',
    border: '1px solid #e65b79',
    color: '#b63e5d',
    fontWeight: 700
  },
  submit: {
    width: '100%',
    marginTop: '28px',
    padding: '16px',
    border: 'none',
    borderRadius: '12px',
    background: 'linear-gradient(100deg, #ed6a86, #df5074)',
    color: '#fff',
    fontWeight: 800,
    fontSize: '15px',
    cursor: 'pointer'
  },
  error: {
    marginTop: '18px',
    padding: '12px',
    background: '#fff0f0',
    borderRadius: '10px',
    color: '#b42318',
    fontSize: '13px',
    overflowWrap: 'anywhere'
  },
  success: {
    marginTop: '18px',
    padding: '12px',
    background: '#eafaf0',
    borderRadius: '10px',
    color: '#18794e',
    fontSize: '13px'
  },
  footer: {
    textAlign: 'center',
    marginTop: '18px',
    color: '#8a7b82',
    fontSize: '11px',
    lineHeight: 1.6
  }
};
