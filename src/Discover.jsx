import React, { useEffect, useState } from 'react';
import {
  Heart,
  X,
  MapPin,
  Sparkles,
  LoaderCircle,
  RefreshCw,
  LogOut,
  Users
} from 'lucide-react';
import { supabase } from './supabaseClient';

export default function Discover({ onLogout }) {
  const [profiles, setProfiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    loadProfiles();
  }, []);

  async function loadProfiles() {
    setLoading(true);
    setError('');
    setNotice('');

    try {
      const { data, error: discoverError } = await supabase.rpc(
        'get_discover_profiles'
      );

      if (discoverError) throw discoverError;

      setProfiles(data || []);
      setCurrentIndex(0);
    } catch (err) {
      setError(err.message || 'Could not load profiles.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSwipe(action) {
    const profile = profiles[currentIndex];

    if (!profile || busy) return;

    setBusy(true);
    setError('');
    setNotice('');

    try {
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      if (!user) {
        throw new Error('Please log in again.');
      }

      const { error: swipeError } = await supabase
        .from('swipe_actions')
        .upsert(
          {
            user_id: user.id,
            target_user_id: profile.id,
            action
          },
          {
            onConflict: 'user_id,target_user_id'
          }
        );

      if (swipeError) throw swipeError;

      setNotice(
        action === 'like'
          ? `You liked ${profile.full_name}! ❤️`
          : `You passed on ${profile.full_name}.`
      );

      setProfiles(previous =>
        previous.filter(item => item.id !== profile.id)
      );

      setCurrentIndex(0);
    } catch (err) {
      setError(err.message || 'Your action could not be saved.');
    } finally {
      setBusy(false);
    }
  }

  const profile = profiles[currentIndex];

  if (loading) {
    return (
      <main style={styles.center}>
        <LoaderCircle size={36} />
        <h2>Finding your Soulmates...</h2>
        <p>Looking for people to discover.</p>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <div style={styles.brand}>
          <Heart size={25} fill="currentColor" />
          <span>SOULMATES<span style={{ color: '#30232a' }}>.</span></span>
        </div>

        <div style={styles.headerActions}>
          <button style={styles.refresh} onClick={loadProfiles}>
            <RefreshCw size={17} />
            <span>Refresh</span>
          </button>

          {onLogout && (
            <button style={styles.logout} onClick={onLogout}>
              <LogOut size={17} />
            </button>
          )}
        </div>
      </header>

      <section style={styles.content}>
        <p style={styles.eyebrow}>
          <Sparkles size={15} /> YOUR NEXT CONNECTION STARTS HERE
        </p>

        <h1 style={styles.title}>Discover people ❤️</h1>

        <p style={styles.subtitle}>
          Meet someone new. Find something meaningful.
        </p>

        {error && <div style={styles.error}>{error}</div>}
        {notice && <div style={styles.notice}>{notice}</div>}

        {profile ? (
          <article style={styles.card}>
            <div style={styles.photoArea}>
              <div style={styles.avatar}>
                <Users size={65} strokeWidth={1.4} />
              </div>

              <div style={styles.badge}>
                <span style={styles.onlineDot} />
                Ready to connect
              </div>

              <div style={styles.photoText}>
                <h2>
                  {profile.full_name}
                  {profile.age != null ? `, ${profile.age}` : ''}
                </h2>

                {(profile.city || profile.country) && (
                  <p style={styles.location}>
                    <MapPin size={15} />
                    {[profile.city, profile.country]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                )}
              </div>
            </div>

            <div style={styles.cardBody}>
              {profile.gender && (
                <span style={styles.gender}>{profile.gender}</span>
              )}

              <h3 style={styles.sectionTitle}>A little about me</h3>

              <p style={styles.bio}>
                {profile.bio || 'This person is ready to write their story.'}
              </p>

              <h3 style={styles.sectionTitle}>Things I love</h3>

              <div style={styles.interests}>
                {(profile.interests || []).length > 0 ? (
                  profile.interests.map(interest => (
                    <span style={styles.interest} key={interest}>
                      {interest}
                    </span>
                  ))
                ) : (
                  <span style={styles.muted}>Interests not added yet.</span>
                )}
              </div>

              <div style={styles.buttons}>
                <button
                  type="button"
                  aria-label="Pass on profile"
                  disabled={busy}
                  onClick={() => handleSwipe('pass')}
                  style={{ ...styles.pass, opacity: busy ? 0.6 : 1 }}
                >
                  <X size={29} />
                </button>

                <button
                  type="button"
                  disabled={busy}
                  onClick={() => handleSwipe('like')}
                  style={{ ...styles.like, opacity: busy ? 0.6 : 1 }}
                >
                  <Heart size={24} fill="currentColor" />
                  <span>{busy ? 'Saving...' : 'Like'}</span>
                </button>
              </div>

              <p style={styles.helper}>
                Be kind. Every profile belongs to a real person.
              </p>
            </div>
          </article>
        ) : (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>
              <Heart size={38} />
            </div>

            <h2>No more profiles right now</h2>

            <p>
              New people will appear here when eligible members create
              profiles.
            </p>

            <button style={styles.refreshButton} onClick={loadProfiles}>
              <RefreshCw size={17} />
              Find more people
            </button>
          </div>
        )}
      </section>

      <footer style={styles.footer}>
        Made with ❤️ for meaningful connections
      </footer>
    </main>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(145deg, #fff8f8, #fff0f3)',
    color: '#30232a',
    fontFamily: "'DM Sans', sans-serif",
    padding: '20px 15px 30px',
    boxSizing: 'border-box'
  },
  center: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    color: '#df5074',
    fontFamily: "'DM Sans', sans-serif",
    textAlign: 'center',
    padding: '20px',
    boxSizing: 'border-box'
  },
  header: {
    maxWidth: '1100px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px'
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#df5074',
    fontWeight: 800,
    letterSpacing: '1px',
    fontSize: '16px'
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  refresh: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 12px',
    border: '1px solid #eadfe3',
    borderRadius: '10px',
    background: '#fff',
    color: '#65545c',
    cursor: 'pointer'
  },
  logout: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px',
    border: '1px solid #eadfe3',
    borderRadius: '10px',
    background: '#fff',
    color: '#65545c',
    cursor: 'pointer'
  },
  content: {
    maxWidth: '520px',
    margin: '45px auto 0',
    textAlign: 'center'
  },
  eyebrow: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '6px',
    color: '#d94f70',
    fontWeight: 800,
    fontSize: '10px',
    letterSpacing: '1.3px'
  },
  title: {
    fontSize: 'clamp(29px, 7vw, 40px)',
    letterSpacing: '-1px',
    margin: '15px 0 8px'
  },
  subtitle: {
    color: '#85747c',
    fontSize: '14px',
    marginBottom: '25px'
  },
  card: {
    background: '#fff',
    borderRadius: '25px',
    overflow: 'hidden',
    textAlign: 'left',
    boxShadow: '0 20px 65px rgba(120, 40, 65, 0.12)',
    border: '1px solid rgba(234, 223, 227, 0.7)'
  },
  photoArea: {
    minHeight: '285px',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(145deg, #ffe5eb, #fbd0dc)',
    overflow: 'hidden'
  },
  avatar: {
    width: '145px',
    height: '145px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255,255,255,0.7)',
    color: '#df5074'
  },
  badge: {
    position: 'absolute',
    top: '17px',
    left: '16px',
    padding: '9px 12px',
    borderRadius: '22px',
    background: 'rgba(255,255,255,0.9)',
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    fontSize: '11px',
    fontWeight: 700,
    color: '#65545c'
  },
  onlineDot: {
    width: '7px',
    height: '7px',
    background: '#36a66b',
    borderRadius: '50%'
  },
  photoText: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: '45px 20px 18px',
    background: 'linear-gradient(transparent, rgba(67, 30, 45, 0.65))',
    color: '#fff'
  },
  location: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    margin: '5px 0 0',
    fontSize: '13px'
  },
  cardBody: {
    padding: '22px 20px 20px'
  },
  gender: {
    display: 'inline-block',
    padding: '6px 10px',
    background: '#fff0f3',
    color: '#b63e5d',
    borderRadius: '15px',
    fontSize: '11px',
    fontWeight: 700
  },
  sectionTitle: {
    fontSize: '14px',
    margin: '20px 0 8px'
  },
  bio: {
    fontSize: '14px',
    lineHeight: 1.8,
    color: '#766770',
    overflowWrap: 'anywhere'
  },
  interests: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px'
  },
  interest: {
    padding: '8px 11px',
    borderRadius: '18px',
    background: '#fff0f3',
    color: '#b63e5d',
    fontSize: '12px'
  },
  muted: {
    color: '#85747c',
    fontSize: '12px'
  },
  buttons: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '20px',
    marginTop: '28px'
  },
  pass: {
    width: '58px',
    height: '58px',
    borderRadius: '50%',
    border: '2px solid #f1d6df',
    background: '#fff',
    color: '#df5074',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
  },
  like: {
    minWidth: '150px',
    height: '58px',
    border: 'none',
    borderRadius: '30px',
    background: 'linear-gradient(100deg, #ed6a86, #df5074)',
    color: '#fff',
    fontWeight: 800,
    fontSize: '15px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '9px',
    cursor: 'pointer',
    boxShadow: '0 8px 20px rgba(223, 80, 116, 0.25)'
  },
  helper: {
    textAlign: 'center',
    color: '#998992',
    fontSize: '11px',
    lineHeight: 1.6,
    marginTop: '20px'
  },
  empty: {
    padding: '45px 25px',
    background: '#fff',
    borderRadius: '24px',
    boxShadow: '0 15px 50px rgba(120, 40, 65, 0.08)'
  },
  emptyIcon: {
    width: '75px',
    height: '75px',
    borderRadius: '50%',
    background: '#ffe8ed',
    color: '#df5074',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px'
  },
  refreshButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    margin: '22px auto 0',
    padding: '13px 20px',
    border: 'none',
    borderRadius: '12px',
    background: '#df5074',
    color: '#fff',
    fontWeight: 700,
    cursor: 'pointer'
  },
  error: {
    padding: '12px',
    marginBottom: '15px',
    borderRadius: '10px',
    background: '#fff0f0',
    color: '#b42318',
    fontSize: '13px',
    overflowWrap: 'anywhere'
  },
  notice: {
    padding: '12px',
    marginBottom: '15px',
    borderRadius: '10px',
    background: '#eafaf0',
    color: '#18794e',
    fontSize: '13px'
  },
  footer: {
    margin: '35px auto 0',
    textAlign: 'center',
    color: '#998992',
    fontSize: '12px'
  }
};
