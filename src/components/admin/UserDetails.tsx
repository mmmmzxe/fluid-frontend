import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, UserCheck, Mail, Phone, MapPin, Shield, Heart, Package } from 'lucide-react';
import { User as UserType } from '@/services/adminApi';
import { ScrollArea } from '@/components/ui/scroll-area';

interface UserDetailsProps {
  user: UserType & { favorites?: any[]; phone?: string; address?: string };
  onClose: () => void;
}

const UserDetails: React.FC<UserDetailsProps> = ({ user, onClose }) => {
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'superAdmin':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'admin':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'superAdmin':
        return <Shield className="h-4 w-4" />;
      case 'admin':
        return <UserCheck className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const favorites = user.favorites || [];

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-cyan-500/10">
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <User className="h-5 w-5" />
              User Details
            </span>
            <Badge className={getRoleColor(user.role)}>
              <span className="flex items-center gap-1">
                {getRoleIcon(user.role)}
                {user.role === 'superAdmin' ? 'Super Admin' : user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </span>
            </Badge>
          </DialogTitle>
          <DialogDescription>
            User ID: {user._id}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-100px)]">
          <div className="p-6 space-y-6">
            {/* User Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5" />
                  User Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Name</div>
                    <div className="font-medium">{user.name}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Email</div>
                    <div className="font-medium">{user.email}</div>
                  </div>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Phone</div>
                      <div className="font-medium">{user.phone}</div>
                    </div>
                  </div>
                )}
                {user.address && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Address</div>
                      <div className="font-medium">{user.address}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Favorites */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Heart className="h-5 w-5 text-red-500" />
                  Favorites ({favorites.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {favorites.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Heart className="h-12 w-12 mx-auto mb-2 opacity-30" />
                    <p>No favorite products</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {favorites.map((product: any) => {
                      const totalStock = product.variants?.reduce((sum: number, v: any) => 
                        sum + (v.size?.reduce((s: number, sz: any) => s + (sz.stock || 0), 0) || 0), 0
                      ) || 0;
                      
                      return (
                        <div
                          key={product._id}
                          className="p-4 rounded-xl border bg-card hover:shadow-md transition-shadow"
                        >
                          <div className="flex gap-4">
                            {/* Product Image */}
                            <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                              {product.mainImage?.secure_url ? (
                                <img
                                  src={product.mainImage.secure_url}
                                  alt={product.titleEnglish}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="h-8 w-8 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            
                            {/* Product Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h4 className="font-semibold">{product.titleEnglish}</h4>
                                  <p className="text-sm text-muted-foreground">{product.titleArabic}</p>
                                </div>
                                {product.discount > 0 && (
                                  <Badge variant="destructive" className="text-xs flex-shrink-0">
                                    -{product.discount}%
                                  </Badge>
                                )}
                              </div>
                              
                              {/* Price */}
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-lg font-bold text-primary">
                                  L.E {product.finalPrice?.toFixed(2)}
                                </span>
                                {product.discount > 0 && (
                                  <span className="text-sm text-muted-foreground line-through">
                                    L.E {product.price?.toFixed(2)}
                                  </span>
                                )}
                              </div>
                              
                              {/* Description */}
                              {product.descriptionEnglish && (
                                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                                  {product.descriptionEnglish}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          {/* Variants & Stats */}
                          <div className="mt-3 pt-3 border-t flex flex-wrap items-center gap-3">
                            {/* Color Variants */}
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-muted-foreground mr-1">Colors:</span>
                              {product.variants?.slice(0, 5).map((v: any) => (
                                <div
                                  key={v._id}
                                  className="w-5 h-5 rounded-full border-2 shadow-sm"
                                  style={{ backgroundColor: v.color }}
                                  title={v.color}
                                />
                              ))}
                              {(product.variants?.length || 0) > 5 && (
                                <span className="text-xs text-muted-foreground">+{product.variants.length - 5}</span>
                              )}
                            </div>
                            
                            <div className="flex-1" />
                            
                            {/* Stats */}
                            <Badge variant="outline" className="text-xs">
                              <Package className="h-3 w-3 mr-1" />
                              Stock: {totalStock}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              Sold: {product.sellCount || 0}
                            </Badge>
                          </div>
                          
                          {/* Sizes per Variant */}
                          {product.variants?.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {product.variants.slice(0, 3).map((v: any) => (
                                <div key={v._id} className="flex items-center gap-2 text-xs">
                                  <div
                                    className="w-4 h-4 rounded-full border"
                                    style={{ backgroundColor: v.color }}
                                  />
                                  <span className="text-muted-foreground">Sizes:</span>
                                  <div className="flex flex-wrap gap-1">
                                    {v.size?.map((s: any) => (
                                      <span key={s._id} className="px-2 py-0.5 rounded bg-muted text-xs">
                                        {s.size} ({s.stock})
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              ))}
                              {(product.variants?.length || 0) > 3 && (
                                <p className="text-xs text-muted-foreground">
                                  +{product.variants.length - 3} more variant(s)
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetails;



