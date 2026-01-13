"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ChevronDown, User, LogIn, LogOutIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetTitle,
} from "@/components/ui/sheet";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { navLinks } from "@/data/navData";
import { useAuthStore } from "@/store/userStore";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";

interface NavItem {
  name: string;
  href?: string;
  dropdown?: Array<{
    href: string;
    title: string;
    description: string;
  }>;
}

export function UserMenu() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  if (!user) return null;

  // Get first letter of name for fallback avatar
  const initial = user.name ? user.name[0].toUpperCase() : "?";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        {user.avatar ? (
          <Image
            src={user.avatar}
            alt={user.name}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-medium">
            {initial}
          </div>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem className="font-semibold">{user.name}</DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/admin/programs">Dashboard</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/admin/courses">Courses</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/admin/enrollments">Enrollments</Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={logout}>
          <LogOutIcon className="mr-2 h-6 w-6" /> Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function Navbar() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const user = useAuthStore((state) => state.user);

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  // Filter out Courses from main nav for desktop
  const desktopNavLinks = navLinks.filter(
    (link: NavItem) => link.name !== "Courses"
  );
  const coursesLink = navLinks.find((link: NavItem) => link.name === "Courses");

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex-shrink-0 hover:opacity-80 transition-opacity duration-200"
          >
            <Image
              src="https://res.cloudinary.com/dirrncimm/image/upload/v1752703435/assets/AP_Logo_4_SVG_p7cqwy.svg"
              alt="Accountant Pathfinder"
              width={140}
              height={32}
              className="h-8 w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {desktopNavLinks.map((link: NavItem) => (
              <div key={link.name} className="relative">
                {link.dropdown ? (
                  <div
                    onMouseEnter={() => setActiveDropdown(link.name)}
                    onMouseLeave={() => setActiveDropdown(null)}
                    className="group"
                  >
                    <button className="flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors py-2">
                      {link.name}
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform duration-200",
                          activeDropdown === link.name && "rotate-180"
                        )}
                      />
                    </button>

                    {activeDropdown === link.name && (
                      <div className="absolute left-0 top-full mt-2 w-80 rounded-xl bg-white shadow-2xl ring-1 ring-gray-100 p-2 animate-in fade-in slide-in-from-top-2 duration-200">
                        {link.dropdown.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="block rounded-lg p-3 hover:bg-gray-50 transition-all duration-150 group/item"
                          >
                            <div className="text-sm font-semibold text-gray-900 group-hover/item:text-blue-600 transition-colors">
                              {item.title}
                            </div>
                            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
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
                    className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    {link.name}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Browse Programs Button */}
            {coursesLink?.dropdown && (
              <div
                onMouseEnter={() => setActiveDropdown("Programs")}
                onMouseLeave={() => setActiveDropdown(null)}
                className="relative"
              >
                <Button
                  variant="outline"
                  className="font-semibold text-sm border-gray-300 hover:border-blue-600 hover:text-blue-600 transition-all duration-200"
                >
                  Browse Programs
                  <ChevronDown
                    className={cn(
                      "ml-1.5 h-4 w-4 transition-transform duration-200",
                      activeDropdown === "Programs" && "rotate-180"
                    )}
                  />
                </Button>

                {activeDropdown === "Programs" && (
                  <div className="absolute right-0 top-full mt-2 w-80 rounded-xl bg-white shadow-2xl ring-1 ring-gray-100 p-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    {coursesLink.dropdown.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="block rounded-lg p-3 hover:bg-gray-50 transition-all duration-150 group/item"
                      >
                        <div className="text-sm font-semibold text-gray-900 group-hover/item:text-blue-600 transition-colors">
                          {item.title}
                        </div>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                          {item.description}
                        </p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Auth Buttons */}

            {user ? <UserMenu /> : (
              <Button
                variant="ghost"
                size="sm"
                className="font-semibold text-sm bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-all duration-200"
                asChild
              >
                <Link href="/auth/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  Admin Login
                </Link>
              </Button>
            )}

            {/* <Button
              variant="ghost"
              size="sm"
              className="font-semibold text-sm bg-blue-600 hover:bg-blue-700 shadow-sm text-white hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
              asChild
            >
              <Link href="/auth/login">
                <LogIn className="mr-2 h-4 w-4" />
                Admin Login
              </Link>
            </Button> */}

            <Button
              size="sm"
              className="font-semibold text-sm bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow transition-all duration-200"
              asChild
            >
              {/* <Link href="/auth/register">
                <User className="mr-2 h-4 w-4" />
                Get Started
              </Link> */}
            </Button>
          </div>

          {/* Mobile Menu Trigger */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-gray-100 transition-colors"
              >
                <Menu className="h-6 w-6 text-gray-700" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>

            <SheetContent side="right" className="w-full max-w-sm p-0">
              {/* Accessible Title (Hidden) */}
              <VisuallyHidden>
                <SheetTitle>Navigation Menu</SheetTitle>
              </VisuallyHidden>

              {/* Mobile Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <Link
                  href="/"
                  onClick={handleLinkClick}
                  className="shrink-0"
                >
                  <Image
                    src="https://res.cloudinary.com/dirrncimm/image/upload/v1752703435/assets/AP_Logo_4_SVG_p7cqwy.svg"
                    alt="Accountant Pathfinder"
                    width={120}
                    height={28}
                    className="h-7 w-auto"
                  />
                </Link>
                {/* <SheetClose asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-gray-100 transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-700" />
                    <span className="sr-only">Close menu</span>
                  </Button>
                </SheetClose> */}
              </div>

              {/* Mobile Navigation */}
              <div className="flex flex-col h-[calc(100vh-5rem)] overflow-y-auto">
                <nav className="flex-1 py-4">
                  {navLinks.map((link: NavItem) => (
                    <div key={link.name}>
                      {link.dropdown ? (
                        <Accordion
                          type="single"
                          collapsible
                          className="border-b border-gray-100"
                        >
                          <AccordionItem
                            value={link.name}
                            className="border-none"
                          >
                            <AccordionTrigger className="px-6 py-4 text-base font-medium text-gray-900 hover:text-blue-600 hover:no-underline transition-colors">
                              {link.name}
                            </AccordionTrigger>
                            <AccordionContent className="bg-gray-50/50">
                              <div className="py-2">
                                {link.dropdown.map((item) => (
                                  <Link
                                    key={item.href}
                                    href={item.href}
                                    className="block px-6 py-3 text-sm text-gray-700 hover:text-blue-600 hover:bg-gray-100/50 transition-colors"
                                    onClick={handleLinkClick}
                                  >
                                    <div className="font-medium">
                                      {item.title}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                      {item.description}
                                    </p>
                                  </Link>
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      ) : (
                        <Link
                          href={link.href!}
                          className="block px-6 py-4 text-base font-medium text-gray-900 hover:text-blue-600 hover:bg-gray-50 transition-colors border-b border-gray-100"
                          onClick={handleLinkClick}
                        >
                          {link.name}
                        </Link>
                      )}
                    </div>
                  ))}
                </nav>

                {/* Mobile Actions */}
                <div className="p-4 border-t border-gray-100 space-y-3 bg-gray-50/50">
                  <Button
                    asChild
                    variant="outline"
                    className="w-full font-semibold text-sm border-gray-300 hover:border-blue-600 hover:text-blue-600 transition-all"
                  >
                    <Link href="/auth/login" onClick={handleLinkClick}>
                      <LogIn className="mr-2 h-4 w-4" />
                      Login
                    </Link>
                  </Button>

                  <Button
                    asChild
                    className="w-full font-semibold text-sm bg-blue-600 hover:bg-blue-700 shadow-sm"
                  >
                    <Link href="/auth/register" onClick={handleLinkClick}>
                      <User className="mr-2 h-4 w-4" />
                      Get Started
                    </Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
