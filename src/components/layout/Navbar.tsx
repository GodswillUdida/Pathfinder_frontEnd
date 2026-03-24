"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ChevronDown, ShoppingCart, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

import { navLinks } from "@/data/navData";
import { useAuthStore } from "@/store/authStore";
import { useCart } from "@/store/cart.store";

// ================= USER MENU =================
function UserMenu() {
  const { user, logout } = useAuthStore();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hydrated = useAuthStore((s) => s.hydrated);

  if (!user) return null;

  const initial = user.name?.[0]?.toUpperCase() || "?";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2">
          <div className="relative">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>{initial}</AvatarFallback>
            </Avatar>
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-green-500 rounded-full border border-white" />
          </div>
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-2 border-b">
          <p className="text-sm font-semibold">{user.name}</p>
          <p className="text-xs text-gray-500">{user.email}</p>
        </div>

        <DropdownMenuItem asChild>
          <Link href="/dashboard">Dashboard</Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/dashboard/courses">My Courses</Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/cart">Cart</Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/profile">Profile</Link>
        </DropdownMenuItem>

        {user.role === "admin" && (
          <DropdownMenuItem asChild>
            <Link href="/admin/dashboard">Admin</Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem onClick={logout} className="text-red-600">
          <LogOut className="mr-2 h-4 w-4" /> Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ================= NAVBAR =================
export default function Navbar() {
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // const { isAuthenticated } = useAuthStore();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hydrated = useAuthStore((s) => s.hydrated);
  const cartItems = useCart((s) => s.items);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (href: string) => {
    if (href === "/") return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition",
        isScrolled ? "bg-white/95 backdrop-blur shadow" : "bg-white"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 flex h-16 items-center justify-between">
        {/* LOGO */}
        <Link href="/">
          <Image
            src="https://res.cloudinary.com/dirrncimm/image/upload/v1752703435/assets/AP_Logo_4_SVG_p7cqwy.svg"
            alt="Logo"
            width={120}
            height={30}
          />
        </Link>

        {/* NAV */}
        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map((link: any) => (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "text-sm font-semibold hover:underline hover:underline-offset-8 hover:decoration-2",
                isActive(link.href)
                  ? "text-blue-600 underline underline-offset-8 decoration-2"
                  : "text-gray-700 hover:text-blue-600"
              )}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* RIGHT */}
        <div className="hidden lg:flex items-center gap-8">
          {/* SEARCH */}
          {/* <input
            placeholder="Search courses..."
            className="w-60 px-3 py-1.5 border rounded-md text-sm"
          /> */}

          {/* CART */}
          <Link href="/cart" className="relative transition duration-300">
            <ShoppingCart className="h-6 w-6" />
            {cartItems.length > 0 && (
              <span className="absolute -top-2 -right-2 text-xs bg-blue-600 text-white px-1 rounded-full">
                {cartItems.length}
              </span>
            )}
          </Link>

          {/* AUTH */}
          {isAuthenticated ? (
            <UserMenu />
          ) : (
            <div className="flex gap-2">
              <Button
                className={cn(
                  "sticky top-0 z-50 w-3/4 transition delay-100 duration-300 ease-in-out hover:-translate-y-1",
                  isScrolled
                    ? "bg-[blue]/95 text-white backdrop-blur shadow"
                    : "bg-blue-500"
                )}
                // variant="ghost"
                asChild
              >
                <Link href="/auth/login">Login</Link>
              </Button>
              <Button
                className={cn(
                  "sticky top-0 z-50 w-3/4 transition delay-100 duration-300 ease-in-out hover:-translate-y-1",
                  isScrolled
                    ? "bg-[blue]/95 text-white backdrop-blur shadow"
                    : "bg-blue-500"
                )}
                asChild
              >
                <Link href="/auth/register">Get Started</Link>
              </Button>
            </div>
          )}
        </div>

        {/* MOBILE */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon">
              <Menu />
            </Button>
          </SheetTrigger>

          <SheetContent side="right" className="w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold">Menu</span>
              <SheetClose asChild>
                <Button variant="ghost" size="icon">
                  <X />
                </Button>
              </SheetClose>
            </div>

            <nav className="flex flex-col gap-4">
              {navLinks.map((link: any) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            <div className="mt-6 flex flex-col gap-3">
              <Link href="/cart">
                <Button className="w-full">Cart ({cartItems.length})</Button>
              </Link>

              {isAuthenticated ? (
                <Button onClick={() => useAuthStore.getState().logout()}>
                  Logout
                </Button>
              ) : (
                <>
                  <Link href="/auth/login">
                    <Button variant="outline" className="w-full">
                      Login
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button className="w-full">Sign Up</Button>
                  </Link>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
