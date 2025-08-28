import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'business.business';
  lang?: 'fr' | 'en';
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title = "Nzoo Immo - Espaces de Travail Modernes à Kinshasa",
  description = "Découvrez les espaces de travail modernes de Nzoo Immo à Kinshasa. Coworking, bureaux privés, domiciliation d'entreprise. Solutions flexibles pour entrepreneurs et entreprises.",
  keywords = "coworking kinshasa, bureau privé kinshasa, domiciliation entreprise, espace de travail, nzoo immo, location bureau kinshasa, espace coworking rdc",
  image = "https://nzoo.immo/logo_nzooimmo.svg",
  url = "https://nzoo.immo",
  type = "website",
  lang = "fr"
}) => {
  const fullTitle = title.includes("Nzoo Immo") ? title : `${title} | Nzoo Immo`;
  const fullUrl = url.startsWith('http') ? url : `https://nzoo.immo${url}`;
  const fullImage = image.startsWith('http') ? image : `https://nzoo.immo${image}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="language" content={lang === 'fr' ? 'French' : 'English'} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:site_name" content="Nzoo Immo" />
      <meta property="og:locale" content={lang === 'fr' ? 'fr_FR' : 'en_US'} />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={fullUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={fullImage} />
      
      {/* Language alternates */}
      {lang === 'fr' && (
        <link rel="alternate" hreflang="en" href={fullUrl.replace('/en', '').replace('nzoo.immo', 'nzoo.immo/en')} />
      )}
      {lang === 'en' && (
        <link rel="alternate" hreflang="fr" href={fullUrl.replace('/en', '')} />
      )}
    </Helmet>
  );
};

export default SEOHead;
