"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Globe, Bell, User, MessageSquare, LogIn, LogOut, CheckCheck } from "lucide-react";
import { useAuth } from "@/app/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";

type Notification = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
};

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, signOut } = useAuth();
  const supabase = createClient();

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

  // Dışarıya tıklandığında menüyü kapat
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Bildirimleri çek ve Realtime dinle
  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);
      
      if (error) {
        console.error("Bildirimler çekilirken hata:", error);
      }
      
      if (data) {
        setNotifications(data);
      }
    };

    fetchNotifications();

    const channel = supabase
      .channel("nav_notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        (payload) => {
          console.log("Yeni bildirim realtime'dan geldi:", payload);
          setNotifications((prev) => [payload.new as Notification, ...prev]);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        (payload) => {
          console.log("Bildirim güncellendi realtime:", payload);
          setNotifications((prev) =>
            prev.map((n) => (n.id === payload.new.id ? (payload.new as Notification) : n))
          );
        }
      )
      .subscribe((status) => {
        console.log("Realtime abonelik durumu:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, supabase]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.is_read) {
      await supabase.from("notifications").update({ is_read: true }).eq("id", notif.id);
      setNotifications((prev) => prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n)));
    }
    setShowNotifications(false);
    if (notif.link) router.push(notif.link);
  };

  const markAllAsRead = async () => {
    if (!user || unreadCount === 0) return;
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id).eq("is_read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

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
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className={`relative p-2 rounded-xl transition-colors ${
                      showNotifications ? "bg-white/[0.08]" : "hover:bg-white/[0.05]"
                    }`}
                  >
                    <Bell className="w-5 h-5 text-[#8a8da8]" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#e07070] rounded-full border-2 border-[#262836]" />
                    )}
                  </button>

                  <AnimatePresence>
                    {showNotifications && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-3 w-80 bg-[#2a2c3e] border border-white/[0.09] rounded-2xl shadow-2xl shadow-black/40 overflow-hidden z-50"
                      >
                        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-[#2a2c3e]/90">
                          <h3 className="text-[#e0e2ec] font-medium text-sm">Bildirimler</h3>
                          {unreadCount > 0 && (
                            <button
                              onClick={markAllAsRead}
                              className="text-xs text-[#7b7fc8] hover:text-[#9b7fb8] transition-colors flex items-center gap-1"
                            >
                              <CheckCheck className="w-3.5 h-3.5" /> Tümünü Okundu İşaretle
                            </button>
                          )}
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="px-4 py-8 text-center text-[#6d7090] text-sm">
                              Henüz bildiriminiz yok.
                            </div>
                          ) : (
                            <div className="divide-y divide-white/[0.04]">
                              {notifications.map((notif) => (
                                <button
                                  key={notif.id}
                                  onClick={() => handleNotificationClick(notif)}
                                  className={`w-full text-left px-4 py-3 hover:bg-white/[0.03] transition-colors ${
                                    notif.is_read ? "opacity-75" : "bg-[#7b7fc8]/[0.03]"
                                  }`}
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="flex-1 min-w-0">
                                      <p className={`text-sm mb-0.5 ${notif.is_read ? 'text-[#b0b3c8]' : 'text-[#e0e2ec] font-medium'}`}>
                                        {notif.title}
                                      </p>
                                      <p className="text-xs text-[#7d809e] line-clamp-2">{notif.message}</p>
                                      <span className="text-[10px] text-[#5a5d7a] mt-1.5 block">
                                        {new Date(notif.created_at).toLocaleDateString("tr-TR")} {new Date(notif.created_at).toLocaleTimeString("tr-TR", {hour: '2-digit', minute:'2-digit'})}
                                      </span>
                                    </div>
                                    {!notif.is_read && (
                                      <span className="w-2 h-2 rounded-full bg-[#7b7fc8] flex-shrink-0 mt-1.5" />
                                    )}
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
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
