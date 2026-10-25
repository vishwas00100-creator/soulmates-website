import React, { useEffect, useState, useCallback } from 'react';
import {
  Heart,
  X,
  MapPin,
  Sparkles,
  LoaderCircle,
  RefreshCw,
  LogOut,
  SlidersHorizontal,
  RotateCcw,
  Star,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { supabase } from './supabaseClient.js';

export default function Discover({ onLogout, onMatch }) {
  const [profiles, setProfiles] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swiping, setSwiping] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [direction, setDirection] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [minAge, setMinAge] = useState(18);
  const [maxAge, setMaxAge] = useState(60);
  const [genderFilter, setGenderFilter] = useState('all');

  const currentProfile = profiles[index];

  const loadProfiles = useCallback(async () => {
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
      console.error('Discover loading error:', err);
      setError(
        err.message || 'Could not load profiles. Please try again.'
      );
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  const visibleProfiles = profiles.filter((person) => {
    const age = Number(person.age);
    const matchesAge =
      Number.isFinite(age) && age >= minAge && age <= maxAge;

    const matchesGender =
      genderFilter === 'all' ||
      String(person.gender || '').toLowerCase() ===
        genderFilter.toLowerCase();

    return matchesAge && matchesGender;
  });

  const activeProfile = visibleProfiles[index];

  async function handleSwipe(action) {
    if (!activeProfile || swiping) return;

    setSwiping(true);
    setError('');
    setNotice('');
    setDirection(action);

    try {
      const { data, error: swipeError } = await supabase.rpc(
        'record_swipe',
        {
          p_target_user_id: activeProfile.id,
          p_action: action,
        }
      );

      if (swipeError) throw swipeError;

      setNotice(
        action === 'like'
          ? `You liked ${activeProfile.full_name || 'this person'} ❤️`
          : 'Profile passed. Keep discovering!'
      );

      setProfiles((previous) =>
        previous.filter((person) => person.id !== activeProfile.id)
      );
      setIndex(0);

      const matched =
        data?.matched === true ||
        data?.match === true ||
        data?.is_match === true;

      if (matched) {
        setNotice(
          `It's a match with ${activeProfile.full_name || 'someone'}! ❤️`
        );
      }
    } catch (err) {
      console.error('Swipe failed:', err);
      setError(
        err.message || 'Your action could not be saved. Try again.'
      );
    } finally {
      setSwiping(false);
      setDirection('');
    }
  }

  function getInitials(name) {
    return String(name || 'Soulmate')
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  }

  if (loading) {
    return (
      <main className="discover-loading">
        <div className="loading-heart">
          <Heart size={30} fill="currentColor" />
        </div>
        <LoaderCircle size={28} className="discover-spin" />
        <h2>Finding your connections...</h2>
        <p>Your next story might be one swipe away.</p>
      </main>
    );
  }

  return (
    <main className="discover-shell">
      <header className="discover-topbar">
        <button
          className="discover-brand"
          type="button"
          onClick={loadProfiles}
          aria-label="Soulmates home"
        >
          <span className="brand-heart">
            <Heart size={23} fill="currentColor" />
          </span>
          <span>
            SOULMATES<span className="brand-dot">.</span>
          </span>
        </button>

        <div className="discover-tagline">
          Meaningful connections. Worldwide.
        </div>

        <div className="discover-top-actions">
          <button
            type="button"
            className="icon-button"
            onClick={loadProfiles}
            aria-label="Refresh profiles"
            title="Refresh profiles"
          >
            <RefreshCw size={19} />
          </button>

          {onLogout && (
            <button
              type="button"
              className="icon-button"
              onClick={onLogout}
              aria-label="Log out"
              title="Log out"
            >
              <LogOut size={19} />
            </button>
          )}
        </div>
      </header>

      <div className="discover-layout">
        <aside className="discover-sidebar">
          <div className="sidebar-label">YOUR SPACE</div>

          <button
            className="sidebar-link sidebar-link-active"
            type="button"
          >
            <Sparkles size={20} />
            <span>Discover</span>
          </button>

          <button
            className="sidebar-link"
            type="button"
            onClick={onMatch}
          >
            <Heart size={20} />
            <span>Matches</span>
          </button>

          <div className="sidebar-promo">
            <div className="promo-heart">
              <Heart size={25} fill="currentColor" />
            </div>
            <h3>Love starts with hello.</h3>
            <p>
              Discover new people, share interests, and build
              meaningful connections.
            </p>
          </div>

          <div className="sidebar-footer">
            Made with <Heart size={13} fill="currentColor" /> for
            connection.
          </div>
        </aside>

        <section className="discover-main">
          <div className="discover-heading">
            <div>
              <span className="discover-eyebrow">
                YOUR NEXT CONNECTION
              </span>
              <h1>Discover</h1>
              <p>Swipe right if you're interested, left if not.</p>
            </div>

            <button
              type="button"
              className={`filter-button ${
                showFilters ? 'filter-button-active' : ''
              }`}
              onClick={() => setShowFilters((value) => !value)}
              aria-label="Toggle filters"
              title="Filters"
            >
              <SlidersHorizontal size={20} />
            </button>
          </div>

          {showFilters && (
            <div className="discover-filters">
              <div className="filter-field">
                <label htmlFor="min-age">Minimum age</label>
                <select
                  id="min-age"
                  value={minAge}
                  onChange={(event) =>
                    setMinAge(Number(event.target.value))
                  }
                >
                  {Array.from({ length: 43 }, (_, i) => i + 18).map(
                    (age) => (
                      <option key={age} value={age}>
                        {age}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="filter-field">
                <label htmlFor="max-age">Maximum age</label>
                <select
                  id="max-age"
                  value={maxAge}
                  onChange={(event) =>
                    setMaxAge(Number(event.target.value))
                  }
                >
                  {Array.from({ length: 43 }, (_, i) => i + 18).map(
                    (age) => (
                      <option key={age} value={age}>
                        {age}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="filter-field">
                <label htmlFor="gender-filter">Gender</label>
                <select
                  id="gender-filter"
                  value={genderFilter}
                  onChange={(event) =>
                    setGenderFilter(event.target.value)
                  }
                >
                  <option value="all">Everyone</option>
                  <option value="woman">Woman</option>
                  <option value="man">Man</option>
                  <option value="non-binary">Non-binary</option>
                </select>
              </div>
            </div>
          )}

          {error && (
            <div className="discover-alert discover-alert-error">
              <AlertCircle size={19} />
              <span>{error}</span>
              <button type="button" onClick={loadProfiles}>
                Retry
              </button>
            </div>
          )}

          {notice && (
            <div className="discover-alert discover-alert-success">
              <CheckCircle2 size={19} />
              <span>{notice}</span>
            </div>
          )}

          {!error && visibleProfiles.length === 0 && (
            <div className="discover-empty">
              <div className="empty-heart">
                <Heart size={38} />
              </div>
              <h2>No more profiles right now</h2>
              <p>
                Try adjusting your filters or come back later to
                discover more people.
              </p>
              <button
                type="button"
                className="discover-primary-button"
                onClick={loadProfiles}
              >
                <RefreshCw size={18} />
                Refresh profiles
              </button>
            </div>
          )}

          {!error && activeProfile && (
            <>
              <div className="profile-card-stage">
                <article
                  className={`dating-profile-card ${
                    direction ? `swipe-${direction}` : ''
                  }`}
                  key={activeProfile.id}
                >
                  <div className="profile-photo-area">
                    {activeProfile.photo_url ||
                    activeProfile.avatar_url ||
                    activeProfile.profile_photo ? (
                      <img
                        className="profile-photo"
                        src={
                          activeProfile.photo_url ||
                          activeProfile.avatar_url ||
                          activeProfile.profile_photo
                        }
                        alt={activeProfile.full_name || 'Member'}
                        onError={(event) => {
                          event.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="profile-photo-placeholder">
                        <div className="placeholder-orb">
                          {getInitials(activeProfile.full_name)}
                        </div>
                        <span className="placeholder-caption">
                          A new connection awaits
                        </span>
                      </div>
                    )}

                    <div className="photo-top-badges">
                      <span className="online-badge">
                        <span className="online-dot" />
                        Soulmate
                      </span>
                      <span className="photo-count">
                        <Heart size={13} fill="currentColor" />
                        {index + 1}/{visibleProfiles.length}
                      </span>
                    </div>

                    <div className="profile-photo-gradient" />

                    <div className="profile-info-overlay">
                      <div className="profile-name-line">
                        <h2>
                          {activeProfile.full_name || 'Soulmate'}
                          {activeProfile.age
                            ? `, ${activeProfile.age}`
                            : ''}
                        </h2>
                      </div>

                      {(activeProfile.city ||
                        activeProfile.country) && (
                        <p className="profile-location">
                          <MapPin size={16} />
                          {[
                            activeProfile.city,
                            activeProfile.country,
                          ]
                            .filter(Boolean)
                            .join(', ')}
                        </p>
                      )}

                      {activeProfile.bio && (
                        <p className="profile-bio">
                          {activeProfile.bio}
                        </p>
                      )}

                      {activeProfile.interests && (
                        <div className="profile-interest-list">
                          {(Array.isArray(activeProfile.interests)
                            ? activeProfile.interests
                            : String(activeProfile.interests).split(',')
                          )
                            .map((item) => String(item).trim())
                            .filter(Boolean)
                            .slice(0, 5)
                            .map((interest, interestIndex) => (
                              <span
                                className="profile-interest-chip"
                                key={`${interest}-${interestIndex}`}
                              >
                                {interest}
                              </span>
                            ))}
                        </div>
                      )}
                    </div>

                    {direction && (
                      <div
                        className={`swipe-stamp swipe-stamp-${direction}`}
                      >
                        {direction === 'like' ? 'LIKE' : 'PASS'}
                      </div>
                    )}
                  </div>
                </article>
              </div>

              <div className="swipe-controls">
                <button
                  type="button"
                  className="swipe-action swipe-pass"
                  onClick={() => handleSwipe('pass')}
                  disabled={swiping}
                  aria-label="Pass on profile"
                  title="Pass"
                >
                  {swiping && direction === 'pass' ? (
                    <LoaderCircle size={24} className="discover-spin" />
                  ) : (
                    <X size={31} strokeWidth={2.8} />
                  )}
                </button>

                <button
                  type="button"
                  className="swipe-action swipe-like"
                  onClick={() => handleSwipe('like')}
                  disabled={swiping}
                  aria-label="Like profile"
                  title="Like"
                >
                  {swiping && direction === 'like' ? (
                    <LoaderCircle size={25} className="discover-spin" />
                  ) : (
                    <Heart size={29} fill="currentColor" />
                  )}
                </button>
              </div>

              <p className="swipe-hint">
                <Heart size={13} />
                Be kind. Make a genuine connection.
              </p>
            </>
          )}
        </section>

        <aside className="discover-right-sidebar">
          <div className="right-profile-card">
            <div className="right-profile-avatar">
              <Heart size={25} fill="currentColor" />
            </div>
            <div>
              <h3>Your journey</h3>
              <p>One connection at a time.</p>
            </div>
          </div>

          <div className="world-card">
            <div className="world-icon">
              <Sparkles size={24} />
            </div>
            <h3>Real people.</h3>
            <h3>Meaningful connections.</h3>
            <p>
              Your next great conversation could start anywhere
              in the world.
            </p>
            <div className="world-heart">
              <Heart size={25} fill="currentColor" />
            </div>
          </div>

          <div className="safety-note">
            <CheckCircle2 size={20} />
            <div>
              <strong>Your safety matters</strong>
              <p>
                Take your time getting to know someone. Never share
                passwords or financial information.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
