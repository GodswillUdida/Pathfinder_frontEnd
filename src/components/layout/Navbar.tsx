"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  const pathname = usePathname();

  if (!user) return null;

  // Get first letter of name for fallback avatar
  const initial = user.name ? user.name[0].toUpperCase() : "?";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full hover:bg-gray-100 p-1 transition-colors">
          <Avatar className="h-9 w-9 border-2 border-blue-100">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold">
              {initial}
            </AvatarFallback>
          </Avatar>
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 rounded-xl shadow-lg border-gray-200"
      >
        <div className="px-2 py-1.5 mb-1 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {user.name}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {user.email || "Administrator"}
          </p>
        </div>
        <DropdownMenuItem asChild className="rounded-lg hover:bg-blue-50">
          <Link href="/admin/programs" className="w-full">
            Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="rounded-lg hover:bg-blue-50">
          <Link href="/admin/courses" className="w-full">
            Courses
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="rounded-lg hover:bg-blue-50">
          <Link href="/admin/enrollments" className="w-full">
            Enrollments
          </Link>
        </DropdownMenuItem>
        <div className="border-t border-gray-100 mt-1 pt-1">
          <DropdownMenuItem
            onClick={logout}
            className="rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <LogOutIcon className="mr-2 h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function Navbar() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const pathname = usePathname();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check if link is active
  const isLinkActive = (href: string) => {
    if (href === "/") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  // Check if dropdown contains active link
  const isDropdownActive = (dropdown?: Array<{ href: string }>) => {
    if (!dropdown) return false;
    return dropdown.some((item) => isLinkActive(item.href));
  };

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  // Filter out Courses from main nav for desktop
  const desktopNavLinks = navLinks.filter(
    (link: NavItem) => link.name !== "Courses",
  );
  const coursesLink = navLinks.find((link: NavItem) => link.name === "Courses");

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100/50"
          : "bg-white/90 backdrop-blur-sm shadow-sm border-b border-gray-100",
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 group relative">
            <Image
              src="https://res.cloudinary.com/dirrncimm/image/upload/v1752703435/assets/AP_Logo_4_SVG_p7cqwy.svg"
              alt="Accountant Pathfinder"
              width={140}
              height={32}
              className="h-8 w-auto transition-all duration-300 group-hover:scale-105"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {desktopNavLinks.map((link: NavItem) => {
              const isActive = link.href ? isLinkActive(link.href) : false;
              const isDropdownActiveFlag = isDropdownActive(link.dropdown);

              return (
                <div key={link.name} className="relative">
                  {link.dropdown ? (
                    <div
                      onMouseEnter={() => setActiveDropdown(link.name)}
                      onMouseLeave={() => setActiveDropdown(null)}
                      className="group"
                    >
                      <button
                        className={cn(
                          "flex items-center gap-1.5 text-sm font-semibold transition-all py-2 relative",
                          isDropdownActiveFlag
                            ? "text-blue-600"
                            : "text-gray-700 hover:text-blue-600",
                        )}
                      >
                        {link.name}
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 transition-all duration-200",
                            (activeDropdown === link.name ||
                              isDropdownActiveFlag) &&
                              "rotate-180 text-blue-600",
                          )}
                        />

                        {/* Active indicator */}
                        {isDropdownActiveFlag && (
                          <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                        )}
                      </button>

                      {activeDropdown === link.name && (
                        <div className="absolute left-0 top-full mt-2 w-80 rounded-xl bg-white shadow-2xl ring-1 ring-gray-200/80 p-2 animate-in fade-in slide-in-from-top-2 duration-200">
                          {link.dropdown.map((item) => {
                            const isItemActive = isLinkActive(item.href);
                            return (
                              <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                  "block rounded-lg p-3 transition-all duration-150 group/item",
                                  isItemActive
                                    ? "bg-blue-50 border-l-4 border-blue-600"
                                    : "hover:bg-gray-50",
                                )}
                              >
                                <div
                                  className={cn(
                                    "text-sm font-semibold transition-colors",
                                    isItemActive
                                      ? "text-blue-700"
                                      : "text-gray-900 group-hover/item:text-blue-600",
                                  )}
                                >
                                  {item.title}
                                  {isItemActive && (
                                    <span className="ml-2 w-1.5 h-1.5 rounded-full bg-blue-600 inline-block" />
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                  {item.description}
                                </p>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={link.href!}
                      className={cn(
                        "text-sm font-semibold transition-colors py-2 relative",
                        isActive
                          ? "text-blue-600"
                          : "text-gray-700 hover:text-blue-600",
                      )}
                    >
                      {link.name}
                      {/* Active underline */}
                      {isActive && (
                        <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                      )}
                    </Link>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Browse Programs Button */}
            {coursesLink?.dropdown && (
              <div
                onMouseEnter={() => setActiveDropdown("Programs")}
                onMouseLeave={() => setActiveDropdown(null)}
                className="relative"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "font-semibold text-sm transition-all duration-200 group",
                    activeDropdown === "Programs"
                      ? "border-blue-600 text-blue-600 bg-blue-50"
                      : "border-gray-300 hover:border-blue-600 hover:text-blue-600",
                  )}
                >
                  Browse Programs
                  <ChevronDown
                    className={cn(
                      "ml-1.5 h-4 w-4 transition-transform duration-200",
                      activeDropdown === "Programs" && "rotate-180",
                    )}
                  />
                </Button>

                {activeDropdown === "Programs" && (
                  <div className="absolute right-0 top-full mt-2 w-80 rounded-xl bg-white shadow-2xl ring-1 ring-gray-200/80 p-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    {coursesLink.dropdown.map((item) => {
                      const isItemActive = isLinkActive(item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "block rounded-lg p-3 transition-all duration-150 group/item",
                            isItemActive
                              ? "bg-blue-50 border-l-4 border-blue-600"
                              : "hover:bg-gray-50",
                          )}
                        >
                          <div
                            className={cn(
                              "text-sm font-semibold transition-colors",
                              isItemActive
                                ? "text-blue-700"
                                : "text-gray-900 group-hover/item:text-blue-600",
                            )}
                          >
                            {item.title}
                            {isItemActive && (
                              <span className="ml-2 w-1.5 h-1.5 rounded-full bg-blue-600 inline-block" />
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                            {item.description}
                          </p>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Auth Buttons */}
            {user ? (
              <UserMenu />
            ) : (
              <Button
                size="sm"
                className="font-semibold text-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-sm hover:shadow transition-all duration-200"
                asChild
              >
                <Link href="/auth/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  Admin Login
                </Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-gray-100 transition-colors rounded-lg"
              >
                <Menu className="h-6 w-6 text-gray-700" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>

            <SheetContent
              side="right"
              className="w-full max-w-sm p-0 border-l border-gray-200"
            >
              {/* Accessible Title (Hidden) */}
              <VisuallyHidden>
                <SheetTitle>Navigation Menu</SheetTitle>
              </VisuallyHidden>

              {/* Mobile Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <Link href="/" onClick={handleLinkClick} className="shrink-0">
                  <Image
                    src="https://res.cloudinary.com/dirrncimm/image/upload/v1752703435/assets/AP_Logo_4_SVG_p7cqwy.svg"
                    alt="Accountant Pathfinder"
                    width={120}
                    height={28}
                    className="h-7 w-auto"
                  />
                </Link>
                <SheetClose asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-gray-100 transition-colors rounded-full"
                  >
                    <X className="h-5 w-5 text-gray-700" />
                    <span className="sr-only">Close menu</span>
                  </Button>
                </SheetClose>
              </div>

              <div className="flex flex-col h-[calc(100vh-5rem)] overflow-y-auto">
                <nav className="flex-1 py-2">
                  {navLinks.map((link: NavItem) => {
                    const isActive = link.href
                      ? isLinkActive(link.href)
                      : false;
                    const isDropdownActiveFlag = isDropdownActive(
                      link.dropdown,
                    );

                    return (
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
                              <AccordionTrigger
                                className={cn(
                                  "px-6 py-4 text-base font-semibold transition-colors",
                                  isDropdownActiveFlag
                                    ? "text-blue-600 bg-blue-50/50"
                                    : "text-gray-900 hover:text-blue-600",
                                )}
                              >
                                <div className="flex items-center gap-2">
                                  {link.name}
                                  {isDropdownActiveFlag && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                                  )}
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="bg-gray-50/50">
                                <div className="py-2">
                                  {link.dropdown.map((item) => {
                                    const isItemActive = isLinkActive(
                                      item.href,
                                    );
                                    return (
                                      <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                          "block px-6 py-3 text-sm transition-colors group",
                                          isItemActive
                                            ? "text-blue-700 bg-blue-50 border-l-4 border-blue-600"
                                            : "text-gray-700 hover:text-blue-600 hover:bg-gray-100/50",
                                        )}
                                        onClick={handleLinkClick}
                                      >
                                        <div className="flex items-center justify-between">
                                          <div className="font-semibold">
                                            {item.title}
                                          </div>
                                          {isItemActive && (
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                                          )}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                          {item.description}
                                        </p>
                                      </Link>
                                    );
                                  })}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        ) : (
                          <Link
                            href={link.href!}
                            className={cn(
                              "block px-6 py-4 text-base font-semibold transition-colors border-b border-gray-100 relative",
                              isActive
                                ? "text-blue-600 bg-blue-50/50"
                                : "text-gray-900 hover:text-blue-600 hover:bg-gray-50",
                            )}
                            onClick={handleLinkClick}
                          >
                            <div className="flex items-center gap-2">
                              {link.name}
                              {isActive && (
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                              )}
                            </div>
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </nav>

                {/* Mobile Actions */}
                <div className="p-4 border-t border-gray-100 space-y-3 bg-gradient-to-t from-gray-50 to-white">
                  {user ? (
                    <div className="px-3 py-2 bg-gray-100 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold">
                            {user.name ? user.name[0].toUpperCase() : "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-500">Administrator</p>
                        </div>
                      </div>
                    </div>
                  ) : (
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
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
