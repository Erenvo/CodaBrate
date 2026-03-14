"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  Globe,
  Mail,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

type Step = "email" | "sent" | "reset" | "done";

export default function ForgotPasswordPage() {
  const supabase = createClient();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const maskedEmail = email
    ? email.replace(
        /(.{2})(.*)(@.*)/,
        (_, a, b, c) => a + "*".repeat(Math.max(b.length, 1)) + c,
      )
    : "";

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError(null);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${window.location.origin}/update-password`,
      },
    );

    if (resetError) {
      setError(resetError.message);
    } else {
      setStep("sent");
    }
    setLoading(false);
  };

  const passwordStrength = (pw: string) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };

  const strength = passwordStrength(newPassword);
  const strengthLabels = ["", "Zayıf", "Orta", "İyi", "Güçlü"];
  const strengthColors = [
    "",
    "bg-red-400",
    "bg-amber-400",
    "bg-sky-400",
    "bg-emerald-400",
  ];

  const stepIndex = { email: 0, sent: 1, reset: 2, done: 3 };

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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#7b7fc8]/10 flex items-center justify-center">
              <ShieldCheck className="w-7 h-7 text-[#a5a8e0]" />
            </div>
            <h1 className="text-3xl text-[#e0e2ec] leading-snug">
              Hesabınız güvende,
              <br />
              <span className="text-[#a5a8e0]">endişe etmeyin.</span>
            </h1>
            <p className="text-[#7d809e] leading-relaxed max-w-sm">
              Şifrenizi sıfırlamak hızlı ve güvenlidir. E-posta adresinize
              göndereceğimiz link ile yeni bir şifre oluşturabilirsiniz.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex gap-6 pt-2"
          >
            {[
              { value: "256-bit", label: "Şifreleme" },
              { value: "SSL", label: "Güvenlik" },
              { value: "< 2dk", label: "İşlem süresi" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-lg text-[#a5a8e0]">{stat.value}</p>
                <p className="text-xs text-[#6d7090] mt-0.5">{stat.label}</p>
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

      {/* ── Sağ: Form Alanı ── */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-10">
        <div className="w-full max-w-[420px]">
          {/* Mobil Logo */}
          <div className="lg:hidden flex items-center justify-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7b7fc8] to-[#9b7fb8] flex items-center justify-center shadow-md shadow-[#7b7fc8]/15">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg text-[#e0e2ec] tracking-tight">
              CodeBrate
            </span>
          </div>

          {/* İlerleme Çubuğu */}
          <div className="flex gap-1.5 mb-8">
            {(["email", "sent", "reset", "done"] as Step[]).map((s, i) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                  stepIndex[step] >= i ? "bg-[#6366a8]" : "bg-white/[0.08]"
                }`}
              />
            ))}
          </div>

          {/* Hata mesajı */}
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* ── Adım 1: E-posta ── */}
            {step === "email" && (
              <motion.div
                key="email"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-xl bg-[#7b7fc8]/10 flex items-center justify-center mb-4">
                    <KeyRound className="w-6 h-6 text-[#a5a8e0]" />
                  </div>
                  <h2 className="text-2xl text-[#e0e2ec]">Şifremi Unuttum</h2>
                  <p className="text-[#7d809e] leading-relaxed">
                    Kayıtlı e-posta adresinizi girin. Size bir sıfırlama
                    bağlantısı göndereceğiz.
                  </p>
                </div>

                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm text-[#8a8da8]">
                      E-posta Adresi
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6d7090]" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="ornek@universite.edu.tr"
                        required
                        autoFocus
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/[0.08] bg-[#2a2c3e] text-[#d0d2dc] placeholder-[#555770] text-sm focus:outline-none focus:ring-2 focus:ring-[#7b7fc8]/40 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#6366a8] text-white hover:bg-[#7074b8] transition-all shadow-lg shadow-[#6366a8]/20 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span>Gönderiliyor...</span>
                    ) : (
                      <>
                        <span>Sıfırlama Bağlantısı Gönder</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                <Link
                  href="/login"
                  className="flex items-center justify-center gap-1.5 text-sm text-[#7d809e] hover:text-[#a5a8e0] transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Girişe dön</span>
                </Link>
              </motion.div>
            )}

            {/* ── Adım 2: E-posta Gönderildi ── */}
            {step === "sent" && (
              <motion.div
                key="sent"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4">
                    <Mail className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h2 className="text-2xl text-[#e0e2ec]">
                    E-posta Gönderildi
                  </h2>
                  <p className="text-[#7d809e] leading-relaxed">
                    <span className="text-[#a5a8e0]">{maskedEmail}</span>{" "}
                    adresine bir şifre sıfırlama bağlantısı gönderdik. Lütfen
                    gelen kutunuzu kontrol edin.
                  </p>
                </div>

                <div className="bg-[#2e3044]/60 rounded-2xl border border-white/[0.07] p-5 space-y-3">
                  <p className="text-sm text-[#8a8da8] flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    Spam/Önemsiz klasörünü de kontrol etmeyi unutmayın.
                  </p>
                  <p className="text-sm text-[#8a8da8] flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    Bağlantı 24 saat geçerlidir.
                  </p>
                </div>

                <button
                  onClick={() => setStep("email")}
                  className="flex items-center justify-center gap-1.5 text-sm text-[#7d809e] hover:text-[#a5a8e0] transition-colors w-full"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Farklı e-posta kullan</span>
                </button>
              </motion.div>
            )}

            {/* ── Adım 3: Yeni Şifre (update-password sayfasından yönlenince) ── */}
            {step === "reset" && (
              <motion.div
                key="reset"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-xl bg-[#7b7fc8]/10 flex items-center justify-center mb-4">
                    <Lock className="w-6 h-6 text-[#a5a8e0]" />
                  </div>
                  <h2 className="text-2xl text-[#e0e2ec]">
                    Yeni Şifre Belirleyin
                  </h2>
                  <p className="text-[#7d809e] leading-relaxed">
                    Hesabınız için güçlü ve benzersiz bir şifre oluşturun.
                  </p>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (newPassword !== confirmPassword) {
                      setError("Şifreler uyuşmuyor.");
                      return;
                    }
                    setStep("done");
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-1.5">
                    <label className="text-sm text-[#8a8da8]">Yeni Şifre</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6d7090]" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="En az 8 karakter"
                        required
                        autoFocus
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
                    {newPassword && (
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex-1 flex gap-1">
                          {[1, 2, 3, 4].map((level) => (
                            <div
                              key={level}
                              className={`h-1 flex-1 rounded-full transition-all ${
                                strength >= level
                                  ? strengthColors[strength]
                                  : "bg-white/[0.08]"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-[#6d7090]">
                          {strengthLabels[strength]}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm text-[#8a8da8]">
                      Şifre Tekrar
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6d7090]" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Şifrenizi tekrar girin"
                        required
                        className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-white/[0.08] bg-[#2a2c3e] text-[#d0d2dc] placeholder-[#555770] text-sm focus:outline-none focus:ring-2 focus:ring-[#7b7fc8]/40 focus:border-transparent transition-all"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-lg hover:bg-white/[0.05] transition-colors"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4 text-[#6d7090]" />
                        ) : (
                          <Eye className="w-4 h-4 text-[#6d7090]" />
                        )}
                      </button>
                    </div>
                    {confirmPassword && newPassword !== confirmPassword && (
                      <p className="text-xs text-red-400">Şifreler uyuşmuyor</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#6366a8] text-white hover:bg-[#7074b8] transition-all shadow-lg shadow-[#6366a8]/20"
                  >
                    <span>Şifremi Güncelle</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </motion.div>
            )}

            {/* ── Adım 4: Tamamlandı ── */}
            {step === "done" && (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="space-y-6 text-center"
              >
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl text-[#e0e2ec] mb-2">
                    Şifre Güncellendi!
                  </h2>
                  <p className="text-[#7d809e]">
                    Şifreniz başarıyla güncellendi. Şimdi yeni şifrenizle giriş
                    yapabilirsiniz.
                  </p>
                </div>
                <Link
                  href="/login"
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#6366a8] text-white hover:bg-[#7074b8] transition-all shadow-lg shadow-[#6366a8]/20"
                >
                  <span>Giriş Yap</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
