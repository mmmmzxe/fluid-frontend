import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Product } from '@/services/adminApi';
import { Package, Tag, Palette, Ruler, Box, Calendar, Percent, DollarSign, ShoppingBag, Sparkles } from 'lucide-react';

interface ProductDetailsProps {
    product: Product;
    onClose: () => void;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ product, onClose }) => {
    const [selectedImage, setSelectedImage] = useState(product.mainImage?.secure_url || '');

    const allImages = [
        product.mainImage?.secure_url,
        ...(product.subImages?.map(img => img.secure_url) || [])
    ].filter(Boolean) as string[];

    return (
        <Dialog open={true} onOpenChange={onClose} >
            <DialogContent className="max-w-5xl max-h-[90vh] p-0 bg-background overflow-hidden">
                {/* Header with gradient */}
                <DialogHeader className="px-6 py-5 border-b bg-gradient-to-r from-rose-500/10 via-pink-500/10 to-purple-500/10 sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-lg">
                            <ShoppingBag className="h-5 w-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
                                Product Details
                            </DialogTitle>
                            <DialogDescription className="text-sm">
                                Complete information about this product
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="overflow-y-auto max-h-[calc(90vh-100px)] p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Left Column - Images */}
                            <div className="space-y-4">
                                {/* Main Image */}
                                <div className="relative aspect-square rounded-2xl overflow-hidden border-2 border-muted/50 shadow-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 group">
                                    {selectedImage ? (
                                        <img
                                            src={selectedImage}
                                            alt={product.titleEnglish}
                                            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                            <Package className="h-16 w-16 opacity-30" />
                                        </div>
                                    )}
                                    {/* Discount Badge */}
                                    {product.discount && product.discount > 0 && (
                                        <div className="absolute top-4 left-4">
                                            <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 shadow-lg px-3 py-1 text-sm font-bold">
                                                <Sparkles className="h-3 w-3 mr-1" />
                                                {product.discount}% OFF
                                            </Badge>
                                        </div>
                                    )}
                                </div>

                                {/* Thumbnail Gallery */}
                                {allImages.length > 1 && (
                                    <div className="flex gap-2 overflow-x-auto pb-2">
                                        {allImages.map((img, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setSelectedImage(img)}
                                                className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 hover:scale-105 ${
                                                    selectedImage === img
                                                        ? 'border-pink-500 ring-2 ring-pink-500/30 shadow-lg'
                                                        : 'border-muted/50 hover:border-pink-300'
                                                }`}
                                            >
                                                <img
                                                    src={img}
                                                    alt={`Thumbnail ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Right Column - Details */}
                            <div className="space-y-6">
                                {/* Title Section */}
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-bold tracking-tight">{product.titleEnglish}</h2>
                                    <p className="text-lg text-muted-foreground font-arabic">{product.titleArabic}</p>
                                    <div className="flex items-center gap-2 flex-wrap pt-2">
                                        <Badge variant="outline" className="bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300">
                                            <Tag className="h-3 w-3 mr-1" />
                                            Category
                                        </Badge>
                                        {product.subCategory && (
                                            <Badge variant="outline" className="bg-pink-500/10 border-pink-500/30 text-pink-700 dark:text-pink-300">
                                                Subcategory
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                {/* Price Cards */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 p-4 text-white shadow-xl">
                                        <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                                        <div className="relative">
                                            <div className="flex items-center gap-2 text-white/80 text-sm mb-1">
                                                <DollarSign className="h-4 w-4" />
                                                Final Price
                                            </div>
                                            <div className="text-3xl font-bold">
                                                L.E {product.finalPrice.toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 p-4 border shadow-lg">
                                        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                                            <Percent className="h-4 w-4" />
                                            Original Price
                                        </div>
                                        <div className={`text-2xl font-bold ${product.discount ? 'line-through text-muted-foreground' : ''}`}>
                                            L.E {product.price.toFixed(2)}
                                        </div>
                                        {product.discount && product.discount > 0 && (
                                            <div className="text-sm text-green-600 dark:text-green-400 font-semibold mt-1">
                                                You save: L.E {(product.price - product.finalPrice).toFixed(2)}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Description Section */}
                                <div className="space-y-4">
                                    <div className="p-4 rounded-xl bg-muted/30 border border-muted/50">
                                        <h3 className="font-semibold mb-2 flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wider">
                                            <Tag className="h-4 w-4" />
                                            Description (English)
                                        </h3>
                                        <p className="text-sm leading-relaxed">
                                            {product.descriptionEnglish}
                                        </p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-muted/30 border border-muted/50" dir="rtl">
                                        <h3 className="font-semibold mb-2 flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wider">
                                            <Tag className="h-4 w-4" />
                                            الوصف (عربي)
                                        </h3>
                                        <p className="text-sm leading-relaxed font-arabic">
                                            {product.descriptionArabic}
                                        </p>
                                    </div>
                                </div>

                                {/* Variants Section */}
                                {product.variants && product.variants.length > 0 && (
                                    <div className="space-y-3">
                                        <h3 className="font-semibold flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wider">
                                            <Palette className="h-4 w-4" />
                                            Available Variants
                                        </h3>
                                        <div className="grid gap-3">
                                            {product.variants.map((variant, index) => (
                                                <div
                                                    key={variant._id || index}
                                                    className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-muted/50 to-muted/30 border border-muted/50 hover:border-pink-500/30 transition-all duration-300 hover:shadow-md"
                                                >
                                                    <div
                                                        className="w-12 h-12 rounded-xl text-white border-2 shadow-lg ring-2 ring-offset-2 ring-offset-background"
                                                        style={{ 
                                                            backgroundColor: variant.color,
                                                            borderColor: variant.color === '#ffffff' || variant.color === 'white' ? '#e5e7eb' : variant.color
                                                        }}
                                                        title={variant.color}
                                                    />
                                                    <div className="flex-1">
                                                        <div className="flex items-center  gap-2 mb-2">
                                                            <Palette className="h-4 w-4 text-muted-foreground" />
                                                            <span className="font-medium">{variant.color}</span>
                                                        </div>
                                                        <div className="flex flex-wrap text-white gap-2">
                                                            {variant.size.map((s, sIndex) => (
                                                                <Badge
                                                                    key={s._id || sIndex}
                                                                    className="text-white border-rose-500/30 hover:from-rose-500/30 hover:to-pink-500/30 transition-colors"
                                                                >
                                                                    <Ruler className="h-3 w-3 mr-1" />
                                                                    {s.size || 'N/A'}
                                                                    <span className="mx-1 text-muted-foreground">•</span>
                                                                    <Box className="h-3 w-3 mr-1" />
                                                                    {s.stock} in stock
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                             
                            
                            </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ProductDetails;

