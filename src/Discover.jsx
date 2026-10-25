import React, { useCallback, useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import {
  Heart,
  X,
  MapPin,
  Sparkles,
  LoaderCircle,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

export default function Discover({ onMatch }) {
  const [profiles, setProfiles] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swiping, setSwiping] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadProfiles = useCallback(async () => {
    if (!supabase) {
      setError('Supabase is not configured.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    setNotice('');
    setIndex(0);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      if (!user) {
        throw new Error('Please log in to discover people.');
      }

      const { data, error: rpcError } = await supabase.rpc(
        'get_discover_profiles'
      );

      if (rpcError) throw rpcError;

      setProfiles(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err.message ||
          'Could not load profiles. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  async function handleSwipe(action) {
    const profile = profiles[index];

    if (!profile || swiping || !supabase) return;

    setSwiping(true);
    setError('');
    setNotice('');

    try {
      const { data, error: swipeError } = await supabase.rpc(
        'record_swipe',
        {
          p_target_user_id: profile.id,
          p_action: action,
        }
      );

      if (swipeError) throw swipeError;

      setIndex((current) => current + 1);

      const result = Array.isArray(data) ? data[0] : data;

      if (action === 'like') {
        if (result?.matched) {
          setNotice(`It's a match with ${profile.full_name || 'someone'}! ❤️`);

          if (onMatch) {
            onMatch({
              ...profile,
              match: result,
            });
          }
        } else {
          setNotice(`You liked ${profile.full_name || 'this profile'} ❤️`);
        }
      } else {
        setNotice('Profile passed.');
      }
    } catch (err) {
      setError(
        err.message ||
          'Your choice could not be saved. Please try again.'
      );
    } finally {
      setSwiping(false);
    }
  }

  if (loading) {
    return (
      <section className="discover-state">
        <LoaderCircle className="spin" size={34} />
        <p>Finding people for you...</p>
      </section>
    );
  }

  if (error && profiles.length === 0) {
    return (
      <section className="discover-state">
        <AlertCircle size={34} />
        <h2>We couldn't load profiles</h2>
        <p>{error}</p>

        <button
          type="button"
          className="discover-retry"
          onClick={loadProfiles}
        >
          <RefreshCw size={18} />
          Try again
        </button>
      </section>
    );
  }

  if (index >= profiles.length) {
    return (
      <section className="discover-state">
        <div className="discover-empty-icon">
          <Heart size={34} />
        </div>

        <h2>You've seen everyone for now</h2>

        <p>
          New connections may appear as more people join Soulmates.
        </p>

        <button
          type="button"
          className="discover-retry"
          onClick={loadProfiles}
        >
          <RefreshCw size={18} />
          Refresh profiles
        </button>
      </section>
    );
  }

  const profile = profiles[index];

  return (
    <main className="discover-page">
      <header className="discover-heading">
        <div>
          <span className="discover-eyebrow">
            <Sparkles size={15} /> YOUR NEXT CONNECTION
          </span>

          <h1>Discover</h1>

          <p>Meet people. Find your kind of connection.</p>
        </div>

        <span className="discover-count">
          {index + 1} / {profiles.length}
        </span>
      </header>

      {notice && (
        <div className="discover-notice" role="status">
          {notice}
        </div>
      )}

      {error && (
        <div className="discover-error" role="alert">
          {error}
        </div>
      )}

      <article className="discover-card">
        <div className="discover-photo-placeholder">
          <div className="discover-avatar">
            {(profile.full_name || '?')
              .trim()
              .charAt(0)
              .toUpperCase()}
          </div>

          <span className="discover-photo-caption">
            <Heart size={15} fill="currentColor" />
            A new possibility
          </span>
        </div>

        <div className="discover-profile-info">
          <h2>
            {profile.full_name || 'Soulmates member'}
            {profile.age ? `, ${profile.age}` : ''}
          </h2>

          {(profile.city || profile.country) && (
            <p className="discover-location">
              <MapPin size={17} />

              {[profile.city, profile.country]
                .filter(Boolean)
                .join(', ')}
            </p>
          )}

          {profile.bio && (
            <p className="discover-bio">{profile.bio}</p>
          )}

          {Array.isArray(profile.interests) &&
            profile.interests.length > 0 && (
              <div className="discover-interests">
                {profile.interests.map((interest) => (
                  <span key={interest}>{interest}</span>
                ))}
              </div>
            )}
        </div>

        <div className="discover-actions">
          <button
            type="button"
            className="discover-pass"
            onClick={() => handleSwipe('pass')}
            disabled={swiping}
            aria-label="Pass on profile"
          >
            <X size={27} />
          </button>

          <button
            type="button"
            className="discover-like"
            onClick={() => handleSwipe('like')}
            disabled={swiping}
            aria-label="Like profile"
          >
            {swiping ? (
              <LoaderCircle className="spin" size={25} />
            ) : (
              <Heart size={27} fill="currentColor" />
            )}
          </button>
        </div>
      </article>

      <p className="discover-footer">
        <Heart size={14} />
        Be kind. Be genuine. Build meaningful connections.
      </p>
    </main>
  );
}
