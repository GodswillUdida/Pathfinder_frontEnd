"use client";

import { memo, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Search, LogOut, ChevronDown, Menu, X, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

function Topbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    if (isProfileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isProfileOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    if (isMobileMenuOpen) {
      const id = window.setTimeout(() => setIsMobileMenuOpen(false), 0);
      return () => clearTimeout(id);
    }
  }, [pathname, isMobileMenuOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      setIsProfileOpen(false);
      router.push("/auth/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur-md supports-backdrop-filter:bg-white/80">
      <div className="flex h-16 items-center justify-between px-6 lg:px-10">
        
        {/* Left Section */}
        <div className="flex items-center gap-8">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/30">
              <span className="text-white font-bold text-xl tracking-tighter">AP</span>
            </div>
            <div>
              <h1 className="font-semibold text-2xl tracking-tighter text-gray-900">Pathfinder</h1>
              <p className="text-[10px] text-gray-400 -mt-1 font-mono">DASHBOARD</p>
            </div>
          </div>
        </div>

        {/* Center - Search (Desktop) */}
        <div className="hidden md:block flex-1 max-w-xl mx-8">
          <div className="relative group">
            <div className={cn(
              "flex items-center bg-gray-100 border border-gray-200 rounded-2xl px-4 h-11 transition-all duration-200",
              isSearchFocused && "bg-white border-gray-300 shadow-sm ring-1 ring-gray-300"
            )}>
              <Search className="w-4 h-4 text-gray-400 mr-3" />
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                placeholder="Search programs, courses, enrollments..."
                className="flex-1 bg-transparent outline-none text-sm placeholder:text-gray-400"
              />
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Search Button (Mobile) */}
          <button 
            className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            aria-label="Search"
          >
            <Search size={20} />
          </button>

          {/* Notifications */}
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors relative">
            <Bell size={20} />
            <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></div>
          </button>

          {/* User Profile */}
          {user ? (
            <div ref={profileRef} className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 pl-3 pr-2 py-1.5 hover:bg-gray-100 rounded-2xl transition-all group"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-semibold shadow-md">
                  {getInitials(user.name)}
                </div>

                <div className="hidden md:block text-left pr-1">
                  <p className="text-sm font-medium text-gray-900 leading-none mb-0.5">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500 font-mono">{user.email.split("@")[0]}</p>
                </div>

                <ChevronDown
                  className={cn(
                    "w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-transform",
                    isProfileOpen && "rotate-180"
                  )}
                />
              </button>

              {/* Profile Dropdown - Stripe-style */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-3xl shadow-2xl border border-gray-100 py-2 text-sm z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-5 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-semibold text-lg shadow">
                        {getInitials(user.name)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="py-2">
                    <Link
                      href="/settings"
                      className="block px-5 py-2.5 hover:bg-gray-50 text-gray-700 transition-colors"
                    >
                      Settings
                    </Link>
                    <Link
                      href="/billing"
                      className="block px-5 py-2.5 hover:bg-gray-50 text-gray-700 transition-colors"
                    >
                      Billing &amp; Plans
                    </Link>
                    <Link
                      href="/team"
                      className="block px-5 py-2.5 hover:bg-gray-50 text-gray-700 transition-colors"
                    >
                      Team members
                    </Link>
                  </div>

                  <div className="border-t border-gray-100 pt-2 mt-1">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-5 py-2.5 text-red-600 hover:bg-red-50 transition-colors rounded-b-3xl"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link 
              href="/auth/login"
              className="px-5 py-2 text-sm font-semibold text-white bg-black hover:bg-gray-900 rounded-2xl transition-all active:scale-[0.985]"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white px-6 py-6">
          <div className="space-y-1">
            <Link href="/dashboard" className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-2xl">
              Dashboard
            </Link>
            <Link href="/payments" className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-2xl">
              Payments
            </Link>
            <Link href="/customers" className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-2xl">
              Customers
            </Link>
            <Link href="/invoices" className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-2xl">
              Invoices
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export default memo(Topbar);