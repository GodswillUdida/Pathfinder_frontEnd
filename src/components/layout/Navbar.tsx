"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ChevronDown, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { navLinks } from "@/data/navData";

export default function Navbar() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Mock cart data – replace with real store later
  const cart = [];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between font-(--font-manrope)">
          {/* Logo */}
          <Link
            href="/"
            className="shrink-0 hover:opacity-80 transition-opacity"
          >
            <Image
              src="https://res.cloudinary.com/dirrncimm/image/upload/v1752703435/assets/AP_Logo_4_SVG_p7cqwy.svg"
              alt="Accountant Pathfinder Logo"
              width={130}
              height={30}
              className="h-9 w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6 text-[0.85rem] font-medium text-gray-800 tracking-tight">
            {navLinks.map((link) => (
              <div key={link.name} className="relative">
                {link.dropdown ? (
                  <div
                    onMouseEnter={() => setActiveDropdown(link.name)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <button className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                      <span>{link.name}</span>
                      <ChevronDown
                        className={cn(
                          "h-3.5 w-3.5 transition-transform duration-200",
                          activeDropdown === link.name && "rotate-180"
                        )}
                      />
                    </button>

                    {activeDropdown === link.name && (
                      <div className="absolute left-0 mt-2 w-80 rounded-lg bg-white shadow-xl ring-1 ring-black/5 p-3 grid grid-cols-1 gap-2">
                        {link.dropdown.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="block rounded-md p-2 hover:bg-gray-50 transition-colors"
                          >
                            <div className="text-[0.85rem] font-semibold text-gray-900 hover:text-blue-600">
                              {item.title}
                            </div>
                            <p className="text-[0.7rem] text-gray-500 mt-0.5 leading-tight">
                              {item.description}
                            </p>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={link.href!}
                    className="hover:text-blue-600 transition-colors"
                  >
                    {link.name}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* Desktop CTA + Cart */}
          <div className="hidden lg:flex items-center space-x-3">
            <Link
              href="/cart"
              className="relative flex items-center justify-center p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ShoppingCart className="h-5 w-5 text-gray-700" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center rounded-full bg-blue-600 text-white text-[10px] font-bold">
                  {cart.length}
                </span>
              )}
            </Link>

            <Button
              asChild
              size="sm"
              className="font-semibold text-[0.8rem] tracking-tight"
            >
              <Link href="/jobs">Apply for a Job</Link>
            </Button>
          </div>

          {/* Mobile menu stays untouched — you can paste back when ready */}
          <div className="lg:hidden flex items-center">
            <Sheet
              open={isMobileMenuOpen}
              onOpenChange={setIsMobileMenuOpen}
            >
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <Menu className="h-6 w-6 text-gray-700" />  
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-3/4 max-w-sm p-0"
              >
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <Link
                    href="/"
                    className="shrink-0 hover:opacity-80 transition-opacity"
                  >
                    <Image
                      src="https://res.cloudinary.com/dirrncimm/image/upload/v1752703435/assets/AP_Logo_4_SVG_p7cqwy.svg"
                      alt="Accountant Pathfinder Logo"
                      width={130}
                      height={30}
                      className="h-9 w-auto"
                      priority
                    />
                  </Link>
                  <Button
                    variant="ghost"
                    className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <X className="h-6 w-6 text-gray-700" />
                  </Button>
                </div>
                {/* Mobile navigation items would go here */}
              </SheetContent>
            </Sheet>
            
        </div>
        </div>
      </div>
    </header>
  );
}
