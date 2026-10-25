import React, { useEffect, useState } from 'react';
import {
  Heart,
  Compass,
  Users,
  UserRound,
  LogOut,
  LoaderCircle,
  MessageCircle,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';

import Auth from './Auth.jsx';
import ProfileSetup from './ProfileSetup.jsx';
import Discover from './Discover.jsx';
import Matches from './Matches.jsx';
import Chat from './Chat.jsx';
import { supabase } from './supabaseClient.js';

export default function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('signup');
  const [page, setPage] = useState('discover');
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function initialize() {
      try {
        const {
          data: { session: currentSession },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;
        if (!active) return;

        setSession(currentSession);

        if (currentSession) {
          await loadProfile(currentSession.user.id);
        }
      } catch (err) {
        if (active) {
          setError(err.message || 'Unable to load your account.');
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!active) return;

      setSession(newSession);
      setError('');

      if (!newSession) {
        setProfile(null);
        setShowAuth(false);
        setSelectedMatch(null);
        setPage('discover');
        setLoading(false);
        return;
      }

      setShowAuth(false);
      setLoading(true);

      setTimeout(async () => {
        if (!active) return;

        try {
          await loadProfile(newSession.user.id);
        } catch (err) {
          if (active) {
            setError(err.message || 'Unable to load your profile.');
          }
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
    setError('');

    const { error: logoutError } = await supabase.auth.signOut();

    if (logoutError) {
      setError(logoutError.message);
      return;
    }

    setSession(null);
    setProfile(null);
    setSelectedMatch(null);
    setPage('discover');
    setShowAuth(false);
  }

  function openAuth(mode) {
    setAuthMode(mode);
    setShowAuth(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleProfileComplete() {
    try {
      setLoading(true);
      setError('');

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) throw new Error('Please log in again.');

      await loadProfile(user.id);
      setPage('discover');
    } catch (err) {
      setError(err.message || 'Unable to load your profile.');
    } finally {
      setLoading(false);
    }
  }

  function openChat(matchProfile) {
    setSelectedMatch(matchProfile);
    setPage('chat');
  }

  function goBackToMatches() {
    setSelectedMatch(null);
    setPage('matches');
  }

  if (loading) {
    return (
      <main style={styles.center}>
        <Heart size={38} fill="currentColor" />
        <LoaderCircle size={28} className="spin" />
        <h2>Loading Soulmates...</h2>
        <p>Preparing your next connection.</p>
      </main>
    );
  }

  if (showAuth && !session) {
    return (
      <Auth
        initialMode={authMode}
        onSuccess={() => setShowAuth(false)}
        onBack={() => setShowAuth(false)}
      />
    );
  }

  if (session && !profile) {
    return <ProfileSetup onComplete={handleProfileComplete} />;
  }

  if (!session) {
    return (
      <main style={styles.landing}>
        <header style={styles.header}>
          <div style={styles.brand}>
            <Heart size={25} fill="currentColor" />
            <span>SOULMATES<span style={styles.dot}>.</span></span>
          </div>

          <button
            style={styles.loginButton}
            onClick={() => openAuth('login')}
          >
            Log in
          </button>
        </header>

        <section style={styles.hero}>
          <div style={styles.heroIcon}>
            <Heart size={36} fill="currentColor" />
          </div>

          <p style={styles.eyebrow}>
            WHERE HEARTS FIND EACH OTHER
          </p>

          <h1 style={styles.heroTitle}>
            Some connections
            <br />
            just feel like <span style={styles.highlight}>home.</span>
          </h1>

          <p style={styles.description}>
            Meet people who make the little things feel special.
            Your next meaningful connection could be one hello away.
          </p>

          <button
            style={styles.joinButton}
            onClick={() => openAuth('signup')}
          >
            Join Soulmates <Heart size={18} fill="currentColor" />
          </button>

          <p style={styles.note}>
            Free to get started · Adults aged 18 and above
          </p>

          {error && <p style={styles.error}>{error}</p>}
        </section>
      </main>
    );
  }

  return (
    <main style={styles.app}>
      <header style={styles.header}>
        <button
          type="button"
          style={styles.brandButton}
          onClick={() => {
            setSelectedMatch(null);
            setPage('discover');
          }}
        >
          <Heart size={24} fill="currentColor" />
          <span>SOULMATES<span style={styles.dot}>.</span></span>
        </button>

        <button
          type="button"
          style={styles.logoutButton}
          onClick={handleLogout}
        >
          <LogOut size={17} />
          <span>Log out</span>
        </button>
      </header>

      {error && (
        <div style={styles.errorBanner}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div style={styles.content}>
        {page === 'discover' && (
          <Discover
            onLogout={handleLogout}
            onMatch={() => setPage('matches')}
          />
        )}

        {page === 'matches' && (
          <Matches onOpenChat={openChat} />
        )}

        {page === 'chat' && selectedMatch && (
          <Chat
            profile={selectedMatch}
            onBack={goBackToMatches}
          />
        )}

        {page === 'profile' && (
          <section style={styles.profileCard}>
            <div style={styles.avatar}>
              <UserRound size={38} />
            </div>

            <p style={styles.eyebrow}>YOUR PROFILE</p>

            <h1>Welcome, {profile?.full_name || 'friend'}!</h1>

            <p style={styles.bio}>
              {profile?.bio || 'Your story starts here.'}
            </p>

            {(profile?.city || profile?.country) && (
              <p style={styles.detail}>
                📍 {[profile.city, profile.country]
                  .filter(Boolean)
                  .join(', ')}
              </p>
            )}

            {profile?.gender && (
              <p style={styles.detail}>
                Gender: {profile.gender}
              </p>
            )}

            {Array.isArray(profile?.interests) &&
              profile.interests.length > 0 && (
                <div style={styles.interests}>
                  {profile.interests.map((interest, index) => (
                    <span
                      key={`${interest}-${index}`}
                      style={styles.interest}
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              )}
          </section>
        )}
      </div>

      {page !== 'chat' && (
        <nav style={styles.navigation}>
          <button
            type="button"
            style={page === 'discover'
              ? styles.navActive
              : styles.navButton}
            onClick={() => setPage('discover')}
          >
            <Compass size={21} />
            <span>Discover</span>
          </button>

          <button
            type="button"
            style={page === 'matches'
              ? styles.navActive
              : styles.navButton}
            onClick={() => setPage('matches')}
          >
            <Users size={21} />
            <span>Matches</span>
          </button>

          <button
            type="button"
            style={page === 'profile'
              ? styles.navActive
              : styles.navButton}
            onClick={() => setPage('profile')}
          >
            <UserRound size={21} />
            <span>Profile</span>
          </button>
        </nav>
      )}

      {page === 'chat' && (
        <button
          type="button"
          style={styles.backButton}
          onClick={goBackToMatches}
        >
          <ArrowLeft size={18} />
          Back to matches
          <MessageCircle size={18} />
        </button>
      )}
    </main>
  );
}

const styles = {
  landing: {
    minHeight: '100vh',
    padding: '22px',
    boxSizing: 'border-box',
    background: 'linear-gradient(135deg, #fff8f8, #fff0f2)',
    color: '#30232a',
    fontFamily: "'DM Sans', sans-serif",
  },

  app: {
    minHeight: '100vh',
    padding: '20px',
    paddingBottom: '105px',
    boxSizing: 'border-box',
    background: 'linear-gradient(135deg, #fff8f8, #fff0f2)',
    color: '#30232a',
    fontFamily: "'DM Sans', sans-serif",
  },

  header: {
    maxWidth: '1100px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
  },

  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#d94f70',
    fontWeight: 800,
    letterSpacing: '1px',
  },

  brandButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    border: 'none',
    background: 'transparent',
    color: '#d94f70',
    fontWeight: 800,
    letterSpacing: '1px',
    cursor: 'pointer',
    padding: '8px 0',
  },

  dot: {
    color: '#30232a',
  },

  loginButton: {
    padding: '11px 19px',
    border: '1px solid #eadfe3',
    borderRadius: '12px',
    background: '#fff',
    color: '#43353b',
    cursor: 'pointer',
    fontWeight: 700,
  },

  logoutButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    padding: '10px 13px',
    border: '1px solid #eadfe3',
    borderRadius: '11px',
    background: '#fff',
    color: '#43353b',
    cursor: 'pointer',
  },

  hero: {
    maxWidth: '720px',
    margin: '70px auto 30px',
    textAlign: 'center',
    padding: '20px 0',
  },

  heroIcon: {
    width: '75px',
    height: '75px',
    margin: '0 auto 24px',
    borderRadius: '25px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#ffe8ed',
    color: '#e65b79',
  },

  eyebrow: {
    color: '#d94f70',
    fontSize: '11px',
    fontWeight: 800,
    letterSpacing: '1.5px',
  },

  heroTitle: {
    fontSize: 'clamp(35px, 7vw, 65px)',
    lineHeight: 1.13,
    letterSpacing: '-2px',
    margin: '20px 0',
    fontFamily: "'Playfair Display', Georgia, serif",
  },

  highlight: {
    color: '#e65b79',
    fontStyle: 'italic',
  },

  description: {
    maxWidth: '500px',
    margin: '20px auto 28px',
    color: '#7d6e75',
    fontSize: '16px',
    lineHeight: 1.8,
  },

  joinButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '9px',
    border: 'none',
    borderRadius: '13px',
    padding: '16px 28px',
    background: 'linear-gradient(100deg, #ed6a86, #df5074)',
    color: '#fff',
    fontWeight: 700,
    fontSize: '15px',
    cursor: 'pointer',
  },

  note: {
    marginTop: '18px',
    color: '#8a7b82',
    fontSize: '12px',
  },

  center: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#d94f70',
    fontFamily: "'DM Sans', sans-serif",
  },

  content: {
    maxWidth: '1100px',
    margin: '25px auto',
  },

  profileCard: {
    maxWidth: '560px',
    margin: '40px auto',
    padding: '35px 25px',
    background: '#fff',
    borderRadius: '24px',
    textAlign: 'center',
    boxShadow: '0 20px 70px rgba(120, 40, 65, 0.10)',
  },

  avatar: {
    width: '85px',
    height: '85px',
    margin: '0 auto 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    background: '#ffe8ed',
    color: '#e65b79',
  },

  bio: {
    color: '#7d6e75',
    lineHeight: 1.8,
    overflowWrap: 'anywhere',
  },

  detail: {
    color: '#65545c',
    fontSize: '14px',
  },

  interests: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '20px',
  },

  interest: {
    padding: '8px 12px',
    borderRadius: '20px',
    background: '#ffe8ed',
    color: '#b63e5d',
    fontSize: '13px',
  },

  navigation: {
    position: 'fixed',
    bottom: '0',
    left: '0',
    right: '0',
    zIndex: 20,
    display: 'flex',
    justifyContent: 'center',
    gap: 'clamp(15px, 6vw, 65px)',
    padding: '12px 10px calc(12px + env(safe-area-inset-bottom))',
    background: 'rgba(255,255,255,0.96)',
    borderTop: '1px solid #f1e3e7',
    boxShadow: '0 -8px 25px rgba(80,30,50,0.05)',
  },

  navButton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '5px',
    border: 'none',
    background: 'transparent',
    color: '#8a7b82',
    fontSize: '11px',
    cursor: 'pointer',
    minWidth: '65px',
  },

  navActive: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '5px',
    border: 'none',
    background: 'transparent',
    color: '#d94f70',
    fontSize: '11px',
    fontWeight: 800,
    cursor: 'pointer',
    minWidth: '65px',
  },

  backButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    margin: '20px auto',
    padding: '11px 16px',
    border: '1px solid #eadfe3',
    borderRadius: '12px',
    background: '#fff',
    color: '#d94f70',
    cursor: 'pointer',
  },

  error: {
    color: '#b42318',
    textAlign: 'center',
    overflowWrap: 'anywhere',
  },

  errorBanner: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '9px',
    maxWidth: '900px',
    margin: '18px auto',
    padding: '12px 15px',
    borderRadius: '12px',
    background: '#fff0f0',
    color: '#b42318',
    overflowWrap: 'anywhere',
  },
};
