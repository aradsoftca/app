import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * SEO Component — provides per-page meta tags, Open Graph, Twitter Cards,
 * canonical URL, and optional JSON-LD structured data.
 *
 * Usage:
 *   <SEO
 *     title="Download VPN XO"
 *     description="Download VPN XO for Windows, Chrome extension, or Android."
 *     path="/download"
 *     type="website"
 *   />
 */
const SEO = ({
  title,
  description,
  path = '',
  type = 'website',
  image = 'https://vpn-xo.com/logos/logo_vpnxo_green.png',
  article = null, // { publishedTime, modifiedTime, author, tags }
  noindex = false,
  jsonLd = null,
}) => {
  const siteUrl = 'https://vpn-xo.com';
  const fullUrl = `${siteUrl}${path}`;
  const fullTitle = title ? `${title} | VPN XO` : 'VPN XO — Secure, Fast & Private VPN Service';
  const defaultDesc = 'VPN XO — Fast, secure & private VPN service with military-grade encryption. WireGuard, OpenVPN & Shadowsocks. No-logs policy. Free tier available.';
  const desc = description || defaultDesc;

  return (
    <Helmet>
      {/* Basic */}
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={fullUrl} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:type" content={article ? 'article' : type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="VPN XO" />
      <meta property="og:locale" content="en_US" />

      {/* Article-specific OG */}
      {article?.publishedTime && <meta property="article:published_time" content={article.publishedTime} />}
      {article?.modifiedTime && <meta property="article:modified_time" content={article.modifiedTime} />}
      {article?.author && <meta property="article:author" content={article.author} />}
      {article?.tags?.map((tag, i) => (
        <meta key={i} property="article:tag" content={tag} />
      ))}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={image} />

      {/* JSON-LD */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
