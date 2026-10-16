import React, { useEffect, useState } from 'react';
import Auth from './Auth.jsx';
import ProfileSetup from './ProfileSetup.jsx';
import { supabase } from './supabaseClient';
import {
  Heart,
  LogOut,
  UserRound,
  LoaderCircle
} from 'lucide-react';

export default function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('signup');
  const [profileComplete, setProfileComplete] = useState(false);
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
    } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        if (!active) return;

        setSession(newSession);
        setError('');

        if (newSession) {
          setShowAuth(false);
          setLoading(true);

          try {
            await loadProfile(newSession.user.id);
          } catch (err) {
            if (active) setError(err.message);
          } finally {
            if (active) setLoading(false);
          }
        } else {
          setProfile(null);
          setProfileComplete(false);
          setLoading(false);
        }
      }
    );

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
    setProfileComplete(Boolean(data));
  }

  async function handleLogout() {
    const { error: logoutError } = await supabase.auth.signOut();

    if (logoutError) {
      setError(logoutError.message);
      return;
    }

    setSession(null);
    setProfile(null);
    setProfileComplete(false);
    setShowAuth(false);
  }

  function openAuth(mode) {
    setAuthMode(mode);
    setShowAuth(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (loading) {
    return (
      <div style={styles.center}>
        <LoaderCircle size={30} />
        <p>Loading Soulmates...</p>
      </div>
    );
  }

  if (session && !profileComplete) {
    return (
      <ProfileSetup
        onComplete={() => loadProfile(session.user.id)}
      />
    );
  }

  if (session && profileComplete) {
    return (
      <main style={styles.page}>
        <header style={styles.header}>
          <div style={styles.brand}>
            <Heart fill="currentColor" size={24} />
            SOULMATES<span>.</span>
          </div>

          <button
            onClick={handleLogout}
            style={styles.logout}
          >
            <LogOut size={17} />
            Log out
          </button>
        </header>

        <section style={styles.profileCard}>
          <div style={styles.avatar}>
            <UserRound size={42} />
          </div>

          <p style={styles.eyebrow}>
            YOUR SOULMATES PROFILE
          </p>

          <h1>
            Welcome, {profile?.full_name || 'friend'}! ❤️
          </h1>

          <p style={styles.bio}>
            {profile?.bio || 'Your story starts here.'}
          </p>

          {profile?.city && (
            <p style={styles.detail}>
              📍 {profile.city}
              {profile.country ? `, ${profile.country}` : ''}
            </p>
          )}

          {profile?.gender && (
            <p style={styles.detail}>
              Gender: {profile.gender}
            </p>
          )}

          {profile?.interests?.length > 0 && (
            <div style={styles.interests}>
              {profile.interests.map(interest => (
                <span key={interest} style={styles.interest}>
                  {interest}
                </span>
              ))}
            </div>
          )}

          <p style={styles.notice}>
            Your profile has been saved. Next, we'll build
            discovery and matching features.
          </p>

          {error && <p style={styles.error}>{error}</p>}
        </section>
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
          style={styles.login}
          onClick={() => openAuth('login')}
        >
          Log in
        </button>
      </header>

      <section style={styles.hero}>
        <div style={styles.heartIcon}>
          <Heart fill="currentColor" size={34} />
        </div>

        <p style={styles.eyebrow}>
          WHERE HEARTS FIND EACH OTHER
        </p>

        <h1
          style={{
            fontSize: 'clamp(36px, 7vw, 58px)',
            lineHeight: 1.15,
            letterSpacing: '-1.5px',
            margin: '20px 0'
          }}
        >
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

  login: {
    border: '1px solid #eadfe3',
    borderRadius: '10px',
    padding: '10px 18px',
    background: '#fff',
    color: '#43353b',
    cursor: 'pointer'
  },

  logout: {
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    border: '1px solid #eadfe3',
    borderRadius: '10px',
    padding: '10px 14px',
    background: '#fff',
    color: '#43353b',
    cursor: 'pointer'
  },

  hero: {
    maxWidth: '720px',
    margin: '90px auto 40px',
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
    margin: '70px auto',
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
    marginTop: '20px'
  },

  interest: {
    padding: '8px 12px',
    borderRadius: '20px',
    background: '#ffe8ed',
    color: '#b63e5d',
    fontSize: '13px'
  },

  notice: {
    marginTop: '28px',
    color: '#8a7b82',
    fontSize: '13px',
    lineHeight: 1.7
  },

  error: {
    color: '#b42318',
    textAlign: 'center',
    overflowWrap: 'anywhere'
  }
};
