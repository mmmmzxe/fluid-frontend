import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, User, ShoppingBag, Menu, X, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, normalizeImageUrl } from "@/lib/utils";
import { useAppSelector } from "@/hooks/useRedux";
import { useCategories } from "@/hooks/useApi";
import logoNav from "@/assets/LogoNav.png";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { getCategoryName } from "@/lib/i18nHelpers";

export function Navbar() {
  const { t } = useTranslation();
  const favoritesItems = useAppSelector((state) => state.favorites.items);
  const { isAuthenticated, cart } = useAppSelector((state) => state.user);
  const { categories, loading: categoriesLoading } = useCategories();
  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setIsOpen(false);
    }
  };

  const isActive = (href: string) => {
    if (href === "/" && location.pathname === "/") return true;
    if (href !== "/" && location.pathname.startsWith(href.split("?")[0])) return true;
    return false;
  };

  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50 pt-[env(safe-area-inset-top)]">
      <div className="mx-auto w-full">
        {/* Top bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Search icon - left */}


            {/* Logo - center */}
            <Link to="/" className="flex-shrink-0 flex justify-center items-center">
              <img src={logoNav} className="h-36 " alt="Logo Nav" />
             
            </Link>

            {/* Account & Shopping */}
            <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
              <LanguageSwitcher />
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-foreground"
                asChild
              >
                <Link to="/favorites" className="relative">
                  <Heart className="h-5 w-5" />
                  {favoritesItems.length > 0 && (
                    <Badge className="absolute text-center flex justify-center -top-1.5 -end-1.5 h-4 min-w-4 px-1 p-0 text-[10px] leading-none">
                      {favoritesItems.length}
                    </Badge>
                  )}
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-foreground"
                asChild
              >
                <Link to={isAuthenticated ? "/profile" : "/login"}>
                  <User className="h-5 w-5" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-foreground"
                asChild
              >
                <Link to="/cart" className="relative">
                  <ShoppingBag className="h-5 w-5" />
                  {cartItemsCount > 0 && (
                    <Badge className="absolute -top-1.5 text-center flex justify-center -end-1.5 h-4 min-w-4 px-1 p-0 text-[10px] leading-none">
                      {cartItemsCount}
                    </Badge>
                  )}
                </Link>
              </Button>

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-9 w-9 text-muted-foreground hover:text-foreground"
                onClick={() => setIsOpen(!isOpen)}
                aria-label={isOpen ? "Close menu" : "Open menu"}
                aria-expanded={isOpen}
              >
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Text marquee before categories */}
        <div className="overflow-hidden w-full bg-secondary text-primary-foreground border-t border-border py-1.5 sm:py-2">
          <motion.div
            className="text-primary-foreground font-medium text-xs sm:text-sm whitespace-nowrap"
            animate={{ x: ["100%", "-100%"] }}
            transition={{
              repeat: Infinity,
              duration: 15,
              ease: "linear",
            }}
          >
            {t("nav.discoverCategories")}
            {t("nav.discoverCategories")}
            {t("nav.discoverCategories")}
          </motion.div>
        </div>

        {/* Navigation items - desktop */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="hidden md:flex items-center justify-center flex-wrap gap-x-8 gap-y-2 py-4 border-t border-border">
            {categoriesLoading ? (
              <div className="text-sm text-muted-foreground">{t("products.loadingCategories")}</div>
            ) : (
              categories?.map((category) => (
                <Link
                  key={category._id}
                  to={`/products?category=${category._id}`}
                  className={cn(
                    "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary group",
                    isActive(`/products?category=${category._id}`)
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  {category.image?.secure_url && (
                    <img
                      src={normalizeImageUrl(category.image.secure_url)}
                      alt={getCategoryName(category)}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  )}
                  <span>{getCategoryName(category)}</span>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Mobile navigation */}
        {isOpen && (
          <div className="md:hidden border-t border-border max-h-[min(70vh,calc(100dvh-8rem))] overflow-y-auto overscroll-contain">
            <div className="py-3 space-y-1 px-1 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              {/* Mobile Search */}
              <div className="px-3 pb-3">
                <form onSubmit={handleSearch} className="flex items-center gap-2">
                  <input
                    type="search"
                    enterKeyHint="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t("nav.searchPlaceholder")}
                    className="flex-1 min-w-0 h-10 rounded-md border border-input bg-background px-3 py-1 text-base sm:text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                  <Button
                    type="submit"
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 shrink-0 text-muted-foreground hover:text-foreground"
                  >
                    <Search className="h-5 w-5" />
                  </Button>
                </form>
              </div>

              {/* All Products Link */}
              <Link
                to="/products"
                className={cn(
                  "block px-4 py-2.5 text-sm font-medium transition-colors hover:text-primary hover:bg-accent rounded-md",
                  isActive("/products") ? "text-primary bg-accent" : "text-muted-foreground"
                )}
                onClick={() => setIsOpen(false)}
              >
                {t("nav.allProducts")}
              </Link>

              {categoriesLoading ? (
                <div className="px-4 py-2 text-sm text-muted-foreground">
                  {t("products.loadingCategories")}
                </div>
              ) : (
                categories?.map((category) => (
                  <Link
                    key={category._id}
                    to={`/products?category=${category._id}`}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors hover:text-primary hover:bg-accent rounded-md",
                      isActive(`/products?category=${category._id}`)
                        ? "text-primary bg-accent"
                        : "text-muted-foreground"
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    {category.image?.secure_url && (
                      <img
                        src={normalizeImageUrl(category.image.secure_url)}
                        alt={getCategoryName(category)}
                        className="w-6 h-6 rounded-full object-cover shrink-0"
                      />
                    )}
                    <span className="truncate">{getCategoryName(category)}</span>
                  </Link>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
