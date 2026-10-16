import React, { useEffect, useState } from 'react';
import Auth from './Auth.jsx';
import ProfileSetup from './ProfileSetup.jsx';
import Discover from './Discover.jsx';
import { supabase } from './supabaseClient';
import {
  Heart,
  LogOut,
  UserRound,
  LoaderCircle,
  Compass
} from 'lucide-react';

export default function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('signup');
  const [page, setPage] = useState('discover');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function initialize() {
      try {
        const {
          data: { session: currentSession },
          error: sessionError
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;
        if (!active) return;

        setSession(currentSession);

        if (currentSession) {
          await loadProfile(currentSession.user.id);
        }
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    initialize();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!active) return;

      setSession(newSession);
      setError('');

      if (!newSession) {
        setProfile(null);
        setShowAuth(false);
        setPage('discover');
        setLoading(false);
        return;
      }

      setShowAuth(false);
      setLoading(true);

      // Defer profile loading to avoid running another Supabase
      // request directly inside the authentication callback.
      setTimeout(async () => {
        if (!active) return;

        try {
          await loadProfile(newSession.user.id);
        } catch (err) {
          if (active) setError(err.message);
        } finally {
          if (active) setLoading(false);
        }
      }, 0);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  async function loadProfile(userId) {
    const { data, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (profileError) throw profileError;

    setProfile(data);
  }

  async function handleLogout() {
    const { error: logoutError } = await supabase.auth.signOut();

    if (logoutError) {
      setError(logoutError.message);
      return;
    }

    setSession(null);
    setProfile(null);
    setShowAuth(false);
    setPage('discover');
  }

  function openAuth(mode) {
    setAuthMode(mode);
    setShowAuth(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (loading) {
    return (
      <main style={styles.center}>
        <LoaderCircle size={35} />
        <p>Loading Soulmates...</p>
      </main>
    );
  }

  if (session && !profile) {
    return (
      <ProfileSetup
        onComplete={async () => {
          await loadProfile(session.user.id);
          setPage('discover');
        }}
      />
    );
  }

  if (session && profile && page === 'discover') {
    return (
      <Discover onLogout={handleLogout} />
    );
  }

  if (session && profile && page === 'profile') {
    return (
      <main style={styles.page}>
        <header style={styles.header}>
          <div style={styles.brand}>
            <Heart fill="currentColor" size={24} />
            SOULMATES<span>.</span>
          </div>

          <button style={styles.button} onClick={handleLogout}>
            <LogOut size={17} />
            Log out
          </button>
        </header>

        <section style={styles.profileCard}>
          <div style={styles.avatar}>
            <UserRound size={42} />
          </div>

          <p style={styles.eyebrow}>YOUR SOULMATES PROFILE</p>

          <h1>Welcome, {profile.full_name || 'friend'}! ❤️</h1>

          <p style={styles.bio}>
            {profile.bio || 'Your story starts here.'}
          </p>

          {(profile.city || profile.country) && (
            <p style={styles.detail}>
              📍 {[profile.city, profile.country].filter(Boolean).join(', ')}
            </p>
          )}

          {profile.gender && (
            <p style={styles.detail}>Gender: {profile.gender}</p>
          )}

          {profile.interests?.length > 0 && (
            <div style={styles.interests}>
              {profile.interests.map(interest => (
                <span key={interest} style={styles.interest}>
                  {interest}
                </span>
              ))}
            </div>
          )}

          <button
            style={styles.primary}
            onClick={() => setPage('discover')}
          >
            <Compass size={18} />
            Discover people
          </button>
        </section>

        <nav style={styles.bottomNav}>
          <button onClick={() => setPage('discover')}>
            <Compass size={20} />
            Discover
          </button>

          <button onClick={() => setPage('profile')}>
            <UserRound size={20} />
            Profile
          </button>
        </nav>
      </main>
    );
  }

  if (showAuth) {
    return (
      <Auth
        initialMode={authMode}
        onClose={() => setShowAuth(false)}
      />
    );
  }

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <div style={styles.brand}>
          <Heart fill="currentColor" size={24} />
          SOULMATES<span>.</span>
        </div>

        <button
          style={styles.button}
          onClick={() => openAuth('login')}
        >
          Log in
        </button>
      </header>

      <section style={styles.hero}>
        <div style={styles.heartIcon}>
          <Heart fill="currentColor" size={35} />
        </div>

        <p style={styles.eyebrow}>WHERE HEARTS FIND EACH OTHER</p>

        <h1>
          Some connections
          <br />
          just feel like <span style={styles.highlight}>home.</span>
        </h1>

        <p style={styles.description}>
          Meet people who make the little things feel special.
          Your next meaningful connection could be one hello away.
        </p>

        <button
          style={styles.primary}
          onClick={() => openAuth('signup')}
        >
          Join Soulmates ❤️
        </button>

        <p style={styles.note}>
          Free to get started · For adults aged 18 and above
        </p>
      </section>

      {error && <p style={styles.error}>{error}</p>}
    </main>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #fff8f8, #fff0f2)',
    fontFamily: "'DM Sans', sans-serif",
    color: '#30232a',
    padding: '20px',
    boxSizing: 'border-box'
  },
  center: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'DM Sans', sans-serif",
    color: '#d94f70'
  },
  header: {
    maxWidth: '1100px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px'
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#d94f70',
    fontWeight: 800,
    letterSpacing: '1px'
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    border: '1px solid #eadfe3',
    borderRadius: '10px',
    padding: '10px 15px',
    background: '#fff',
    color: '#43353b',
    cursor: 'pointer'
  },
  hero: {
    maxWidth: '720px',
    margin: '75px auto 40px',
    textAlign: 'center',
    padding: '20px 0'
  },
  heartIcon: {
    width: '70px',
    height: '70px',
    margin: '0 auto 24px',
    borderRadius: '23px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#ffe8ed',
    color: '#e65b79'
  },
  eyebrow: {
    color: '#d94f70',
    fontSize: '11px',
    fontWeight: 800,
    letterSpacing: '1.5px'
  },
  highlight: {
    color: '#e65b79'
  },
  description: {
    maxWidth: '500px',
    margin: '20px auto 28px',
    color: '#7d6e75',
    fontSize: '16px',
    lineHeight: 1.8
  },
  primary: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    border: 'none',
    borderRadius: '13px',
    padding: '16px 28px',
    background: 'linear-gradient(100deg, #ed6a86, #df5074)',
    color: '#fff',
    fontWeight: 700,
    fontSize: '15px',
    cursor: 'pointer'
  },
  note: {
    marginTop: '18px',
    color: '#8a7b82',
    fontSize: '12px'
  },
  profileCard: {
    maxWidth: '560px',
    margin: '60px auto',
    padding: '35px 25px',
    background: '#fff',
    borderRadius: '24px',
    textAlign: 'center',
    boxShadow: '0 20px 70px rgba(120, 40, 65, 0.10)'
  },
  avatar: {
    width: '90px',
    height: '90px',
    margin: '0 auto 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    background: '#ffe8ed',
    color: '#e65b79'
  },
  bio: {
    color: '#7d6e75',
    lineHeight: 1.8,
    overflowWrap: 'anywhere'
  },
  detail: {
    color: '#65545c',
    fontSize: '14px'
  },
  interests: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '20px',
    marginBottom: '25px'
  },
  interest: {
    padding: '8px 12px',
    borderRadius: '20px',
    background: '#ffe8ed',
    color: '#b63e5d',
    fontSize: '13px'
  },
  bottomNav: {
    display: 'flex',
    justifyContent: 'center',
    gap: '35px',
    padding: '15px',
    margin: '20px auto 0',
    color: '#d94f70'
  },
  error: {
    color: '#b42318',
    textAlign: 'center',
    overflowWrap: 'anywhere'
  }
};
