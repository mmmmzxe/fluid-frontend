import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  keywords?: string;
}

const SEO: React.FC<SEOProps> = ({
  title,
  description,
  image = '/seo-image.png',
  url = window.location.href,
  type = 'website',
  keywords,
}) => {
  const { t } = useTranslation();

  const siteTitle = t('seo.defaultTitle', "ExtraChic | Women's Fashion, Lingerie, Homewear & Accessories");
  const defaultDesc = t('seo.defaultDescription', "Shop the latest trends at ExtraChic. Discover lingerie, homewear, casual wear, dresses, and more. Elevate your style with quality fashion for every occasion.");
  const defaultKeywords = t('seo.defaultKeywords', "women's fashion, online clothing, lingerie, homewear, casual wear, dresses, sportswear, pajamas, abayas, swimwear");

  const fullTitle = title ? (title.includes('ExtraChic') ? title : `${title} | ExtraChic`) : siteTitle;
  const metaDescription = description || defaultDesc;
  const metaKeywords = keywords || defaultKeywords;
  const fullImageUrl = image.startsWith('http') ? image : `${window.location.origin}${image}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content={metaKeywords} />
      <link rel="canonical" href={url} />

      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
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
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={fullImageUrl} />
    </Helmet>
  );
};

export default SEO;
