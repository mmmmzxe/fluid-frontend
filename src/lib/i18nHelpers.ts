import i18n from '@/i18n/config';

/**
 * Helper function to get the localized value from API response
 * Handles fields with Arabic and English variants
 */
export const getLocalizedField = (
  arabicValue: string | undefined,
  englishValue: string | undefined
): string => {
  const currentLang = i18n.language;
  
  if (currentLang === 'ar') {
    return arabicValue || englishValue || '';
  }
  
  return englishValue || arabicValue || '';
};

/**
 * Get localized product title
 */
export const getProductTitle = (product: any): string => {
  if (!product) return '';
  return getLocalizedField(product.titleArabic, product.titleEnglish);
};

/**
 * Get localized product description
 */
export const getProductDescription = (product: any): string => {
  if (!product) return '';
  return getLocalizedField(product.descriptionArabic, product.descriptionEnglish);
};

/**
 * Get localized category name
 */
export const getCategoryName = (category: any): string => {
  if (!category) return '';
  return getLocalizedField(category.nameArabic, category.nameEnglish);
};

/**
 * Check if current language is RTL
 */
export const isRTL = (): boolean => {
  return i18n.language === 'ar';
};

/**
 * Format price with currency based on language
 */
export const formatPrice = (price: number): string => {
  const currentLang = i18n.language;
  
  if (currentLang === 'ar') {
    return `${price.toLocaleString('ar-EG')} ج.م`;
  }
  
  return `$${price.toLocaleString('en-US')}`;
};

