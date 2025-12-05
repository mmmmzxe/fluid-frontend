import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  keywords?: string;
}

const SEO: React.FC<SEOProps> = ({
  title = 'ExtraChic - Stylish & Affordable Fashion',
  description = 'ExtraChic - Your go-to destination for stylish and affordable fashion. Discover the latest trends in clothing, accessories, and more.',
  image = '/seo-image.png',
  url = window.location.href,
  type = 'website',
  keywords = 'fashion, clothing, style, affordable fashion, online shopping, ExtraChic',
}) => {
  const fullTitle = title.includes('ExtraChic') ? title : `${title} | ExtraChic`;
  const fullImageUrl = image.startsWith('http') ? image : `${window.location.origin}${image}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={url} />

      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="ExtraChic" />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@ExtraChic" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
    </Helmet>
  );
};

export default SEO;
