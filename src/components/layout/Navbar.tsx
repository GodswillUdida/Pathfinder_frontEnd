"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ChevronDown, ShoppingCart } from "lucide-react"; // Added ChevronRight for mobile submenus
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"; // Added for mobile dropdowns
import { cn } from "@/lib/utils";
import { navLinks } from "@/data/navData";

// Define types for navLinks (assuming structure; adjust if needed)
interface NavItem {
  name: string;
  href?: string;
  dropdown?: Array<{
    href: string;
    title: string;
    description: string;
  }>;
}

export default function Navbar() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Mock cart data – replace with real store/context/zustand later for scalability
  const cart: [] = []; // Typed as any[] for now; use proper CartItem type in production

  // Function to close mobile menu on navigation
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between font-(--font-manrope)">
          {" "}
          {/* Fixed font class */}
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
            {navLinks.map((link: NavItem) => (
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
                      <div className="absolute left-0 mt-2 w-80 rounded-lg bg-white shadow-xl ring-1 ring-black/5 p-3 grid grid-cols-1 gap-2 z-50">
                        {" "}
                        {/* Added z-50 for layering */}
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
          {/* Desktop CTA + Cart + Auth */}
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

            {/* Added Sign In / Sign Up */}
            <Button
              variant="outline"
              size="sm"
              className="font-semibold text-[0.8rem] tracking-tight"
              asChild
            >
              <Link href="/auth/login">Login</Link>
            </Button>
            <Button
              size="sm"
              className="font-semibold text-[0.8rem] tracking-tight"
              asChild
            >
              <Link href="/auth/register">Register</Link>
            </Button>
            <Button
              asChild
              size="sm"
              className="font-semibold text-[0.8rem] tracking-tight"
            >
              <Link href="/jobs">Apply for a Job</Link>
            </Button>
          </div>
          {/* Mobile Trigger */}
          <div className="lg:hidden flex items-center">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  className="p-2 rounded-md hover:bg-gray-100 transition-colors mt-2"
                >
                  <Menu className="h-8 w-8 text-gray-700" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-3/4 max-w-sm p-0">
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
                  {/* <Button
                    variant="ghost"
                    className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                    onClick={closeMobileMenu}
                  >
                    <X className="h-6 w-6 text-gray-700" />
                  </Button> */}
                </div>

                {/* Mobile Navigation */}
                <nav className="flex flex-col divide-y divide-gray-200">
                  {navLinks.map((link: NavItem) => (
                    <div key={link.name}>
                      {link.dropdown ? (
                        <Accordion type="single" collapsible className="w-full">
                          <AccordionItem
                            value={link.name}
                            className="border-none"
                          >
                            <AccordionTrigger className="px-4 py-3 text-gray-800 hover:text-blue-600 flex items-center justify-between">
                              {link.name}
                            </AccordionTrigger>
                            <AccordionContent className="bg-gray-50">
                              {link.dropdown.map((item) => (
                                <Link
                                  key={item.href}
                                  href={item.href}
                                  className="block px-8 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-colors"
                                  onClick={closeMobileMenu}
                                >
                                  {item.title}
                                </Link>
                              ))}
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      ) : (
                        <Link
                          href={link.href!}
                          className="block px-4 py-3 text-gray-800 hover:text-blue-600 transition-colors"
                          onClick={closeMobileMenu}
                        >
                          {link.name}
                        </Link>
                      )}
                    </div>
                  ))}
                </nav>

                {/* Mobile Cart + Auth + CTA */}
                <div className="p-4 border-t border-gray-200 space-y-3">
                  <Link
                    href="/cart"
                    className="flex items-center gap-2 py-3 text-gray-800 hover:text-blue-600 transition-colors"
                    onClick={closeMobileMenu}
                  >
                    <ShoppingCart className="h-5 w-5" />
                    Cart {cart.length > 0 && `(${cart.length})`}
                  </Link>

                  <Button
                    asChild
                    className="w-full font-semibold text-[0.8rem] tracking-tight"
                  >
                    <Link href="/auth/login" onClick={closeMobileMenu}>
                      Sign In
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    asChild
                    className="w-full font-semibold text-[0.8rem] tracking-tight"
                  >
                    <Link href="/auth/register" onClick={closeMobileMenu}>
                      Sign Up
                    </Link>
                  </Button>
                  <Button
                    asChild
                    className="w-full font-semibold text-[0.8rem] tracking-tight mt-2"
                  >
                    <Link href="/jobs" onClick={closeMobileMenu}>
                      Apply for a Job
                    </Link>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
