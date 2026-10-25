import React, { useEffect, useState } from 'react';
import {
  Heart,
  MessageCircle,
  MapPin,
  RefreshCw,
  LoaderCircle,
  Users,
  AlertCircle,
} from 'lucide-react';
import { supabase } from './supabaseClient.js';

export default function Matches({ onOpenChat }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadMatches() {
    setLoading(true);
    setError('');

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      if (!user) {
        setMatches([]);
        setError('Please log in to see your matches.');
        return;
      }

      const { data: matchRows, error: matchError } = await supabase
        .from('matches')
        .select('id, user1_id, user2_id, created_at')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (matchError) throw matchError;

      if (!matchRows || matchRows.length === 0) {
        setMatches([]);
        return;
      }

      const otherUserIds = matchRows.map((match) =>
        match.user1_id === user.id
          ? match.user2_id
          : match.user1_id
      );

      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select(
          'id, full_name, gender, bio, interests, country, city'
        )
        .in('id', otherUserIds);

      if (profileError) throw profileError;

      const profileMap = new Map(
        (profiles || []).map((profile) => [profile.id, profile])
      );

      const formattedMatches = matchRows
        .map((match) => {
          const otherUserId =
            match.user1_id === user.id
              ? match.user2_id
              : match.user1_id;

          const profile = profileMap.get(otherUserId);

          if (!profile) return null;

          return {
            ...profile,
            matchId: match.id,
            matchedAt: match.created_at,
          };
        })
        .filter(Boolean);

      setMatches(formattedMatches);
    } catch (err) {
      console.error('Loading matches failed:', err);
      setError(
        err.message ||
          'Could not load matches. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMatches();
  }, []);

  if (loading) {
    return (
      <section className="matches-page">
        <div className="matches-status">
          <LoaderCircle className="spin" size={32} />
          <p>Finding your matches...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="matches-page">
      <div className="matches-heading">
        <div>
          <span className="section-eyebrow">
            YOUR CONNECTIONS
          </span>

          <h1>
            Your <span>matches</span>
          </h1>

          <p>
            Every meaningful connection starts somewhere.
          </p>
        </div>

        <button
          type="button"
          className="matches-refresh"
          onClick={loadMatches}
          disabled={loading}
          aria-label="Refresh matches"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {error && (
        <div className="matches-error">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {!error && matches.length === 0 && (
        <div className="matches-empty">
          <div className="matches-empty-icon">
            <Heart size={34} />
          </div>

          <h2>Your story starts here</h2>

          <p>
            You haven't matched with anyone yet. Keep
            discovering profiles and like people who interest
            you. When the interest is mutual, your match will
            appear here.
          </p>

          <div className="matches-empty-decoration">
            <Heart size={18} />
            <Heart size={24} />
            <Heart size={18} />
          </div>
        </div>
      )}

      {matches.length > 0 && (
        <>
          <div className="matches-count">
            <Users size={18} />
            <span>
              {matches.length}{' '}
              {matches.length === 1 ? 'connection' : 'connections'}
            </span>
          </div>

          <div className="matches-grid">
            {matches.map((profile) => {
              const name = profile.full_name || 'Soulmate';
              const initials = name
                .split(' ')
                .filter(Boolean)
                .slice(0, 2)
                .map((part) => part[0].toUpperCase())
                .join('');

              return (
                <article
                  className="match-card"
                  key={profile.matchId}
                >
                  <div className="match-avatar">
                    <span>{initials || 'S'}</span>

                    <div className="match-heart-badge">
                      <Heart size={15} fill="currentColor" />
                    </div>
                  </div>

                  <div className="match-card-content">
                    <h2>{name}</h2>

                    {(profile.city || profile.country) && (
                      <p className="match-location">
                        <MapPin size={15} />

                        {[profile.city, profile.country]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                    )}

                    {profile.bio && (
                      <p className="match-bio">
                        {profile.bio}
                      </p>
                    )}

                    {profile.interests && (
                      <div className="match-interests">
                        {(Array.isArray(profile.interests)
                          ? profile.interests
                          : String(profile.interests)
                              .split(',')
                        )
                          .map((interest) =>
                            String(interest).trim()
                          )
                          .filter(Boolean)
                          .slice(0, 4)
                          .map((interest, index) => (
                            <span key={`${interest}-${index}`}>
                              {interest}
                            </span>
                          ))}
                      </div>
                    )}

                    <button
                      type="button"
                      className="match-message-button"
                      onClick={() =>
                        onOpenChat?.(profile)
                      }
                    >
                      <MessageCircle size={18} />
                      Send a message
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
