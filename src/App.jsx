import React, { useState } from 'react';
import Auth from './Auth.jsx';
import {
  Heart,
  Menu,
  ArrowRight,
  ShieldCheck,
  Globe2,
  MessageCircle,
  Sparkles,
  Check
} from 'lucide-react';

export default function App() {
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('signup');

  if (showAuth) {
    return (
      <Auth
        initialMode={authMode}
        onClose={() => setShowAuth(false)}
      />
    );
  }

  return (
    <div className="app">
      <header className="navbar">
        <a className="brand" href="#home">
          <span className="brand-icon">
            <Heart size={23} fill="currentColor" />
          </span>
          <span>SOULMATES<span className="brand-dot">.</span></span>
        </a>

        <nav className="desktop-nav">
          <a href="#how-it-works">How it works</a>
          <a href="#discover">Discover</a>
          <a href="#safety">Your safety</a>
        </nav>

        <div className="nav-actions">
          <button className="login-button">Log in</button>
          <button className="primary-button nav-cta">
            Join for free <ArrowRight size={16} />
          </button>
        </div>

        <button className="mobile-menu" aria-label="Menu">
          <Menu size={25} />
        </button>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-copy">
            <div className="eyebrow">
              <Sparkles size={15} />
              YOUR NEXT CHAPTER STARTS HERE
            </div>

            <h1>
              Some connections
              <br />
              just feel like <span>home.</span>
            </h1>

            <p className="hero-description">
              Meet people who make the little things feel special.
              Your next meaningful connection could be one hello away.
            </p>

            <div className="hero-actions">
              <button className="primary-button hero-cta">
                Find your person <ArrowRight size={18} />
              </button>
              <span className="free-note">
                <Check size={15} /> Free to get started
              </span>
            </div>

            <div className="social-proof">
              <div className="avatar-stack">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces"
                  alt=""
                />
                <img
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces"
                  alt=""
                />
                <img
                  src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&h=100&fit=crop&crop=faces"
                  alt=""
                />
              </div>
              <div>
                <div className="proof-stars">★★★★★</div>
                <p>A little more connection, a little less swiping.</p>
              </div>
            </div>
          </div>

          <div className="hero-visual" id="discover">
            <div className="photo-orbit orbit-one"></div>
            <div className="photo-orbit orbit-two"></div>

            <div className="main-photo-card">
              <img
                className="main-photo"
                src="https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=900&h=1100&fit=crop"
                alt="Friends enjoying a happy moment together"
              />

              <div className="photo-overlay"></div>

              <div className="photo-label">
                <span className="online-dot"></span>
                MADE FOR REAL CONNECTIONS
              </div>

              <div className="photo-caption">
                <span className="caption-kicker">YOUR STORY, YOUR WAY</span>
                <h2>It starts with a hello.</h2>
                <p>Be curious. Be yourself. See what happens.</p>
              </div>
            </div>

            <div className="floating-card match-card">
              <div className="floating-icon heart-floating">
                <Heart fill="currentColor" size={21} />
              </div>
              <div>
                <strong>A little spark ✨</strong>
                <span>Could become something lovely.</span>
              </div>
            </div>

            <div className="floating-card globe-card">
              <div className="floating-icon globe-floating">
                <Globe2 size={20} />
              </div>
              <div>
                <strong>One world</strong>
                <span>Endless possibilities</span>
              </div>
            </div>

            <div className="decorative-heart heart-one">♡</div>
            <div className="decorative-heart heart-two">✳</div>
          </div>
        </section>

        <section className="trust-strip">
          <div><ShieldCheck size={19} /> Safety matters</div>
          <span className="strip-divider"></span>
          <div><Heart size={18} /> Meaningful connections</div>
          <span className="strip-divider"></span>
          <div><Globe2 size={19} /> A world of possibilities</div>
        </section>

        <section className="how-section" id="how-it-works">
          <div className="section-heading">
            <span className="eyebrow">SIMPLE BY DESIGN</span>
            <h2>Good things can start <span>simply.</span></h2>
            <p>No complicated rules. Just a little curiosity and an open mind.</p>
          </div>

          <div className="steps-grid">
            <article className="step-card">
              <div className="step-number">01</div>
              <div className="step-icon pink-step"><Heart size={25} /></div>
              <h3>Show up as you</h3>
              <p>Create a profile that reflects who you really are, from your interests to your little quirks.</p>
            </article>

            <article className="step-card">
              <div className="step-number">02</div>
              <div className="step-icon peach-step"><Sparkles size={25} /></div>
              <h3>Discover your people</h3>
              <p>Explore profiles and find people whose interests and outlook feel right for you.</p>
            </article>

            <article className="step-card">
              <div className="step-number">03</div>
              <div className="step-icon lavender-step"><MessageCircle size={25} /></div>
              <h3>Start a conversation</h3>
              <p>When the interest is mutual, say hello and see where your conversation takes you.</p>
            </article>
          </div>
        </section>

        <section className="safety-section" id="safety">
          <div className="safety-icon"><ShieldCheck size={29} /></div>
          <div>
            <span className="eyebrow">CONNECTION WITH CARE</span>
            <h2>Your comfort matters. Always.</h2>
            <p>
              Dating should feel exciting, not uncomfortable.
              We're building privacy controls, blocking, reporting,
              and account management into the Soulmates experience.
            </p>
          </div>
          <div className="safety-badge">
            <ShieldCheck size={17} /> Safety-first design
          </div>
        </section>

        <section className="final-cta">
          <div className="cta-heart"><Heart fill="currentColor" size={26} /></div>
          <span className="eyebrow">YOUR STORY IS YOURS TO WRITE</span>
          <h2>Ready for a little <span>more magic?</span></h2>
          <p>Take the first step. Your next connection starts with you.</p>
          <button className="primary-button final-button">
            Let's get started <ArrowRight size={18} />
          </button>
          <span className="adult-note">For adults aged 18 and above.</span>
        </section>
      </main>

      <footer className="footer">
        <a className="brand footer-brand" href="#home">
          <span className="brand-icon"><Heart size={19} fill="currentColor" /></span>
          <span>SOULMATES<span className="brand-dot">.</span></span>
        </a>
        <p>Where hearts find each other.</p>
        <div className="footer-links">
          <a href="#how-it-works">How it works</a>
          <a href="#safety">Safety</a>
          <a href="mailto:hello@soulmates.example">Contact</a>
        </div>
        <span className="copyright">© {new Date().getFullYear()} Soulmates. Made for connection.</span>
      </footer>
    </div>
  );
            }
