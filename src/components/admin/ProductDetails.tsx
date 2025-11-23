import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Product } from '@/services/adminApi';
import { Package, Tag, DollarSign, Layers } from 'lucide-react';

interface ProductDetailsProps {
    product: Product;
    onClose: () => void;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ product, onClose }) => {
    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
                <DialogHeader className="px-6 py-4 border-b">
                    <DialogTitle className="text-xl">Product Details</DialogTitle>
                    <DialogDescription>
                        View complete information about this product
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-1 px-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left Column - Images */}
                        <div className="space-y-4">
                            <div className="aspect-square rounded-lg overflow-hidden border bg-gray-50">
                                {product.mainImage?.secure_url ? (
                                    <img
                                        src={product.mainImage.secure_url}
                                        alt={product.titleEnglish}
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                        <Package className="h-12 w-12" />
                                    </div>
                                )}
                            </div>

                            {product.subImages && product.subImages.length > 0 && (
                                <div className="grid grid-cols-4 gap-2">
                                    {product.subImages.map((img, index) => (
                                        <div key={img._id || index} className="aspect-square rounded-md overflow-hidden border bg-gray-50">
                                            <img
                                                src={img.secure_url}
                                                alt={`Sub ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Right Column - Details */}
                        <div className="space-y-6">
                            {/* Header Info */}
                            <div>
                                <h2 className="text-2xl font-bold">{product.titleEnglish}</h2>
                                <p className="text-lg text-muted-foreground mt-1 font-arabic">{product.titleArabic}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <Badge variant="outline" className="flex items-center gap-1">
                                        <Layers className="h-3 w-3" />
                                        {product.category}
                                    </Badge>
                                    {product.subCategory && (
                                        <Badge variant="secondary">
                                            {product.subCategory}
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            <Separator />

                            {/* Price Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-lg bg-gray-50 border">
                                    <div className="text-sm text-muted-foreground mb-1">Final Price</div>
                                    <div className="text-2xl font-bold text-primary flex items-center">
                                        L.E {product.finalPrice.toFixed(2)}
                                    </div>
                                </div>
                                <div className="p-4 rounded-lg bg-gray-50 border">
                                    <div className="text-sm text-muted-foreground mb-1">Original Price</div>
                                    <div className="text-xl font-semibold flex items-center gap-2">
                                        L.E {product.price.toFixed(2)}
                                        {product.discount && product.discount > 0 && (
                                            <Badge variant="destructive">-{product.discount}%</Badge>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                                        <Tag className="h-4 w-4" /> Description (English)
                                    </h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {product.descriptionEnglish}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                                        <Tag className="h-4 w-4" /> Description (Arabic)
                                    </h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed font-arabic">
                                        {product.descriptionArabic}
                                    </p>
                                </div>
                            </div>

                            <Separator />

                            {/* Variants */}
                            {product.variants && product.variants.length > 0 && (
                                <div>
                                    <h3 className="font-semibold mb-3">Variants</h3>
                                    <div className="space-y-3">
                                        {product.variants.map((variant, index) => (
                                            <div key={variant._id || index} className="flex items-center gap-4 p-3 rounded-lg border bg-card">
                                                <div
                                                    className="w-8 h-8 rounded-full border shadow-sm"
                                                    style={{ backgroundColor: variant.color }}
                                                    title={variant.color}
                                                />
                                                <div className="flex-1">
                                                    <div className="text-sm font-medium mb-1">Color: {variant.color}</div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {variant.size.map((s, sIndex) => (
                                                            <Badge key={s._id || sIndex} variant="secondary" className="text-xs">
                                                                {s.size || Object.keys(s).find(k => k !== 'stock' && k !== '_id')}: {s.stock} units
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
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
};

export default ProductDetails;
