import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import {
  Heart,
  User,
  Calendar,
  MapPin,
  Sparkles,
  ArrowRight,
  LoaderCircle,
  CheckCircle
} from 'lucide-react';

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

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [saved, setSaved] = useState(false);

  const availableInterests = [
    'Music',
    'Travel',
    'Movies',
    'Cooking',
    'Fitness',
    'Reading',
    'Photography',
    'Gaming',
    'Nature',
    'Technology',
    'Art',
    'Sports'
  ];

  function updateField(event) {
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
    setLoading(true);
    setMessage('');
    setSaved(false);

    try {
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      if (!user) {
        throw new Error(
          'Please log in before creating your profile.'
        );
      }

      const birthDate = new Date(
        `${form.date_of_birth}T00:00:00`
      );

      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();

      const monthDifference =
        today.getMonth() - birthDate.getMonth();

      if (
        monthDifference < 0 ||
        (monthDifference === 0 &&
          today.getDate() < birthDate.getDate())
      ) {
        age--;
      }

      if (
        !form.date_of_birth ||
        Number.isNaN(birthDate.getTime()) ||
        age < 18 ||
        birthDate > today
      ) {
        throw new Error(
          'Soulmates is for adults aged 18 and above. Please enter a valid date of birth.'
        );
      }

      if (!form.full_name.trim()) {
        throw new Error('Please enter your name.');
      }

      const { error } = await supabase
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

      if (error) throw error;

      setSaved(true);
      setMessage('Your profile has been saved successfully! ❤️');
    } catch (error) {
      setMessage(
        error.message || 'Unable to save your profile. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    width: '100%',
    boxSizing: 'border-box',
    padding: '14px',
    border: '1px solid #eadfe3',
    borderRadius: '12px',
    fontSize: '15px',
    outlineColor: '#e65b79',
    background: '#fff',
    color: '#30232a'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: 600,
    color: '#43353b'
  };

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <button
          type="button"
          onClick={() => onComplete?.()}
          style={styles.backButton}
        >
          ← Back
        </button>

        <div style={styles.logo}>
          <Heart size={27} fill="currentColor" />
        </div>

        <span style={styles.eyebrow}>
          YOUR STORY STARTS HERE
        </span>

        <h1 style={styles.title}>
          Let's make it <span style={styles.highlight}>you.</span>
        </h1>

        <p style={styles.subtitle}>
          Tell us a little about yourself. Your next meaningful
          connection starts with being yourself.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={labelStyle} htmlFor="full_name">
              <User size={15} style={styles.labelIcon} />
              Your full name *
            </label>

            <input
              id="full_name"
              name="full_name"
              type="text"
              placeholder="What should we call you?"
              value={form.full_name}
              onChange={updateField}
              maxLength={80}
              autoComplete="name"
              required
              style={inputStyle}
            />
          </div>

          <div style={styles.field}>
            <label style={labelStyle} htmlFor="date_of_birth">
              <Calendar size={15} style={styles.labelIcon} />
              Date of birth *
            </label>

            <input
              id="date_of_birth"
              name="date_of_birth"
              type="date"
              value={form.date_of_birth}
              onChange={updateField}
              required
              style={inputStyle}
            />

            <small style={styles.helpText}>
              You must be at least 18 years old to use Soulmates.
            </small>
          </div>

          <div style={styles.field}>
            <label style={labelStyle} htmlFor="gender">
              Gender
            </label>

            <select
              id="gender"
              name="gender"
              value={form.gender}
              onChange={updateField}
              style={inputStyle}
            >
              <option value="">Prefer not to say</option>
              <option value="Woman">Woman</option>
              <option value="Man">Man</option>
              <option value="Non-binary">Non-binary</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div style={styles.field}>
            <label style={labelStyle} htmlFor="bio">
              About you
            </label>

            <textarea
              id="bio"
              name="bio"
              placeholder="What makes you, you?"
              value={form.bio}
              onChange={updateField}
              maxLength={500}
              rows={4}
              style={{
                ...inputStyle,
                resize: 'vertical',
                lineHeight: 1.6
              }}
            />

            <small style={styles.helpText}>
              {form.bio.length}/500 characters
            </small>
          </div>

          <div style={styles.field}>
            <label style={labelStyle}>
              <Sparkles size={15} style={styles.labelIcon} />
              Your interests
            </label>

            <p style={styles.helpText}>
              Choose the things you enjoy.
            </p>

            <div style={styles.interests}>
              {availableInterests.map(interest => {
                const selected =
                  form.interests.includes(interest);

                return (
                  <button
                    key={interest}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleInterest(interest)}
                    style={{
                      ...styles.interest,
                      ...(selected
                        ? styles.selectedInterest
                        : {})
                    }}
                  >
                    {selected ? '✓ ' : '+ '}
                    {interest}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={styles.locationGrid}>
            <div style={styles.field}>
              <label style={labelStyle} htmlFor="country">
                <MapPin size={15} style={styles.labelIcon} />
                Country
              </label>

              <input
                id="country"
                name="country"
                type="text"
                placeholder="e.g. India"
                value={form.country}
                onChange={updateField}
                maxLength={100}
                autoComplete="country-name"
                style={inputStyle}
              />
            </div>

            <div style={styles.field}>
              <label style={labelStyle} htmlFor="city">
                City
              </label>

              <input
                id="city"
                name="city"
                type="text"
                placeholder="e.g. Mandya"
                value={form.city}
                onChange={updateField}
                maxLength={100}
                autoComplete="address-level2"
                style={inputStyle}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitButton,
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? (
              <>
                <LoaderCircle size={18} />
                Saving profile...
              </>
            ) : (
              <>
                Save my profile
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {message && (
          <div
            role="status"
            aria-live="polite"
            style={{
              ...styles.message,
              ...(saved ? styles.successMessage : {})
            }}
          >
            {saved && <CheckCircle size={19} />}
            {message}
          </div>
        )}

        <p style={styles.privacyNote}>
          ❤️ Your story matters. Share only what you feel
          comfortable sharing.
        </p>
      </section>
    </main>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    boxSizing: 'border-box',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: '28px 16px',
    background: 'linear-gradient(135deg, #fff8f8, #fff0f2)',
    fontFamily: "'DM Sans', sans-serif"
  },

  card: {
    width: '100%',
    maxWidth: '560px',
    padding: '28px',
    boxSizing: 'border-box',
    background: '#fff',
    borderRadius: '24px',
    boxShadow: '0 20px 70px rgba(120, 40, 65, 0.10)'
  },

  backButton: {
    padding: '6px 0',
    border: 'none',
    background: 'transparent',
    color: '#71646a',
    fontSize: '14px',
    cursor: 'pointer'
  },

  logo: {
    width: '54px',
    height: '54px',
    marginTop: '20px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '18px',
    background: '#ffe8ed',
    color: '#e65b79'
  },

  eyebrow: {
    color: '#d94f70',
    fontSize: '11px',
    fontWeight: 800,
    letterSpacing: '1.5px'
  },

  title: {
    margin: '12px 0',
    color: '#30232a',
    fontSize: '34px',
    lineHeight: 1.2,
    letterSpacing: '-1px'
  },

  highlight: {
    color: '#e65b79'
  },

  subtitle: {
    marginBottom: '28px',
    color: '#7d6e75',
    fontSize: '14px',
    lineHeight: 1.7
  },

  field: {
    marginBottom: '22px',
    minWidth: 0
  },

  labelIcon: {
    marginRight: '6px',
    verticalAlign: 'middle',
    color: '#d95b79'
  },

  helpText: {
    display: 'block',
    marginTop: '7px',
    color: '#8a7b82',
    fontSize: '12px',
    lineHeight: 1.5
  },

  interests: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '9px',
    marginTop: '12px'
  },

  interest: {
    border: '1px solid #eadfe3',
    borderRadius: '20px',
    padding: '10px 13px',
    background: '#fff',
    color: '#65545c',
    fontSize: '13px',
    cursor: 'pointer'
  },

  selectedInterest: {
    background: '#ffe8ed',
    borderColor: '#e65b79',
    color: '#b63e5d',
    fontWeight: 700
  },

  locationGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '14px'
  },

  submitButton: {
    width: '100%',
    minHeight: '52px',
    padding: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    border: 'none',
    borderRadius: '12px',
    background: 'linear-gradient(100deg, #ed6a86, #df5074)',
    color: '#fff',
    fontWeight: 700,
    fontSize: '15px',
    cursor: 'pointer'
  },

  message: {
    display: 'flex',
    alignItems: 'center',
    gap: '9px',
    marginTop: '18px',
    padding: '13px',
    borderRadius: '10px',
    background: '#fff0f0',
    color: '#a23b50',
    fontSize: '13px',
    lineHeight: 1.6,
    overflowWrap: 'anywhere'
  },

  successMessage: {
    background: '#effaf3',
    color: '#217647'
  },

  privacyNote: {
    marginTop: '24px',
    marginBottom: 0,
    textAlign: 'center',
    color: '#8a7b82',
    fontSize: '12px',
    lineHeight: 1.7
  }
};
