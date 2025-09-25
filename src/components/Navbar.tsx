import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, User, ShoppingBag, Menu, X, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/hooks/useRedux";

const navigationItems = [
  { name: "Jewelry & Accessories", href: "/products?category=jewelry" },
  { name: "Clothing & Shoes", href: "/products?category=clothing" },
  { name: "Home & Living", href: "/products?category=home" },
  { name: "Wedding & Party", href: "/products?category=wedding" },
  { name: "Toys & Entertainment", href: "/products?category=toys" },
  { name: "Art & Collectibles", href: "/products?category=art" },
  { name: "Craft Supplies & Tools", href: "/products?category=craft" },
];

export function Navbar() {
  const cartItems = useAppSelector((state) => state.cart.items);
  const favoritesItems = useAppSelector((state) => state.favorites.items);
  const { isAuthenticated } = useAppSelector((state) => state.user);
  const cartItemsCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (href: string) => {
    if (href === "/" && location.pathname === "/") return true;
    if (href !== "/" && location.pathname.startsWith(href.split('?')[0])) return true;
    return false;
  };

  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar */}
        <div className="flex items-center justify-between h-16">
          {/* Search icon - left */}
          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Search className="h-5 w-5" />
            </Button>
          </div>

          {/* Logo - center */}
          <Link to="/" className="flex-shrink-0">
            <div className="text-2xl font-bold tracking-wider text-navy">
              CORAL
            </div>
          </Link>

          {/* Account & Shopping - right */}
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" asChild>
              <Link to="/favorites" className="relative">
                <Heart className="h-5 w-5" />
                {favoritesItems.length > 0 && (
                  <Badge className="absolute  text-center flex justify-center -top-2 -right-2 h-5 w-5 p-0 text-xs">
                    {favoritesItems.length}
                  </Badge>
                )}
              </Link>
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" asChild>
              <Link to={isAuthenticated ? "/profile" : "/login"}>
                <User className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" asChild>
              <Link to="/cart" className="relative">
                <ShoppingBag className="h-5 w-5" />
                {cartItemsCount > 0 && (
                  <Badge className="absolute -top-2 text-center flex justify-center -right-2 h-5 w-5 p-0 text-xs">
                    {cartItemsCount}
                  </Badge>
                )}
              </Link>
            </Button>
            
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-muted-foreground hover:text-foreground"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Navigation items - desktop */}
        <div className="hidden md:flex items-center justify-center space-x-8 py-4 border-t border-border">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                isActive(item.href) ? "text-primary" : "text-muted-foreground"
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Mobile navigation */}
        {isOpen && (
          <div className="md:hidden border-t border-border">
            <div className="py-4 space-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "block px-4 py-2 text-sm font-medium transition-colors hover:text-primary hover:bg-accent",
                    isActive(item.href) ? "text-primary bg-accent" : "text-muted-foreground"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}