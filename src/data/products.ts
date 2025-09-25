import { Product } from "@/components/ProductCard";

export const products: Product[] = [
  {
    id: "1",
    name: "Athleir Classics Joggers",
    price: 63.85,
    category: "clothing",
    image: "https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=400&h=400&fit=crop&crop=center",
    rating: 4.5,
    reviewCount: 128,
    isNew: false,
    colors: ["#E8B4CB", "#8B5A5A", "#2F2F2F"]
  },
  {
    id: "2", 
    name: "Nike Sportswear Future Luxe",
    price: 130.00,
    category: "clothing",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop&crop=center",
    rating: 4.8,
    reviewCount: 256,
    isNew: false,
    colors: ["#D4A574", "#8B4513", "#2F2F2F"]
  },
  {
    id: "3",
    name: "Geometric Print Scarf",
    price: 55.00,
    category: "jewelry",
    image: "https://images.unsplash.com/photo-1601924638867-985dbc1e1974?w=400&h=400&fit=crop&crop=center",
    rating: 4.2,
    reviewCount: 89,
    isNew: true,
    isSale: true,
    colors: ["#4A90E2", "#E8B4CB", "#2F2F2F"]
  },
  {
    id: "4",
    name: "Yellow Reserved Hoodie",
    price: 55.00,
    originalPrice: 75.00,
    category: "clothing", 
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop&crop=center",
    rating: 4.6,
    reviewCount: 145,
    isNew: false,
    isSale: true,
    colors: ["#FFD700", "#FF6B35", "#2F2F2F"]
  },
  {
    id: "5",
    name: "Basic Dress Green",
    price: 249.00,
    category: "clothing",
    image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=400&fit=crop&crop=center",
    rating: 4.4,
    reviewCount: 203,
    isNew: true,
    colors: ["#228B22", "#2F4F2F", "#8FBC8F"]
  },
  {
    id: "6",
    name: "Nike Air Zoom Pegasus",
    price: 120.00,
    originalPrice: 150.00,
    category: "clothing",
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop&crop=center",
    rating: 4.7,
    reviewCount: 312,
    isNew: false,
    isSale: true,
    colors: ["#87CEEB", "#4682B4", "#2F4F4F"]
  },
  {
    id: "7",
    name: "Nike Royal Miller",
    price: 100.50,
    category: "clothing",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop&crop=center",
    rating: 4.3,
    reviewCount: 98,
    isNew: false,
    colors: ["#191970", "#4169E1", "#87CEFA"]
  },
  {
    id: "8",
    name: "Isike Sportswear Future Luxe",
    price: 160.00,
    category: "jewelry",
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop&crop=center",
    rating: 4.1,
    reviewCount: 67,
    isNew: false,
    colors: ["#2F2F2F", "#696969", "#C0C0C0"]
  },
  {
    id: "9",
    name: "Long Sleeve Oversized Khaki 6",
    price: 89.00,
    category: "clothing",
    image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400&h=400&fit=crop&crop=center",
    rating: 4.5,
    reviewCount: 176,
    isNew: true,
    colors: ["#8B7355", "#DEB887", "#F5DEB3"]
  },
  {
    id: "10",
    name: "Minimalist Leather Backpack",
    price: 135.00,
    category: "jewelry",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop&crop=center",
    rating: 4.8,
    reviewCount: 234,
    isNew: false,
    colors: ["#D2B48C", "#8B4513", "#2F2F2F"]
  },
  {
    id: "11",
    name: "Classic White Button Down",
    price: 75.00,
    category: "clothing",
    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop&crop=center",
    rating: 4.6,
    reviewCount: 189,
    isNew: false,
    colors: ["#FFFFFF", "#F8F8FF", "#E6E6FA"]
  },
  {
    id: "12",
    name: "Casual Denim Jacket",
    price: 95.00,
    originalPrice: 120.00,
    category: "clothing",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop&crop=center",
    rating: 4.4,
    reviewCount: 156,
    isNew: false,
    isSale: true,
    colors: ["#4682B4", "#6495ED", "#B0C4DE"]
  }
];

export const categories = [
  { id: "all", name: "All Products", count: products.length },
  { id: "clothing", name: "Clothing & Shoes", count: products.filter(p => p.category === "clothing").length },
  { id: "jewelry", name: "Jewelry & Accessories", count: products.filter(p => p.category === "jewelry").length },
  { id: "home", name: "Home & Living", count: 0 },
  { id: "wedding", name: "Wedding & Party", count: 0 },
  { id: "toys", name: "Toys & Entertainment", count: 0 },
  { id: "art", name: "Art & Collectibles", count: 0 },
  { id: "craft", name: "Craft Supplies & Tools", count: 0 },
];

export const priceRanges = [
  { id: "under-50", label: "Under $50", min: 0, max: 50 },
  { id: "50-100", label: "$50 - $100", min: 50, max: 100 },
  { id: "100-200", label: "$100 - $200", min: 100, max: 200 },
  { id: "over-200", label: "Over $200", min: 200, max: Infinity },
];

export const sortOptions = [
  { id: "featured", label: "Featured" },
  { id: "price-low", label: "Price: Low to High" },
  { id: "price-high", label: "Price: High to Low" },
  { id: "rating", label: "Highest Rated" },
  { id: "newest", label: "Newest" },
];