"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Globe, Mail, Lock, Eye, EyeOff, ArrowRight, User } from "lucide-react";
import { motion } from "motion/react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    let emailToLogin = email;

    if (!email.includes("@")) {
      const { data, error: profileError } = await supabase
        .from("profiles")
        .select("email")
        .eq("username", email)
        .single();

      if (profileError || !data) {
        setError("Bu kullanıcı adı ile bir hesap bulunamadı.");
        setLoading(false);
        return;
      }
      emailToLogin = data.email;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: emailToLogin,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-[#262836] flex">
      {/* ── Sol: Marka Paneli ── */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[520px] flex-col justify-between p-10 relative overflow-hidden bg-gradient-to-br from-[#2e3044] to-[#262836] border-r border-white/[0.06]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#7b7fc8]/[0.06] rounded-full blur-3xl" />
          <div className="absolute -bottom-48 -right-24 w-[500px] h-[500px] bg-[#9b7fb8]/[0.05] rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-[#6366a8]/[0.04] rounded-full blur-2xl" />
        </div>

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7b7fc8] to-[#9b7fb8] flex items-center justify-center shadow-lg shadow-[#7b7fc8]/20">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl text-[#e0e2ec] tracking-tight">
              CodeBrate
            </span>
          </Link>
        </div>

        <div className="relative z-10 space-y-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl text-[#e0e2ec] leading-snug"
          >
            Fikirlerinizi güvende tutun,
            <br />
            <span className="text-[#a5a8e0]">doğru ekibi bulun.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-[#7d809e] leading-relaxed max-w-sm"
          >
            Küresel üniversite öğrencileriyle proje ortaklığı kurun. Vitrin ve
            Kasa sistemiyle fikirlerinizi koruyarak işbirliği yapın.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex gap-8 pt-4"
          >
            {[
              { value: "12K+", label: "Öğrenci" },
              { value: "3.4K", label: "Proje" },
              { value: "89", label: "Ülke" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl text-[#a5a8e0]">{stat.value}</p>
                <p className="text-sm text-[#6d7090] mt-0.5">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="relative z-10">
          <p className="text-xs text-[#6d7090]">
            &copy; 2026 CodeBrate. Tüm hakları saklıdır.
          </p>
        </div>
      </div>

      {/* ── Sağ: Giriş Formu ── */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[420px] space-y-8"
        >
          {/* Mobil Logo */}
          <div className="lg:hidden flex items-center justify-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7b7fc8] to-[#9b7fb8] flex items-center justify-center shadow-md shadow-[#7b7fc8]/15">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg text-[#e0e2ec] tracking-tight">
              CodeBrate
            </span>
          </div>

          <div>
            <h2 className="text-2xl text-[#e0e2ec] text-center lg:text-left">
              Tekrar hoş geldiniz
            </h2>
            <p className="text-[#7d809e] mt-2 text-center lg:text-left">
              Hesabınıza giriş yaparak projelerinize devam edin.
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm text-[#8a8da8]">
                E-posta veya Kullanıcı Adı
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6d7090]" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="kullanici_adi veya e-posta"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/[0.08] bg-[#2a2c3e] text-[#d0d2dc] placeholder-[#555770] text-sm focus:outline-none focus:ring-2 focus:ring-[#7b7fc8]/40 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm text-[#8a8da8]">Şifre</label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-[#7b7fc8] hover:text-[#a5a8e0] transition-colors"
                >
                  Şifremi unuttum
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6d7090]" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Şifrenizi girin"
                  required
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-white/[0.08] bg-[#2a2c3e] text-[#d0d2dc] placeholder-[#555770] text-sm focus:outline-none focus:ring-2 focus:ring-[#7b7fc8]/40 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-lg hover:bg-white/[0.05] transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-[#6d7090]" />
                  ) : (
                    <Eye className="w-4 h-4 text-[#6d7090]" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRememberMe(!rememberMe)}
                className={`w-4 h-4 rounded border flex items-center justify-center transition-all flex-shrink-0 ${rememberMe
                    ? "bg-[#6366a8] border-[#6366a8]"
                    : "border-white/[0.15] bg-transparent hover:border-white/[0.25]"
                  }`}
              >
                {rememberMe && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path
                      d="M1 4L3.5 6.5L9 1"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
              <span className="text-sm text-[#8a8da8]">Beni hatırla</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#6366a8] text-white hover:bg-[#7074b8] transition-all shadow-lg shadow-[#6366a8]/20 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span>Giriş yapılıyor...</span>
              ) : (
                <>
                  <span>Giriş Yap</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-sm text-center text-[#7d809e]">
            Hesabınız yok mu?{" "}
            <Link
              href="/register"
              className="text-[#a5a8e0] hover:text-[#c5c8f0] transition-colors"
            >
              Kayıt Ol
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
