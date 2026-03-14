"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Globe, Bell, User, MessageSquare, LogIn, LogOut } from "lucide-react";
import { useAuth } from "@/app/AuthContext";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { user, loading, signOut } = useAuth();

  const fullName: string = user?.user_metadata?.full_name ?? user?.email ?? "Kullanıcı";

  const username: string = user?.user_metadata?.username ?? "me";
  const initials = fullName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const navLinks = [
    { to: "/", label: "Ana Sayfa" },
    { to: "/projeler", label: "Projeler" },
    { to: "/yetenekler", label: "Keşfet" },
    ...(user ? [{ to: "/dashboard", label: "Dashboard" }] : []),
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-white/[0.07] backdrop-blur-xl bg-[#262836]/85">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7b7fc8] to-[#9b7fb8] flex items-center justify-center shadow-md shadow-[#7b7fc8]/15">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg text-[#e0e2ec] tracking-tight">
              CodeBrate
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                href={link.to}
                className={`px-4 py-2 rounded-xl transition-all duration-200 ${
                  pathname === link.to
                    ? "bg-[#7b7fc8]/12 text-[#a5a8e0]"
                    : "text-[#8a8da8] hover:bg-white/[0.05] hover:text-[#c5c8d8]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Masaüstü sağ alan */}
          <div className="hidden md:flex items-center gap-3">
            {!loading && user ? (
              /* ── Giriş yapılmış ── */
              <>
                <Link
                  href="/mesajlar"
                  className="relative p-2 rounded-xl hover:bg-white/[0.05] transition-colors"
                >
                  <MessageSquare className="w-5 h-5 text-[#8a8da8]" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#6366a8] rounded-full" />
                </Link>
                <button className="relative p-2 rounded-xl hover:bg-white/[0.05] transition-colors">
                  <Bell className="w-5 h-5 text-[#8a8da8]" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#e07070] rounded-full" />
                </button>
                <Link
                  href={`/profil/${username}`}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-white/[0.05] transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7b7fc8] to-[#9b7fb8] flex items-center justify-center shadow-sm">
                    <span className="text-white text-xs font-semibold">{initials}</span>
                  </div>
                  <span className="text-[#b0b3c8]">{fullName.split(" ")[0]}</span>
                </Link>
                <button
                  onClick={signOut}
                  className="px-4 py-2 rounded-xl border border-white/[0.08] text-[#c5c8d8] hover:bg-white/[0.05] transition-all flex items-center gap-1.5"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Çıkış</span>
                </button>
              </>
            ) : !loading ? (
              /* ── Giriş yapılmamış ── */
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-xl border border-white/[0.08] text-[#c5c8d8] hover:bg-white/[0.05] transition-all flex items-center gap-1.5"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Giriş Yap</span>
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-[#6366a8] text-white rounded-xl hover:bg-[#7074b8] transition-all shadow-md shadow-[#6366a8]/20"
                >
                  Kayıt Ol
                </Link>
              </>
            ) : null}
          </div>

          <button
            className="md:hidden p-2 rounded-xl hover:bg-white/[0.05]"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <X className="w-6 h-6 text-[#c5c8d8]" />
            ) : (
              <Menu className="w-6 h-6 text-[#c5c8d8]" />
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-white/[0.07] bg-[#262836]">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                href={link.to}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-2.5 rounded-xl transition-colors ${
                  pathname === link.to
                    ? "bg-[#7b7fc8]/12 text-[#a5a8e0]"
                    : "text-[#8a8da8] hover:bg-white/[0.05]"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <hr className="my-2 border-white/[0.07]" />
            {!loading && user ? (
              /* ── Mobil: Giriş yapılmış ── */
              <>
                <Link
                  href={`/profil/${username}`}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-[#8a8da8] hover:bg-white/[0.05]"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#7b7fc8] to-[#9b7fb8] flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-semibold">{initials}</span>
                  </div>
                  {fullName}
                </Link>
                <Link
                  href="/mesajlar"
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-2.5 rounded-xl text-[#8a8da8] hover:bg-white/[0.05]"
                >
                  Mesajlar
                </Link>
                <button
                  onClick={() => { setMobileOpen(false); signOut(); }}
                  className="w-full text-left px-4 py-2.5 rounded-xl text-[#e07070] hover:bg-white/[0.05]"
                >
                  Çıkış Yap
                </button>
              </>
            ) : !loading ? (
              /* ── Mobil: Giriş yapılmamış ── */
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-2.5 rounded-xl text-[#8a8da8] hover:bg-white/[0.05] text-center"
                >
                  Giriş Yap
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-2.5 rounded-xl bg-[#6366a8] text-white text-center shadow-md shadow-[#6366a8]/20"
                >
                  Kayıt Ol
                </Link>
              </>
            ) : null}
          </div>
        </div>
      )}
    </nav>
  );
}
