"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/app/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Lock,
  Eye,
  Globe,
  Shield,
  Check,
  Loader2,
  AlertCircle,
  X,
  Plus,
} from "lucide-react";
import { motion } from "motion/react";

const AVAILABLE_SKILLS = [
  "React",
  "Python",
  "UI/UX",
  "Figma",
  "Node.js",
  "Machine Learning",
  "Flutter",
  "Data Science",
  "Pazarlama",
  "Blockchain",
  "TypeScript",
  "Java",
  "Swift",
  "Kotlin",
  "Docker",
];

export default function ProjeOlustur() {
  const { user, loading } = useAuth();
  const supabase = createClient();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [publicDetails, setPublicDetails] = useState("");
  const [safeDetails, setSafeDetails] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [commitment, setCommitment] = useState("5-10 saat/hafta");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!user) {
      setError("Proje oluşturmak için giriş yapmalısınız.");
      setIsSubmitting(false);
      return;
    }

    const extraTags = tagsInput
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    const allTags = [...new Set([...selectedSkills, ...extraTags])];
    const combinedDescription = `${shortDescription}\n\n${publicDetails}`;

    const { data: projectData, error: projectError } = await supabase
      .from("projects")
      .insert({
        owner_id: user.id,
        title,
        showcase_description: combinedDescription,
        category_tags: allTags,
      })
      .select("id")
      .single();

    if (projectError) {
      setError("Proje kaydedilemedi: " + projectError.message);
      setIsSubmitting(false);
      return;
    }

    if (projectData) {
      const { error: vaultError } = await supabase
        .from("project_vault")
        .insert({
          project_id: projectData.id,
          safe_details: safeDetails,
        });

      if (vaultError) {
        console.error("Kasa hatası:", vaultError);
      }

      router.push("/projeler");
      router.refresh();
    }

    setIsSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#262836] flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8 text-[#7b7fc8]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#262836] flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-xl text-[#e0e2ec] mb-2">Giriş Yapmalısınız</h2>
          <p className="text-[#7d809e] mb-6">
            Proje oluşturmak için hesabınıza giriş yapın.
          </p>
          <Link
            href="/login"
            className="px-6 py-3 bg-[#6366a8] text-white rounded-xl hover:bg-[#7074b8] transition-all"
          >
            Giriş Yap
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#262836]">
      {/* ── Sticky Üst Çubuk ── */}
      <div className="sticky top-16 z-40 bg-[#262836]/90 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/projeler"
              className="p-2 rounded-xl hover:bg-white/[0.05] transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[#8a8da8]" />
            </Link>
            <div className="hidden sm:block">
              <p className="text-xs text-[#6d7090]">Yeni Proje</p>
              <p className="text-sm text-[#d0d2dc] truncate max-w-[260px]">
                {title || "Proje başlığı girin..."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/projeler"
              className="px-4 py-2 border border-white/[0.08] text-[#8a8da8] rounded-xl hover:bg-white/[0.05] transition-all text-sm hidden sm:block"
            >
              İptal
            </Link>
            <button
              form="create-project-form"
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-[#6366a8] text-white rounded-xl hover:bg-[#7074b8] transition-all shadow-md shadow-[#6366a8]/20 text-sm flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Yayınlanıyor...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Yayınla
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── İçerik ── */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-5">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3 text-sm"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </motion.div>
        )}

        <form
          id="create-project-form"
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          {/* ── 1. Temel Bilgiler ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-[#2e3044]/60 backdrop-blur-sm rounded-2xl border border-white/[0.07] overflow-hidden"
          >
            <div className="p-6 border-b border-white/[0.06] flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#7b7fc8]/10 flex items-center justify-center">
                <Globe className="w-4 h-4 text-[#8b8fd8]" />
              </div>
              <div>
                <h2 className="text-[#e0e2ec]">Temel Bilgiler</h2>
                <p className="text-xs text-[#6d7090] mt-0.5">
                  Projenizin adı ve taahhüt seviyesi
                </p>
              </div>
            </div>
            <div className="p-6 space-y-5">
              {/* Başlık */}
              <div className="space-y-1.5">
                <label className="text-sm text-[#b0b3c8]">
                  Proje Başlığı *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Örn: AI Destekli Kampüs Navigasyon Uygulaması"
                  className="w-full px-4 py-2.5 rounded-xl border border-white/[0.08] bg-[#262836] text-[#d0d2dc] placeholder-[#6d7090] focus:outline-none focus:ring-2 focus:ring-[#7b7fc8]/40 focus:border-transparent transition-all text-sm"
                />
              </div>

              {/* Taahhüt */}
              <div className="space-y-1.5">
                <label className="text-sm text-[#b0b3c8]">
                  Taahhüt Seviyesi
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["5-10 saat/hafta", "10+ saat/hafta", "Esnek"].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setCommitment(opt)}
                      className={`px-3 py-2.5 rounded-xl text-sm border transition-all duration-200 ${
                        commitment === opt
                          ? "bg-[#6366a8]/15 text-[#a5a8d8] border-[#6366a8]/30"
                          : "border-white/[0.06] text-[#6d7090] hover:border-white/[0.12] hover:text-[#8a8da8]"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── 2. Vitrin (Herkese Açık) ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 }}
            className="bg-[#2e3044]/60 backdrop-blur-sm rounded-2xl border border-white/[0.07] overflow-hidden"
          >
            <div className="p-6 border-b border-white/[0.06] flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-400/10 flex items-center justify-center">
                <Eye className="w-4 h-4 text-sky-300" />
              </div>
              <div>
                <h2 className="text-[#e0e2ec]">Vitrin (Herkese Açık)</h2>
                <p className="text-xs text-[#6d7090] mt-0.5">
                  Tüm kullanıcıların göreceği bilgiler
                </p>
              </div>
            </div>
            <div className="p-6 space-y-5">
              {/* Kısa Açıklama */}
              <div className="space-y-1.5">
                <label className="text-sm text-[#b0b3c8]">
                  Kısa Açıklama *
                </label>
                <input
                  type="text"
                  required
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="Listelerde görünecek tek satırlık özet..."
                  className="w-full px-4 py-2.5 rounded-xl border border-white/[0.08] bg-[#262836] text-[#d0d2dc] placeholder-[#6d7090] focus:outline-none focus:ring-2 focus:ring-[#7b7fc8]/40 focus:border-transparent transition-all text-sm"
                />
              </div>

              {/* Detaylı Açıklama */}
              <div className="space-y-1.5">
                <label className="text-sm text-[#b0b3c8]">
                  Detaylı Açıklama *
                </label>
                <textarea
                  required
                  rows={4}
                  value={publicDetails}
                  onChange={(e) => setPublicDetails(e.target.value)}
                  placeholder="Projenin amacı, kullanılan teknolojiler, aranan ekip arkadaşları..."
                  className="w-full px-4 py-3 rounded-xl border border-white/[0.08] bg-[#262836] text-[#d0d2dc] placeholder-[#6d7090] focus:outline-none focus:ring-2 focus:ring-[#7b7fc8]/40 focus:border-transparent resize-none transition-all text-sm"
                />
                <p className="text-xs text-[#6d7090] flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  Bu metin herkes tarafından görülür.
                </p>
              </div>
            </div>
          </motion.div>

          {/* ── 3. Kasa (Gizli) ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.16 }}
            className="bg-[#2e3044]/60 backdrop-blur-sm rounded-2xl border border-[#7b7fc8]/10 overflow-hidden"
          >
            <div className="p-6 border-b border-white/[0.06] flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-violet-400/10 flex items-center justify-center">
                <Lock className="w-4 h-4 text-violet-300" />
              </div>
              <div>
                <h2 className="text-[#e0e2ec]">Kasa Detayları (Gizli)</h2>
                <p className="text-xs text-[#6d7090] mt-0.5">
                  Sadece onayladığınız kişiler görebilir
                </p>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#7b7fc8]/[0.06] border border-[#7b7fc8]/10">
                <Shield className="w-4 h-4 text-[#8b8fd8] flex-shrink-0" />
                <p className="text-xs text-[#8a8da8]">
                  Kasa içeriği aşamalı paylaşım sistemiyle korunur. Yalnızca
                  onayladığınız ekip adayları erişebilir.
                </p>
              </div>
              <textarea
                rows={5}
                value={safeDetails}
                onChange={(e) => setSafeDetails(e.target.value)}
                placeholder="Repo linkleri, API anahtarları, tasarım dosyaları, Trello/Notion board, teknik detaylar..."
                className="w-full px-4 py-3 rounded-xl border border-white/[0.08] bg-[#262836] text-[#d0d2dc] placeholder-[#6d7090] focus:outline-none focus:ring-2 focus:ring-[#7b7fc8]/40 focus:border-transparent resize-none transition-all text-sm"
              />
            </div>
          </motion.div>

          {/* ── 4. Yetenekler & Etiketler ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.24 }}
            className="bg-[#2e3044]/60 backdrop-blur-sm rounded-2xl border border-white/[0.07] overflow-hidden"
          >
            <div className="p-6 border-b border-white/[0.06] flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-400/10 flex items-center justify-center">
                <Plus className="w-4 h-4 text-emerald-300" />
              </div>
              <div>
                <h2 className="text-[#e0e2ec]">Yetenekler & Etiketler</h2>
                <p className="text-xs text-[#6d7090] mt-0.5">
                  Aranan teknik ve profesyonel beceriler
                </p>
              </div>
            </div>
            <div className="p-6 space-y-5">
              {/* Seçilen yetenekler */}
              {selectedSkills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedSkills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#7b7fc8]/10 text-[#a5a8d8] text-sm border border-[#7b7fc8]/15"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className="hover:text-[#e07070] transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Yetenek butonları */}
              <div>
                <p className="text-xs text-[#6d7090] mb-2">Hızlı seçim:</p>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_SKILLS.filter(
                    (s) => !selectedSkills.includes(s),
                  ).map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className="px-3 py-1.5 rounded-xl text-sm bg-[#262836] text-[#8a8da8] border border-white/[0.08] hover:bg-[#7b7fc8]/10 hover:text-[#a5a8d8] hover:border-[#7b7fc8]/20 transition-all"
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ek etiketler */}
              <div className="space-y-1.5">
                <label className="text-sm text-[#b0b3c8]">
                  Ek Etiketler (virgülle ayırın)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="Örn: Next.js, TensorFlow, Firebase..."
                  className="w-full px-4 py-2.5 rounded-xl border border-white/[0.08] bg-[#262836] text-[#d0d2dc] placeholder-[#6d7090] focus:outline-none focus:ring-2 focus:ring-[#7b7fc8]/40 focus:border-transparent transition-all text-sm"
                />
              </div>
            </div>
          </motion.div>

          {/* ── Mobil Buton ── */}
          <div className="flex gap-3 sm:hidden pb-4">
            <Link
              href="/projeler"
              className="flex-1 px-4 py-2.5 border border-white/[0.08] text-[#8a8da8] rounded-xl hover:bg-white/[0.05] transition-all text-sm text-center"
            >
              İptal
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 bg-[#6366a8] text-white rounded-xl hover:bg-[#7074b8] transition-all shadow-md shadow-[#6366a8]/20 text-sm flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Yayınlanıyor...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Yayınla
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
