export interface CloudinaryImage {
  secure_url: string;
  public_id: string;
  _id?: string;
}

export interface Category {
  _id: string;
  nameEnglish?: string;
  nameArabic?: string;
  /** Some categories may only carry a generic 'name' field */
  name?: string;
  image?: CloudinaryImage;
  slugEnglish?: string;
  slugArabic?: string;
  /** Some categories may only carry a generic 'slug' field */
  slug?: string;
  subCategories?: SubCategory[];
  createdAt: string;
  updatedAt: string;
  createdBy?: any;
  folderId?: string;
}

export interface SubCategory {
  _id: string;
  nameEnglish?: string;
  nameArabic?: string;
  categoryId:
    | string
    | {
        _id: string;
        name: string;
        image?: CloudinaryImage;
        createdBy?: string;
        folderId?: string;
        slug?: string;
        createdAt: string;
        updatedAt: string;
        __v?: number;
        subCategories?: string[];
      };
  slugEnglish?: string;
  slugArabic?: string;
  image?: CloudinaryImage;
  createdBy?: any;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}
