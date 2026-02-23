import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import blogPosts from '../data/blogPosts';

const CATEGORIES = ['All', ...new Set(blogPosts.map(p => p.category))];

export default function Blog() {
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = useMemo(
    () => activeCategory === 'All' ? blogPosts : blogPosts.filter(p => p.category === activeCategory),
    [activeCategory]
  );

  return (
    <>
      <SEO
        title="VPN XO Blog — Privacy Guides, VPN Comparisons & Security Tips"
        description="Expert guides on VPN technology, online privacy, protocol comparisons, and cybersecurity tips. Stay informed and stay secure with VPN XO."
        path="/blog"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Blog',
          name: 'VPN XO Blog',
          description: 'Expert guides on VPN technology, online privacy, protocol comparisons, and cybersecurity tips.',
          url: 'https://vpn-xo.com/blog',
          publisher: {
            '@type': 'Organization',
            name: 'VPN XO',
            url: 'https://vpn-xo.com'
          }
        }}
      />

      <div style={styles.page}>
        {/* Hero */}
        <header style={styles.hero}>
          <Link to="/" style={styles.logoLink}>
            <span style={styles.logo}>VPN&nbsp;<span style={styles.logoAccent}>XO</span></span>
          </Link>
          <h1 style={styles.heroTitle}>VPN XO Blog</h1>
          <p style={styles.heroSub}>Privacy guides, protocol deep-dives, and practical security tips from the VPN XO team.</p>
        </header>

        {/* Category filter */}
        <nav style={styles.catBar} aria-label="Filter articles by category">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                ...styles.catBtn,
                ...(activeCategory === cat ? styles.catBtnActive : {})
              }}
              aria-current={activeCategory === cat ? 'page' : undefined}
            >
              {cat}
            </button>
          ))}
        </nav>

        {/* Post grid */}
        <main style={styles.grid}>
          {filtered.map(post => (
            <article key={post.slug} style={styles.card}>
              <div style={styles.cardCategory}>{post.category}</div>
              <h2 style={styles.cardTitle}>
                <Link to={`/blog/${post.slug}`} style={styles.cardLink}>{post.title}</Link>
              </h2>
              <p style={styles.cardExcerpt}>{post.excerpt}</p>
              <div style={styles.cardMeta}>
                <span>{post.publishedDate}</span>
                <span style={styles.dot}>·</span>
                <span>{post.readTime}</span>
              </div>
              <div style={styles.tags}>
                {post.tags.slice(0, 3).map(t => (
                  <span key={t} style={styles.tag}>{t}</span>
                ))}
              </div>
            </article>
          ))}
        </main>

        {/* CTA */}
        <section style={styles.cta}>
          <h2 style={styles.ctaTitle}>Ready to Protect Your Privacy?</h2>
          <p style={styles.ctaSub}>Join thousands of users who trust VPN XO for fast, secure, and private internet access.</p>
          <Link to="/register" style={styles.ctaBtn}>Get Started Free</Link>
        </section>

        {/* Footer */}
        <footer style={styles.footer}>
          <p>© {new Date().getFullYear()} VPN XO. All rights reserved.</p>
          <div style={styles.footerLinks}>
            <Link to="/" style={styles.footerLink}>Home</Link>
            <Link to="/privacy-policy" style={styles.footerLink}>Privacy Policy</Link>
            <Link to="/terms-of-service" style={styles.footerLink}>Terms of Service</Link>
            <Link to="/contact" style={styles.footerLink}>Contact</Link>
          </div>
        </footer>
      </div>
    </>
  );
}

/* ---------- Styles ---------- */
const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #0a0e17 0%, #101828 100%)',
    color: '#e0e0e0',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  },
  hero: {
    textAlign: 'center',
    padding: '60px 20px 40px',
    borderBottom: '1px solid rgba(255,255,255,0.06)'
  },
  logoLink: { textDecoration: 'none' },
  logo: { fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: 1 },
  logoAccent: { color: '#00d4ff' },
  heroTitle: {
    fontSize: 'clamp(28px, 5vw, 44px)',
    fontWeight: 800,
    color: '#fff',
    margin: '24px 0 12px'
  },
  heroSub: {
    fontSize: 18,
    color: '#94a3b8',
    maxWidth: 600,
    margin: '0 auto'
  },
  catBar: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 10,
    padding: '28px 20px 12px'
  },
  catBtn: {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#94a3b8',
    padding: '8px 20px',
    borderRadius: 20,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 500,
    transition: 'all .2s'
  },
  catBtnActive: {
    background: 'linear-gradient(135deg, #00d4ff, #0088ff)',
    color: '#fff',
    border: '1px solid transparent'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: 28,
    maxWidth: 1100,
    margin: '0 auto',
    padding: '32px 20px 48px'
  },
  card: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: '28px 24px',
    transition: 'transform .2s, box-shadow .2s',
    display: 'flex',
    flexDirection: 'column'
  },
  cardCategory: {
    fontSize: 12,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: '#00d4ff',
    marginBottom: 12
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 700,
    lineHeight: 1.35,
    margin: '0 0 12px',
    color: '#fff'
  },
  cardLink: {
    color: 'inherit',
    textDecoration: 'none'
  },
  cardExcerpt: {
    fontSize: 15,
    lineHeight: 1.6,
    color: '#94a3b8',
    flex: 1,
    marginBottom: 16
  },
  cardMeta: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 12
  },
  dot: { margin: '0 6px' },
  tags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6
  },
  tag: {
    background: 'rgba(0,212,255,0.1)',
    color: '#00d4ff',
    fontSize: 12,
    padding: '4px 10px',
    borderRadius: 12,
    fontWeight: 500
  },
  cta: {
    textAlign: 'center',
    padding: '64px 20px',
    background: 'linear-gradient(135deg, rgba(0,212,255,0.08), rgba(0,136,255,0.08))',
    borderTop: '1px solid rgba(0,212,255,0.15)',
    borderBottom: '1px solid rgba(0,212,255,0.15)'
  },
  ctaTitle: {
    fontSize: 28,
    fontWeight: 800,
    color: '#fff',
    marginBottom: 12
  },
  ctaSub: {
    fontSize: 16,
    color: '#94a3b8',
    maxWidth: 520,
    margin: '0 auto 24px'
  },
  ctaBtn: {
    display: 'inline-block',
    background: 'linear-gradient(135deg, #00d4ff, #0088ff)',
    color: '#fff',
    fontWeight: 700,
    fontSize: 16,
    padding: '14px 36px',
    borderRadius: 12,
    textDecoration: 'none',
    transition: 'transform .2s'
  },
  footer: {
    textAlign: 'center',
    padding: '40px 20px',
    fontSize: 14,
    color: '#64748b'
  },
  footerLinks: {
    display: 'flex',
    justifyContent: 'center',
    gap: 20,
    marginTop: 12,
    flexWrap: 'wrap'
  },
  footerLink: {
    color: '#94a3b8',
    textDecoration: 'none',
    fontSize: 13
  }
};
