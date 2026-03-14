"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  Globe,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  User,
  GraduationCap,
  Shield,
  CheckCircle2,
  Loader2,
  X,
  Check,
} from "lucide-react";
import { motion } from "motion/react";

const steps = [
  { id: 1, label: "Hesap" },
  { id: 2, label: "Profil" },
  { id: 3, label: "Tamamla" },
];

const universities = [
  "İstanbul Teknik Üniversitesi",
  "Boğaziçi Üniversitesi",
  "Orta Doğu Teknik Üniversitesi",
  "Hacettepe Üniversitesi",
  "Bilkent Üniversitesi",
  "Koç Üniversitesi",
  "Sabancı Üniversitesi",
  "Yıldız Teknik Üniversitesi",
  "Ege Üniversitesi",
  "Ankara Üniversitesi",
  "Diğer",
];

const interests = [
  "Yapay Zeka / ML",
  "Web Geliştirme",
  "Mobil Uygulama",
  "Blockchain",
  "IoT / Donanım",
  "Oyun Geliştirme",
  "Siber Güvenlik",
  "Veri Bilimi",
  "UI/UX Tasarım",
  "DevOps / Cloud",
  "Biyoteknoloji",
  "Fintech",
];

export default function RegisterPage() {
  const supabase = createClient();

  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Step 1
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<
    "available" | "taken" | null
  >(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  // Step 2
  const [university, setUniversity] = useState("");
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  // Username kontrolü
  useEffect(() => {
    const checkUsername = async () => {
      if (!username || username.length < 3) {
        setUsernameStatus(null);
        return;
      }
      setCheckingUsername(true);
      const { data: existingUser } = await supabase
        .from("profiles")
        .select("username")
        .eq("username", username.toLowerCase())
        .single();
      setUsernameStatus(existingUser ? "taken" : "available");
      setCheckingUsername(false);
    };
    const timer = setTimeout(checkUsername, 500);
    return () => clearTimeout(timer);
  }, [username]);

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : prev.length < 5
          ? [...prev, interest]
          : prev,
    );
  };

  const passwordStrength = (pw: string) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };

  const strength = passwordStrength(password);
  const strengthLabels = ["", "Zayıf", "Orta", "İyi", "Güçlü"];
  const strengthColors = [
    "",
    "bg-red-400",
    "bg-amber-400",
    "bg-sky-400",
    "bg-emerald-400",
  ];

  const isEduEmail = (mail: string) => {
    return /\.edu(\.[a-z]{2,})?$/i.test(mail.trim());
  };

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!isEduEmail(email)) {
      setError("Yalnızca .edu uzantılı üniversite e-postaları kabul edilmektedir.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Şifreler eşleşmiyor.");
      return;
    }
    if (usernameStatus === "taken") {
      setError("Bu kullanıcı adı alınmış.");
      return;
    }
    if (!agreedTerms) {
      setError("Kullanım şartlarını kabul etmelisiniz.");
      return;
    }
    setCurrentStep(2);
  };

  const handleStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep(3);
  };

  const handleFinalSubmit = async () => {
    setError(null);
    setLoading(true);

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username.toLowerCase(),
          full_name: fullName,
          university,
          department,
          year,
          interests: selectedInterests,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setCurrentStep(1);
    } else {
      setMessage(
        "Kayıt başarılı! Lütfen e-postanı kontrol et ve hesabını doğrula.",
      );
    }
    setLoading(false);
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
            Topluluğumuza katılın,
            <br />
            <span className="text-[#a5a8e0]">geleceğinizi inşa edin.</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="space-y-4 pt-2"
          >
            {[
              { icon: Shield, text: "Fikirleriniz zaman damgasıyla korunur" },
              { icon: GraduationCap, text: "89 ülkeden üniversite öğrencisi" },
              { icon: CheckCircle2, text: "Tamamen ücretsiz başlatın" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#7b7fc8]/10 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-4 h-4 text-[#a5a8e0]" />
                </div>
                <span className="text-sm text-[#8a8da8]">{item.text}</span>
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
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-10 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[460px] space-y-7"
        >
          {/* Mobil Logo */}
          <div className="lg:hidden flex items-center justify-center gap-2.5 mb-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7b7fc8] to-[#9b7fb8] flex items-center justify-center shadow-md shadow-[#7b7fc8]/15">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg text-[#e0e2ec] tracking-tight">
              CodeBrate
            </span>
          </div>

          {/* Başarı Mesajı */}
          {message && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-sm text-center">
              {message}
            </div>
          )}

          {/* Hata Mesajı */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {!message && (
            <>
              {/* Adım Göstergesi */}
              <div className="flex items-center justify-center gap-2">
                {steps.map((step, i) => (
                  <div key={step.id} className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all ${
                          currentStep > step.id
                            ? "bg-emerald-500/20 text-emerald-400"
                            : currentStep === step.id
                              ? "bg-[#6366a8] text-white shadow-md shadow-[#6366a8]/25"
                              : "bg-[#2e3044] text-[#6d7090] border border-white/[0.08]"
                        }`}
                      >
                        {currentStep > step.id ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          step.id
                        )}
                      </div>
                      <span
                        className={`text-xs hidden sm:block ${
                          currentStep >= step.id
                            ? "text-[#c5c8d8]"
                            : "text-[#6d7090]"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                    {i < steps.length - 1 && (
                      <div
                        className={`w-10 h-px ${
                          currentStep > step.id
                            ? "bg-emerald-500/30"
                            : "bg-white/[0.08]"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* ── ADIM 1: Hesap ── */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl text-[#e0e2ec] text-center lg:text-left">
                      Hesap Oluşturun
                    </h2>
                    <p className="text-[#7d809e] mt-1.5 text-center lg:text-left">
                      Başlangıç için temel bilgilerinizi girin.
                    </p>
                  </div>

                  <form onSubmit={handleStep1} className="space-y-4">
                    {/* Ad Soyad */}
                    <div className="space-y-1.5">
                      <label className="text-sm text-[#8a8da8]">Ad Soyad</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6d7090]" />
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Adınız Soyadınız"
                          required
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/[0.08] bg-[#2a2c3e] text-[#d0d2dc] placeholder-[#555770] text-sm focus:outline-none focus:ring-2 focus:ring-[#7b7fc8]/40 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>

                    {/* Kullanıcı Adı */}
                    <div className="space-y-1.5">
                      <label className="text-sm text-[#8a8da8]">
                        Kullanıcı Adı
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6d7090]" />
                        <input
                          type="text"
                          value={username}
                          onChange={(e) =>
                            setUsername(e.target.value.replace(/\s/g, ""))
                          }
                          placeholder="kullanici_adi"
                          required
                          className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-white/[0.08] bg-[#2a2c3e] text-[#d0d2dc] placeholder-[#555770] text-sm focus:outline-none focus:ring-2 focus:ring-[#7b7fc8]/40 focus:border-transparent transition-all"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {checkingUsername && (
                            <Loader2 className="w-4 h-4 text-[#6d7090] animate-spin" />
                          )}
                          {!checkingUsername &&
                            usernameStatus === "available" && (
                              <Check className="w-4 h-4 text-emerald-400" />
                            )}
                          {!checkingUsername && usernameStatus === "taken" && (
                            <X className="w-4 h-4 text-red-400" />
                          )}
                        </div>
                      </div>
                      {usernameStatus === "taken" && (
                        <p className="text-xs text-red-400">
                          Bu kullanıcı adı alınmış.
                        </p>
                      )}
                    </div>

                    {/* E-posta */}
                    <div className="space-y-1.5">
                      <label className="text-sm text-[#8a8da8]">E-posta</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6d7090]" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="ornek@universite.edu.tr"
                          required
                          className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-[#2a2c3e] text-[#d0d2dc] placeholder-[#555770] text-sm focus:outline-none focus:ring-2 focus:ring-[#7b7fc8]/40 focus:border-transparent transition-all ${
                            email && !isEduEmail(email)
                              ? "border-red-500/50"
                              : "border-white/[0.08]"
                          }`}
                        />
                      </div>
                      {email && !isEduEmail(email) ? (
                        <p className="text-xs text-red-400">
                          Yalnızca .edu uzantılı üniversite e-postası kabul edilir (örn: .edu.tr, .edu)
                        </p>
                      ) : (
                        <p className="text-xs text-[#6d7090]">
                          Üniversite e-postanızı girin (.edu veya .edu.tr uzantılı)
                        </p>
                      )}
                    </div>

                    {/* Şifre */}
                    <div className="space-y-1.5">
                      <label className="text-sm text-[#8a8da8]">Şifre</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6d7090]" />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="En az 8 karakter"
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
                      {password && (
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

                    {/* Şifre Tekrar */}
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
                      {confirmPassword && password !== confirmPassword && (
                        <p className="text-xs text-red-400">
                          Şifreler uyuşmuyor
                        </p>
                      )}
                    </div>

                    {/* Şartlar */}
                    <div className="flex items-start gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setAgreedTerms(!agreedTerms)}
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-all mt-0.5 flex-shrink-0 ${
                          agreedTerms
                            ? "bg-[#6366a8] border-[#6366a8]"
                            : "border-white/[0.15] bg-transparent hover:border-white/[0.25]"
                        }`}
                      >
                        {agreedTerms && (
                          <svg
                            width="10"
                            height="8"
                            viewBox="0 0 10 8"
                            fill="none"
                          >
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
                      <span className="text-sm text-[#8a8da8] leading-snug">
                        <Link
                          href="#"
                          className="text-[#a5a8e0] hover:underline"
                        >
                          Kullanım Şartları
                        </Link>{" "}
                        ve{" "}
                        <Link
                          href="#"
                          className="text-[#a5a8e0] hover:underline"
                        >
                          Gizlilik Politikası
                        </Link>
                        &apos;nı kabul ediyorum.
                      </span>
                    </div>

                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#6366a8] text-white hover:bg-[#7074b8] transition-all shadow-lg shadow-[#6366a8]/20 mt-2"
                    >
                      <span>Devam Et</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>

                  <p className="text-sm text-center text-[#7d809e]">
                    Zaten hesabınız var mı?{" "}
                    <Link
                      href="/login"
                      className="text-[#a5a8e0] hover:text-[#c5c8f0] transition-colors"
                    >
                      Giriş Yap
                    </Link>
                  </p>
                </motion.div>
              )}

              {/* ── ADIM 2: Profil ── */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl text-[#e0e2ec] text-center lg:text-left">
                      Profilinizi Tamamlayın
                    </h2>
                    <p className="text-[#7d809e] mt-1.5 text-center lg:text-left">
                      Size uygun proje ortakları bulmamıza yardımcı olun.
                    </p>
                  </div>

                  <form onSubmit={handleStep2} className="space-y-4">
                    {/* Üniversite */}
                    <div className="space-y-1.5">
                      <label className="text-sm text-[#8a8da8]">
                        Üniversite
                      </label>
                      <select
                        value={university}
                        onChange={(e) => setUniversity(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 rounded-xl border border-white/[0.08] bg-[#2a2c3e] text-[#d0d2dc] text-sm focus:outline-none focus:ring-2 focus:ring-[#7b7fc8]/40 focus:border-transparent transition-all appearance-none"
                      >
                        <option value="" disabled>
                          Üniversitenizi seçin
                        </option>
                        {universities.map((u) => (
                          <option key={u} value={u}>
                            {u}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Bölüm */}
                    <div className="space-y-1.5">
                      <label className="text-sm text-[#8a8da8]">Bölüm</label>
                      <input
                        type="text"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        placeholder="Örn: Bilgisayar Mühendisliği"
                        className="w-full px-4 py-2.5 rounded-xl border border-white/[0.08] bg-[#2a2c3e] text-[#d0d2dc] placeholder-[#555770] text-sm focus:outline-none focus:ring-2 focus:ring-[#7b7fc8]/40 focus:border-transparent transition-all"
                      />
                    </div>

                    {/* Sınıf */}
                    <div className="space-y-1.5">
                      <label className="text-sm text-[#8a8da8]">Sınıf</label>
                      <select
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-white/[0.08] bg-[#2a2c3e] text-[#d0d2dc] text-sm focus:outline-none focus:ring-2 focus:ring-[#7b7fc8]/40 focus:border-transparent transition-all appearance-none"
                      >
                        <option value="" disabled>
                          Sınıfınızı seçin
                        </option>
                        <option value="1">1. Sınıf</option>
                        <option value="2">2. Sınıf</option>
                        <option value="3">3. Sınıf</option>
                        <option value="4">4. Sınıf</option>
                        <option value="graduate">Yüksek Lisans</option>
                        <option value="phd">Doktora</option>
                      </select>
                    </div>

                    {/* İlgi Alanları */}
                    <div className="space-y-1.5">
                      <label className="text-sm text-[#8a8da8]">
                        İlgi Alanları (en fazla 5)
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {interests.map((interest) => (
                          <button
                            key={interest}
                            type="button"
                            onClick={() => toggleInterest(interest)}
                            className={`px-3 py-1.5 rounded-xl text-sm transition-all duration-200 ${
                              selectedInterests.includes(interest)
                                ? "bg-[#6366a8] text-white shadow-md shadow-[#6366a8]/20"
                                : "bg-[#2e3044] text-[#8a8da8] border border-white/[0.06] hover:border-white/[0.12] hover:text-[#b0b3c8]"
                            }`}
                          >
                            {interest}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-[#6d7090]">
                        {selectedInterests.length}/5 seçildi
                      </p>
                    </div>

                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#6366a8] text-white hover:bg-[#7074b8] transition-all shadow-lg shadow-[#6366a8]/20 mt-2"
                    >
                      <span>Devam Et</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>

                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="flex items-center justify-center gap-1.5 text-sm text-[#7d809e] hover:text-[#a5a8e0] transition-colors w-full"
                  >
                    <ArrowRight className="w-4 h-4 rotate-180" />
                    <span>Geri dön</span>
                  </button>
                </motion.div>
              )}

              {/* ── ADIM 3: Tamamla ── */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl text-[#e0e2ec] text-center lg:text-left">
                      Her Şey Hazır!
                    </h2>
                    <p className="text-[#7d809e] mt-1.5 text-center lg:text-left">
                      Bilgilerinizi kontrol edin ve kaydı tamamlayın.
                    </p>
                  </div>

                  <div className="bg-[#2e3044]/80 rounded-2xl border border-white/[0.07] p-5 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#7d809e]">Ad Soyad</span>
                      <span className="text-[#d0d2dc]">{fullName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#7d809e]">Kullanıcı Adı</span>
                      <span className="text-[#d0d2dc]">@{username}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#7d809e]">E-posta</span>
                      <span className="text-[#d0d2dc] truncate max-w-[200px]">
                        {email}
                      </span>
                    </div>
                    {university && (
                      <div className="flex justify-between text-sm">
                        <span className="text-[#7d809e]">Üniversite</span>
                        <span className="text-[#d0d2dc] truncate max-w-[200px]">
                          {university}
                        </span>
                      </div>
                    )}
                    {selectedInterests.length > 0 && (
                      <div className="pt-2">
                        <p className="text-xs text-[#7d809e] mb-2">
                          İlgi Alanları
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedInterests.map((i) => (
                            <span
                              key={i}
                              className="px-2.5 py-0.5 rounded-lg bg-[#7b7fc8]/10 text-[#a5a8d8] text-xs"
                            >
                              {i}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleFinalSubmit}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#6366a8] text-white hover:bg-[#7074b8] transition-all shadow-lg shadow-[#6366a8]/20 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span>Hesap oluşturuluyor...</span>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Kaydı Tamamla</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="flex items-center justify-center gap-1.5 text-sm text-[#7d809e] hover:text-[#a5a8e0] transition-colors w-full"
                  >
                    <ArrowRight className="w-4 h-4 rotate-180" />
                    <span>Geri dön</span>
                  </button>
                </motion.div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
