import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import SEO from '../components/SEO';
import blogPosts from '../data/blogPosts';

export default function BlogPost() {
  const { slug } = useParams();
  const post = blogPosts.find(p => p.slug === slug);

  if (!post) return <Navigate to="/blog" replace />;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    author: { '@type': 'Person', name: post.author },
    publisher: {
      '@type': 'Organization',
      name: 'VPN XO',
      url: 'https://vpn-xo.com'
    },
    datePublished: post.publishedDate,
    dateModified: post.updatedDate,
    mainEntityOfPage: `https://vpn-xo.com/blog/${post.slug}`,
    keywords: post.tags.join(', ')
  };

  // Build FAQ JSON-LD if the post has FAQs
  const faqLd = post.faq?.length ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: post.faq.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a }
    }))
  } : null;

  return (
    <>
      <SEO
        title={post.title}
        description={post.excerpt}
        path={`/blog/${post.slug}`}
        type="article"
        article={{
          publishedTime: post.publishedDate,
          modifiedTime: post.updatedDate,
          author: post.author,
          tags: post.tags
        }}
        jsonLd={jsonLd}
      />
      {/* Inject FAQ structured data — escape </script> to prevent tag break-out */}
      {faqLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd).replace(/<\/script>/gi, '<\\/script>') }}
        />
      )}

      <div style={styles.page}>
        {/* Top bar */}
        <nav style={styles.topBar}>
          <Link to="/" style={styles.logoLink}>
            <span style={styles.logo}>VPN&nbsp;<span style={styles.logoAccent}>XO</span></span>
          </Link>
          <Link to="/blog" style={styles.backLink}>← All Articles</Link>
        </nav>

        <article style={styles.article} itemScope itemType="https://schema.org/BlogPosting">
          {/* Header */}
          <header style={styles.header}>
            <div style={styles.categoryBadge}>{post.category}</div>
            <h1 style={styles.title} itemProp="headline">{post.title}</h1>
            <p style={styles.excerpt}>{post.excerpt}</p>
            <div style={styles.meta}>
              <span itemProp="author">{post.author}</span>
              <span style={styles.dot}>·</span>
              <time dateTime={post.publishedDate} itemProp="datePublished">{post.publishedDate}</time>
              <span style={styles.dot}>·</span>
              <span>{post.readTime}</span>
            </div>
            <div style={styles.tags}>
              {post.tags.map(t => <span key={t} style={styles.tag}>{t}</span>)}
            </div>
          </header>

          {/* Content sections */}
          <div style={styles.body} itemProp="articleBody">
            {post.sections.map((section, idx) => (
              <section key={idx} style={styles.section}>
                <h2 style={styles.h2}>{section.heading}</h2>
                <div style={styles.prose}>
                  {renderContent(section.content)}
                </div>
              </section>
            ))}
          </div>

          {/* FAQ */}
          {post.faq?.length > 0 && (
            <section style={styles.faqSection}>
              <h2 style={styles.h2}>Frequently Asked Questions</h2>
              {post.faq.map((f, i) => (
                <details key={i} style={styles.faqItem}>
                  <summary style={styles.faqQ}>{f.q}</summary>
                  <p style={styles.faqA}>{f.a}</p>
                </details>
              ))}
            </section>
          )}
        </article>

        {/* Related posts */}
        <aside style={styles.related}>
          <h3 style={styles.relatedTitle}>Keep Reading</h3>
          <div style={styles.relatedGrid}>
            {blogPosts
              .filter(p => p.slug !== post.slug)
              .slice(0, 3)
              .map(p => (
                <Link key={p.slug} to={`/blog/${p.slug}`} style={styles.relatedCard}>
                  <span style={styles.relatedCat}>{p.category}</span>
                  <span style={styles.relatedName}>{p.title}</span>
                  <span style={styles.relatedMeta}>{p.readTime}</span>
                </Link>
              ))}
          </div>
        </aside>

        {/* CTA */}
        <section style={styles.cta}>
          <h2 style={styles.ctaTitle}>Protect Your Privacy Today</h2>
          <p style={styles.ctaSub}>Fast, secure VPN with WireGuard, OpenVPN & Shadowsocks — free tier available.</p>
          <Link to="/register" style={styles.ctaBtn}>Get VPN XO Free</Link>
        </section>

        {/* Footer */}
        <footer style={styles.footer}>
          <p>© {new Date().getFullYear()} VPN XO. All rights reserved.</p>
          <div style={styles.footerLinks}>
            <Link to="/" style={styles.footerLink}>Home</Link>
            <Link to="/blog" style={styles.footerLink}>Blog</Link>
            <Link to="/privacy-policy" style={styles.footerLink}>Privacy Policy</Link>
            <Link to="/terms-of-service" style={styles.footerLink}>Terms of Service</Link>
          </div>
        </footer>
      </div>
    </>
  );
}

/* ---------- Security: escape HTML entities before markdown rendering ---------- */
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/* ---------- Helper: render Markdown-lite content ---------- */
function renderContent(text) {
  // Split by double-newline into paragraphs
  return text.split('\n\n').map((block, i) => {
    // Simple table detection
    if (block.includes('|') && block.includes('---')) {
      return renderTable(block, i);
    }
    // Escape HTML first, then apply safe markdown transformations
    const html = escapeHtml(block)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code style="background:rgba(0,212,255,0.1);padding:2px 6px;border-radius:4px;font-size:0.9em;color:#00d4ff">$1</code>')
      .replace(/\n/g, '<br/>');

    return (
      <p key={i} style={styles.p} dangerouslySetInnerHTML={{ __html: html }} />
    );
  });
}

