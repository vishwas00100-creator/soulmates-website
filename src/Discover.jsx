import React, { useEffect, useState } from 'react';
import {
  Heart,
  X,
  MapPin,
  Sparkles,
  LoaderCircle,
  RefreshCw,
  HeartHandshake,
  MessageCircle,
  ArrowRight,
} from 'lucide-react';

import { supabase } from './supabaseClient';

export default function Discover() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [swiping, setSwiping] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [showMatch, setShowMatch] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState(null);

  const currentProfile = profiles[0] || null;

  async function loadProfiles() {
    setLoading(true);
    setError('');
    setNotice('');

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!user) {
        setProfiles([]);
        setError('Please log in to discover people.');
        return;
      }

      const { data, error: profileError } = await supabase.rpc(
        'get_discover_profiles'
      );

      if (profileError) throw profileError;

      setProfiles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Profile loading error:', err);
      setError(err.message || 'Could not load profiles.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfiles();
  }, []);

  async function handleSwipe(action) {
    if (!currentProfile || swiping) return;

    setSwiping(true);
    setError('');
    setNotice('');

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;
      if (!user) throw new Error('Please log in first.');

      const { data, error: swipeError } = await supabase.rpc(
        'record_swipe',
        {
          p_target_user_id: currentProfile.id,
          p_action: action,
        }
      );

      if (swipeError) throw swipeError;

      if (!data || data.success !== true) {
        throw new Error('Could not save your swipe. Please try again.');
      }

      const swipedProfile = currentProfile;

      setProfiles((previous) =>
        previous.filter((profile) => profile.id !== swipedProfile.id)
      );

      if (action === 'like' && data.matched === true) {
        setMatchedProfile(swipedProfile);
        setShowMatch(true);
      } else if (action === 'like') {
        setNotice(`You liked ${swipedProfile.full_name || 'this person'}! 💗`);
      } else {
        setNotice('Profile passed.');
      }
    } catch (err) {
      console.error('Swipe error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSwiping(false);
    }
  }

  function closeMatchPopup() {
    setShowMatch(false);
    setMatchedProfile(null);
  }

  if (loading) {
    return (
      <div style={styles.center}>
        <LoaderCircle size={38} style={styles.spinner} />
        <h2 style={styles.loadingTitle}>Finding your people...</h2>
        <p style={styles.muted}>
          Your next connection might be just around the corner.
        </p>
      </div>
    );
  }

  if (!currentProfile) {
    return (
      <div style={styles.center}>
        <div style={styles.emptyIcon}>
          <Heart size={38} />
        </div>

        <h2 style={styles.emptyTitle}>That's everyone for now!</h2>

        <p style={styles.muted}>
          There are no more profiles in your discovery list right now.
        </p>

        {error && <p style={styles.errorText}>{error}</p>}

        <button
          type="button"
          style={styles.refreshButton}
          onClick={loadProfiles}
        >
          <RefreshCw size={17} />
          Refresh profiles
        </button>

        {showMatch && (
          <MatchPopup
            profile={matchedProfile}
            onClose={closeMatchPopup}
          />
        )}
      </div>
    );
  }

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <div>
          <div style={styles.eyebrow}>
            <Sparkles size={15} />
            YOUR NEXT CHAPTER
          </div>

          <h1 style={styles.heading}>
            Discover <span style={styles.pink}>people.</span>
          </h1>

          <p style={styles.subtitle}>
            Real connections begin with a hello.
          </p>
        </div>

        <button
          type="button"
          style={styles.refreshIcon}
          onClick={loadProfiles}
          aria-label="Refresh profiles"
          disabled={swiping}
        >
          <RefreshCw size={19} />
        </button>
      </header>

      {notice && <div style={styles.notice}>{notice}</div>}
      {error && <div style={styles.errorBox}>{error}</div>}

      <section style={styles.card}>
        <div style={styles.cardTop}>
          <div style={styles.avatar}>
            {currentProfile.full_name?.trim()?.charAt(0)?.toUpperCase() || '?'}
          </div>

          <div style={styles.badge}>
            <span style={styles.onlineDot} />
            Soulmates member
          </div>
        </div>

        <div style={styles.cardContent}>
          <h2 style={styles.name}>
            {currentProfile.full_name || 'Soulmates member'}
            {currentProfile.age != null && (
              <span style={styles.age}>, {currentProfile.age}</span>
            )}
          </h2>

          {(currentProfile.city || currentProfile.country) && (
            <div style={styles.location}>
              <MapPin size={16} />
              <span>
                {[currentProfile.city, currentProfile.country]
                  .filter(Boolean)
                  .join(', ')}
              </span>
            </div>
          )}

          {currentProfile.gender && (
            <div style={styles.gender}>{currentProfile.gender}</div>
          )}

          <div style={styles.divider} />

          <h3 style={styles.sectionTitle}>About me</h3>

          <p style={styles.bio}>
            {currentProfile.bio ||
              'I am here to meet someone special and build a meaningful connection.'}
          </p>

          {Array.isArray(currentProfile.interests) &&
            currentProfile.interests.length > 0 && (
              <>
                <h3 style={styles.sectionTitle}>Things I love</h3>

                <div style={styles.interests}>
                  {currentProfile.interests.map((interest, index) => (
                    <span
                      key={`${interest}-${index}`}
                      style={styles.interest}
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </>
            )}
        </div>

        <div style={styles.actions}>
          <button
            type="button"
            aria-label="Pass on profile"
            style={styles.passButton}
            disabled={swiping}
            onClick={() => handleSwipe('pass')}
          >
            {swiping ? <LoaderCircle size={23} /> : <X size={26} />}
          </button>

          <button
            type="button"
            aria-label="Like profile"
            style={styles.likeButton}
            disabled={swiping}
            onClick={() => handleSwipe('like')}
          >
            {swiping ? (
              <LoaderCircle size={23} />
            ) : (
              <Heart size={25} fill="white" />
            )}
          </button>
        </div>

        <div style={styles.actionLabels}>
          <span>PASS</span>
          <span>LIKE</span>
        </div>
      </section>

      <p style={styles.footerText}>
        <Heart size={14} />
        Be kind. Be genuine. Be yourself.
      </p>

      {showMatch && (
        <MatchPopup
          profile={matchedProfile}
          onClose={closeMatchPopup}
        />
      )}
    </main>
  );
}

function MatchPopup({ profile, onClose }) {
  return (
    <div style={styles.overlay}>
      <section
        style={styles.matchModal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="match-title"
      >
        <div style={styles.matchIcon}>
          <HeartHandshake size={42} />
        </div>

        <p style={styles.matchEyebrow}>IT'S A MUTUAL LIKE</p>

        <h2 id="match-title" style={styles.matchTitle}>
          It's a Match!
        </h2>

        <p style={styles.matchDescription}>
          You and <strong>{profile?.full_name || 'this person'}</strong> liked
          each other. Something beautiful could start here.
        </p>

        <button
          type="button"
          style={styles.matchButton}
          onClick={onClose}
        >
          <MessageCircle size={18} />
          Keep discovering
          <ArrowRight size={18} />
        </button>

        <button
          type="button"
          style={styles.closeButton}
          onClick={onClose}
        >
          Maybe later
        </button>
      </section>
    </div>
  );
}

const styles = {
  page: {
    width: '100%',
    maxWidth: '520px',
    margin: '0 auto',
    padding: '24px 18px 30px',
    boxSizing: 'border-box',
    fontFamily: "'DM Sans', sans-serif",
    color: '#251925',
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    marginBottom: '24px',
  },

  eyebrow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#D84E83',
    fontSize: '11px',
    fontWeight: 800,
    letterSpacing: '1.5px',
    marginBottom: '9px',
  },

  heading: {
    margin: 0,
    fontSize: 'clamp(27px, 6vw, 36px)',
    fontWeight: 800,
    letterSpacing: '-1.3px',
  },

  pink: { color: '#D84E83' },

  subtitle: {
    margin: '9px 0 0',
    fontSize: '13px',
    color: '#817581',
    lineHeight: 1.6,
  },

  refreshIcon: {
    flexShrink: 0,
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    border: '1px solid #F0DDE6',
    background: '#FFFFFF',
    color: '#C93778',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },

  notice: {
    padding: '12px 14px',
    marginBottom: '14px',
    borderRadius: '12px',
    background: '#FFF0F5',
    color: '#A72F62',
    fontSize: '13px',
    fontWeight: 600,
  },

  errorBox: {
    padding: '12px 14px',
    marginBottom: '14px',
    borderRadius: '12px',
    background: '#FFF0F0',
    color: '#B42318',
    fontSize: '13px',
    overflowWrap: 'anywhere',
  },

  card: {
    overflow: 'hidden',
    borderRadius: '25px',
    background: '#FFFFFF',
    border: '1px solid #F2E7ED',
    boxShadow: '0 14px 45px rgba(80, 35, 60, 0.09)',
  },

  cardTop: {
    minHeight: '150px',
    padding: '25px 20px',
    background: 'linear-gradient(135deg, #FCE7F0, #F7D6E6, #FBEAF2)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '13px',
  },

  avatar: {
    width: '88px',
    height: '88px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #D84E83, #A63B77)',
    border: '4px solid rgba(255,255,255,0.85)',
    boxShadow: '0 7px 20px rgba(180,60,115,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#FFFFFF',
    fontSize: '35px',
    fontWeight: 800,
  },

  badge: {
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    padding: '7px 11px',
    borderRadius: '20px',
    background: 'rgba(255,255,255,0.8)',
    color: '#76556A',
    fontSize: '11px',
    fontWeight: 700,
  },

  onlineDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    background: '#35B779',
  },

  cardContent: { padding: '24px 22px 18px' },

  name: {
    margin: 0,
    fontSize: '27px',
    fontWeight: 800,
    letterSpacing: '-0.7px',
    overflowWrap: 'anywhere',
  },

  age: { fontWeight: 600, color: '#695A68' },

  location: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '9px',
    color: '#817581',
    fontSize: '13px',
  },

  gender: {
    display: 'inline-block',
    marginTop: '12px',
    padding: '6px 10px',
    borderRadius: '20px',
    background: '#F8F1F5',
    color: '#76556A',
    fontSize: '11px',
    fontWeight: 700,
  },

  divider: {
    height: '1px',
    background: '#F1E8ED',
    margin: '20px 0',
  },

  sectionTitle: {
    margin: '0 0 9px',
    fontSize: '13px',
    fontWeight: 800,
    color: '#382638',
  },

  bio: {
    margin: '0 0 19px',
    color: '#766A76',
    fontSize: '13px',
    lineHeight: 1.8,
    overflowWrap: 'anywhere',
  },

  interests: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },

  interest: {
    padding: '8px 11px',
    borderRadius: '20px',
    background: '#FFF0F5',
    color: '#B43D72',
    fontSize: '11px',
    fontWeight: 700,
    overflowWrap: 'anywhere',
  },

  actions: {
    padding: '20px 22px 8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '28px',
  },

  passButton: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    border: '1px solid #F0DDE6',
    background: '#FFFFFF',
    color: '#8B7182',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },

  likeButton: {
    width: '66px',
    height: '66px',
    borderRadius: '50%',
    border: 'none',
    background: 'linear-gradient(135deg, #EA6195, #C93778)',
    color: '#FFFFFF',
    boxShadow: '0 8px 22px rgba(210,55,120,0.28)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },

  actionLabels: {
    display: 'flex',
    justifyContent: 'center',
    gap: '92px',
    paddingBottom: '22px',
    color: '#A18C9B',
    fontSize: '9px',
    fontWeight: 800,
    letterSpacing: '1px',
  },

  footerText: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '7px',
    margin: '20px 0 0',
    color: '#A18C9B',
    fontSize: '11px',
  },

  center: {
    minHeight: '65vh',
    padding: '30px 22px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    fontFamily: "'DM Sans', sans-serif",
    color: '#382638',
  },

  spinner: {
    color: '#D84E83',
    animation: 'spin 1s linear infinite',
  },

  loadingTitle: {
    margin: '18px 0 8px',
    fontSize: '23px',
    fontWeight: 800,
  },

  muted: {
    maxWidth: '320px',
    color: '#817581',
    fontSize: '13px',
    lineHeight: 1.8,
  },

  emptyIcon: {
    width: '78px',
    height: '78px',
    borderRadius: '50%',
    background: '#FFF0F5',
    color: '#D84E83',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '18px',
  },

  emptyTitle: {
    margin: '0 0 10px',
    fontSize: '24px',
    fontWeight: 800,
  },

  errorText: {
    color: '#B42318',
    fontSize: '13px',
    overflowWrap: 'anywhere',
  },

  refreshButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '9px',
    marginTop: '15px',
    padding: '13px 18px',
    border: 'none',
    borderRadius: '13px',
    background: '#D84E83',
    color: '#FFFFFF',
    fontWeight: 700,
    cursor: 'pointer',
  },

  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 9999,
    padding: '20px',
    boxSizing: 'border-box',
    background: 'rgba(38,19,34,0.58)',
    backdropFilter: 'blur(5px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  matchModal: {
    width: '100%',
    maxWidth: '390px',
    padding: '32px 24px',
    boxSizing: 'border-box',
    borderRadius: '28px',
    background: '#FFFFFF',
    textAlign: 'center',
    boxShadow: '0 20px 70px rgba(0,0,0,0.2)',
  },

  matchIcon: {
    width: '82px',
    height: '82px',
    borderRadius: '50%',
    margin: '0 auto 20px',
    background: 'linear-gradient(135deg, #FCE7F0, #F9C9DE)',
    color: '#C93778',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  matchEyebrow: {
    color: '#C93778',
    fontSize: '10px',
    fontWeight: 800,
    letterSpacing: '1.8px',
  },

  matchTitle: {
    margin: '12px 0',
    fontSize: '35px',
    fontWeight: 800,
    letterSpacing: '-1px',
    color: '#382638',
  },

  matchDescription: {
    margin: '0 0 24px',
    color: '#817581',
    fontSize: '14px',
    lineHeight: 1.8,
  },

  matchButton: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '9px',
    padding: '15px 12px',
    border: 'none',
    borderRadius: '14px',
    background: 'linear-gradient(135deg, #EA6195, #C93778)',
    color: '#FFFFFF',
    fontSize: '13px',
    fontWeight: 800,
    cursor: 'pointer',
  },

  closeButton: {
    marginTop: '16px',
    padding: '8px 12px',
    border: 'none',
    background: 'transparent',
    color: '#8B7182',
    fontSize: '12px',
    cursor: 'pointer',
  },
};
