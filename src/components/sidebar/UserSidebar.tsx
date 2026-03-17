"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { USER_NAV } from "@/types/admin";
import { useAuthStore } from "@/store/authStore";

export default function StudentSidebar() {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const { logout } = useAuthStore();
  const router = useRouter();

  if (!user || user.role !== "student") return null;

  const handleLogout = async () => {
    try {
      logout(); // clears cookies + store
      router.push("/auth/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <aside className="w-64 min-h-screen bg-gray-900 text-gray-100 p-4">
      <h2 className="text-xl font-bold mb-6">Student Panel</h2>
      <nav className="space-y-2">
        {USER_NAV.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={cn(
              "block px-4 py-2 rounded-md hover:bg-gray-800",
              pathname === item.path && "bg-gray-800"
            )}
          >
            {item.name}
          </Link>
        ))}

        <button
          onClick={handleLogout}
          className="mt-4 w-full text-left px-4 py-2 rounded-md bg-red-600 hover:bg-red-700"
        >
          Logout
        </button>
      </nav>
    </aside>
  );
}
