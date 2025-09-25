import { Link } from "react-router-dom";
import { Instagram, Facebook, Twitter, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const footerSections = [
  {
    title: "Shop",
    links: [
      { name: "All Products", href: "/products" },
      { name: "New Arrivals", href: "/products?filter=new" },
      { name: "Best Sellers", href: "/products?filter=bestsellers" },
      { name: "Sale", href: "/products?filter=sale" },
    ],
  },
  {
    title: "Customer Care",
    links: [
      { name: "Contact Us", href: "/contact" },
      { name: "Size Guide", href: "/size-guide" },
      { name: "Shipping Info", href: "/shipping" },
      { name: "Returns", href: "/returns" },
    ],
  },
  {
    title: "Company",
    links: [
      { name: "About Us", href: "/about" },
      { name: "Careers", href: "/careers" },
      { name: "Press", href: "/press" },
      { name: "Sustainability", href: "/sustainability" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Newsletter Section */}
        <div className="mb-12 text-center">
          <h3 className="text-2xl font-semibold mb-4">Or Subscribe To The Newsletter</h3>
          <div className="max-w-md mx-auto flex gap-2">
            <Input
              type="email"
              placeholder="Email Address..."
              className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
            />
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-navy">
              Submit
            </Button>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <Link to="/" className="text-2xl font-bold tracking-wider mb-4 block">
              CORAL
            </Link>
            <p className="text-white/80 text-sm mb-4">
              Discover unique style with our curated collection of fashion, accessories, and lifestyle products.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" className="text-white/80 hover:text-white hover:bg-white/10">
                <Instagram className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-white/80 hover:text-white hover:bg-white/10">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-white/80 hover:text-white hover:bg-white/10">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-white/80 hover:text-white hover:bg-white/10">
                <Youtube className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="font-semibold mb-4">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-white/80 hover:text-white text-sm transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/20 text-center text-white/60 text-sm">
          <p>&copy; 2024 CORAL. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}