function renderTable(text, key) {
  const lines = text.trim().split('\n').filter(l => l.trim());
  if (lines.length < 3) return <p key={key}>{text}</p>;

  const parseRow = row => row.split('|').map(c => c.trim()).filter(Boolean);
  const headers = parseRow(lines[0]);
  const rows = lines.slice(2).map(parseRow);

  return (
    <div key={key} style={styles.tableWrap}>
      <table style={styles.table}>
        <thead>
          <tr>{headers.map((h, i) => <th key={i} style={styles.th} dangerouslySetInnerHTML={{ __html: escapeHtml(h).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }} />)}</tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td key={ci} style={styles.td} dangerouslySetInnerHTML={{ __html: escapeHtml(cell).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }} />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 28px',
    borderBottom: '1px solid rgba(255,255,255,0.06)'
  },
  logoLink: { textDecoration: 'none' },
  logo: { fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: 1 },
  logoAccent: { color: '#00d4ff' },
  backLink: {
    color: '#00d4ff',
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: 500
  },
  article: {
    maxWidth: 780,
    margin: '0 auto',
    padding: '48px 24px 0'
  },
  header: { marginBottom: 48 },
  categoryBadge: {
    display: 'inline-block',
    background: 'rgba(0,212,255,0.12)',
    color: '#00d4ff',
    fontSize: 12,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    padding: '6px 14px',
    borderRadius: 20,
    marginBottom: 20
  },
  title: {
    fontSize: 'clamp(26px, 4.5vw, 42px)',
    fontWeight: 800,
    lineHeight: 1.2,
    color: '#fff',
    margin: '0 0 16px'
  },
  excerpt: {
    fontSize: 18,
    lineHeight: 1.6,
    color: '#94a3b8',
    marginBottom: 20
  },
  meta: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16
  },
  dot: { margin: '0 8px' },
  tags: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  tag: {
    background: 'rgba(0,212,255,0.1)',
    color: '#00d4ff',
    fontSize: 12,
    padding: '4px 12px',
    borderRadius: 12,
    fontWeight: 500
  },
  body: {},
  section: { marginBottom: 40 },
  h2: {
    fontSize: 24,
    fontWeight: 700,
    color: '#fff',
    marginBottom: 16,
    lineHeight: 1.3,
    borderLeft: '3px solid #00d4ff',
    paddingLeft: 16
  },
  prose: { fontSize: 16, lineHeight: 1.75, color: '#cbd5e1' },
  p: { marginBottom: 16 },
  tableWrap: {
    overflowX: 'auto',
    marginBottom: 20,
    borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.08)'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 14,
    lineHeight: 1.5
  },
  th: {
    textAlign: 'left',
    padding: '12px 16px',
    background: 'rgba(0,212,255,0.08)',
    color: '#fff',
    fontWeight: 600,
    borderBottom: '1px solid rgba(255,255,255,0.1)'
  },
  td: {
    padding: '10px 16px',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
    color: '#cbd5e1'
  },
  faqSection: {
    marginTop: 56,
    marginBottom: 48,
    padding: '36px 28px',
    borderRadius: 16,
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)'
  },
  faqItem: {
    marginBottom: 12,
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    paddingBottom: 12
  },
  faqQ: {
    cursor: 'pointer',
    fontSize: 16,
    fontWeight: 600,
    color: '#fff',
    padding: '8px 0',
    listStyle: 'none'
  },
  faqA: {
    fontSize: 15,
    lineHeight: 1.7,
    color: '#94a3b8',
    padding: '8px 0 4px 8px'
  },
  related: {
    maxWidth: 1100,
    margin: '0 auto',
    padding: '48px 24px'
  },
  relatedTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: '#fff',
    marginBottom: 24,
    textAlign: 'center'
  },
  relatedGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: 20
  },
  relatedCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 14,
    padding: '22px 20px',
    textDecoration: 'none',
    transition: 'transform .2s'
  },
  relatedCat: {
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#00d4ff'
  },
  relatedName: {
    fontSize: 16,
    fontWeight: 600,
    color: '#fff',
    lineHeight: 1.4
  },
  relatedMeta: {
    fontSize: 13,
    color: '#64748b'
  },
  cta: {
    textAlign: 'center',
    padding: '64px 20px',
    background: 'linear-gradient(135deg, rgba(0,212,255,0.08), rgba(0,136,255,0.08))',
    borderTop: '1px solid rgba(0,212,255,0.15)'
  },
  ctaTitle: { fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 12 },
  ctaSub: { fontSize: 16, color: '#94a3b8', maxWidth: 520, margin: '0 auto 24px' },
  ctaBtn: {
    display: 'inline-block',
    background: 'linear-gradient(135deg, #00d4ff, #0088ff)',
    color: '#fff',
    fontWeight: 700,
    fontSize: 16,
    padding: '14px 36px',
    borderRadius: 12,
    textDecoration: 'none'
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
