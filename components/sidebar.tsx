"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Search,
  UserCircle,
  LogOut,
  Upload,
} from "lucide-react";
import type { User } from "@/lib/types";

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/profiles", label: "Profiles", icon: Users },
  { href: "/search", label: "Search", icon: Search },
];

export default function Sidebar({ user }: { user: User }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="fixed inset-y-0 left-0 w-56 bg-white border-r border-neutral-200 flex flex-col z-10">
      <div className="px-5 py-6">
        <span className="text-base font-bold text-neutral-900 tracking-tight">
          Insighta
        </span>
      </div>

      <nav className="flex-1 px-3 space-y-0.5">
        {navLinks.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-blue-50 text-blue-600"
                  : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
              }`}
            >
              <Icon size={16} strokeWidth={1.75} />
              {label}
            </Link>
          );
        })}
        {user.role === "admin" && (
          <Link
            href="/profiles/upload"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              pathname === "/profiles/upload"
                ? "bg-blue-50 text-blue-600"
                : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
            }`}
          >
            <Upload size={16} strokeWidth={1.75} />
            Upload CSV
          </Link>
        )}
      </nav>

      <div className="px-3 pb-4 space-y-0.5">
        <Link
          href="/account"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            pathname === "/account"
              ? "bg-blue-50 text-blue-600"
              : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
          }`}
        >
          <UserCircle size={16} strokeWidth={1.75} />
          Account
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
        >
          <LogOut size={16} strokeWidth={1.75} />
          Log out
        </button>

        <div className="flex items-center gap-3 px-3 pt-3 mt-2 border-t border-neutral-100">
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.username}
              className="w-7 h-7 rounded-full object-cover"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-neutral-200 flex items-center justify-center text-xs font-medium text-neutral-600">
              {user.username[0]?.toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-xs font-medium text-neutral-900 truncate">
              {user.username}
            </p>
            <p className="text-xs text-neutral-400 capitalize">{user.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
