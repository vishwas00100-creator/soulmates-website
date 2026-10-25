import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import {
  Heart,
  User,
  MapPin,
  Calendar,
  Sparkles,
  LoaderCircle,
  CheckCircle,
} from 'lucide-react';

const INTEREST_OPTIONS = [
  'Travel',
  'Music',
  'Movies',
  'Reading',
  'Fitness',
  'Cooking',
  'Photography',
  'Gaming',
  'Nature',
  'Art',
  'Technology',
  'Sports',
  'Dancing',
  'Food',
  'Pets',
];

export default function ProfileSetup({ onComplete }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    full_name: '',
    date_of_birth: '',
    gender: '',
    country: '',
    city: '',
    bio: '',
    interests: [],
  });

  useEffect(() => {
    async function loadProfile() {
      if (!supabase) {
        setError('Supabase is not configured.');
        setLoading(false);
        return;
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError('Please log in to create your profile.');
        setLoading(false);
        return;
      }

      const { data, error: profileError } = await supabase
        .from('profiles')
        .select(
          'full_name, date_of_birth, gender, country, city, bio, interests'
        )
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        setError(profileError.message);
      } else if (data) {
        setForm((previous) => ({
          ...previous,
          ...data,
          interests: Array.isArray(data.interests)
            ? data.interests
            : [],
        }));
      } else if (user.user_metadata?.full_name) {
        setForm((previous) => ({
          ...previous,
          full_name: user.user_metadata.full_name,
        }));
      }

      setLoading(false);
    }

    loadProfile();
  }, []);

  function updateField(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function toggleInterest(interest) {
    setForm((previous) => ({
      ...previous,
      interests: previous.interests.includes(interest)
        ? previous.interests.filter((item) => item !== interest)
        : [...previous.interests, interest],
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!supabase) {
      setError('Supabase is not configured.');
      return;
    }

    if (!form.full_name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!form.date_of_birth) {
      setError('Please enter your date of birth.');
      return;
    }

    const birthDate = new Date(`${form.date_of_birth}T00:00:00`);
    const today = new Date();
    const adultCutoff = new Date(
      today.getFullYear() - 18,
      today.getMonth(),
      today.getDate()
    );

    if (
      Number.isNaN(birthDate.getTime()) ||
      birthDate > adultCutoff
    ) {
      setError('Soulmates is for adults aged 18 and over.');
      return;
    }

    if (!form.gender) {
      setError('Please select your gender.');
      return;
    }

    setSaving(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      if (!user) {
        throw new Error('Your session has expired. Please log in again.');
      }

      const profile = {
        id: user.id,
        full_name: form.full_name.trim(),
        date_of_birth: form.date_of_birth,
        gender: form.gender,
        country: form.country.trim(),
        city: form.city.trim(),
        bio: form.bio.trim(),
        interests: form.interests,
        updated_at: new Date().toISOString(),
      };

      const { error: saveError } = await supabase
        .from('profiles')
        .upsert(profile, { onConflict: 'id' });

      if (saveError) throw saveError;

      setSuccess('Your profile has been saved!');

      if (onComplete) {
        await onComplete();
      }
    } catch (err) {
      setError(err.message || 'Could not save your profile.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="profile-loading">
        <LoaderCircle className="spin" size={30} />
        <p>Loading your profile...</p>
      </div>
    );
  }

  return (
    <main className="profile-page">
      <section className="profile-card">
        <div className="profile-heading-icon">
          <Heart size={27} fill="currentColor" />
        </div>

        <p className="profile-eyebrow">YOUR STORY STARTS HERE</p>

        <h1>Create your profile</h1>

        <p className="profile-subtitle">
          Tell people a little about yourself and what makes you unique.
        </p>

        {error && (
          <div className="profile-alert profile-error" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="profile-alert profile-success" role="status">
            <CheckCircle size={18} />
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label className="profile-label">
            <span>
              <User size={17} /> Full name
            </span>

            <input
              name="full_name"
              value={form.full_name}
              onChange={updateField}
              placeholder="What should people call you?"
              maxLength={80}
              required
            />
          </label>

          <label className="profile-label">
            <span>
              <Calendar size={17} /> Date of birth
            </span>

            <input
              name="date_of_birth"
              type="date"
              value={form.date_of_birth || ''}
              onChange={updateField}
              max={new Date(
                new Date().getFullYear() - 18,
                new Date().getMonth(),
                new Date().getDate()
              ).toISOString().slice(0, 10)}
              required
            />

            <small>You must be at least 18 years old.</small>
          </label>

          <label className="profile-label">
            <span>Gender</span>

            <select
              name="gender"
              value={form.gender}
              onChange={updateField}
              required
            >
              <option value="">Select your gender</option>
              <option value="man">Man</option>
              <option value="woman">Woman</option>
              <option value="non-binary">Non-binary</option>
              <option value="other">Other</option>
            </select>
          </label>

          <div className="profile-two-columns">
            <label className="profile-label">
              <span>
                <MapPin size={17} /> Country
              </span>

              <input
                name="country"
                value={form.country}
                onChange={updateField}
                placeholder="India"
                maxLength={80}
              />
            </label>

            <label className="profile-label">
              <span>City</span>

              <input
                name="city"
                value={form.city}
                onChange={updateField}
                placeholder="Your city"
                maxLength={100}
              />
            </label>
          </div>

          <label className="profile-label">
            <span>
              <Sparkles size={17} /> About me
            </span>

            <textarea
              name="bio"
              value={form.bio}
              onChange={updateField}
              placeholder="What do you enjoy? What are you looking for?"
              rows={4}
              maxLength={500}
            />

            <small>{form.bio.length}/500 characters</small>
          </label>

          <fieldset className="profile-interests">
            <legend>Choose your interests</legend>

            <p>Select the things you enjoy.</p>

            <div className="profile-interest-list">
              {INTEREST_OPTIONS.map((interest) => {
                const selected = form.interests.includes(interest);

                return (
                  <button
                    key={interest}
                    type="button"
                    className={
                      selected
                        ? 'profile-interest selected'
                        : 'profile-interest'
                    }
                    aria-pressed={selected}
                    onClick={() => toggleInterest(interest)}
                  >
                    {selected ? '✓ ' : '+ '}
                    {interest}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <button
            type="submit"
            className="profile-save-button"
            disabled={saving}
          >
            {saving ? (
              <>
                <LoaderCircle className="spin" size={19} />
                Saving profile...
              </>
            ) : (
              <>
                Save my profile <Heart size={19} />
              </>
            )}
          </button>
        </form>
      </section>
    </main>
  );
}
