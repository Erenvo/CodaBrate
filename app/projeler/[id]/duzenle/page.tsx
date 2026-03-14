"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/app/AuthContext";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Eye,
  Lock,
  Globe,
  Shield,
  Info,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Trash2,
  Archive,
  AlertTriangle,
  X,
  Clock,
  Users,
  Mail,
} from "lucide-react";
import { motion } from "motion/react";

type Application = {
  id: string;
  applicant_id: string;
  message: string;
  status: string;
  created_at: string;
  profiles?: {
    full_name: string;
    university: string;
    skills: string;
  };
};

const STATUS_OPTIONS = [
  {
    value: "active",
    label: "Aktif",
    style: "bg-emerald-400/10 text-emerald-300 border-emerald-400/20",
  },
  {
    value: "looking",
    label: "Üye Aranıyor",
    style: "bg-amber-400/10 text-amber-300 border-amber-400/20",
  },
  {
    value: "paused",
    label: "Duraklatıldı",
    style: "bg-slate-400/10 text-slate-300 border-slate-400/20",
  },
  {
    value: "completed",
    label: "Tamamlandı",
    style: "bg-sky-400/10 text-sky-300 border-sky-400/20",
  },
];

export default function ProjeDuzenle() {
  const { user, loading: authLoading } = useAuth();
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const projectId = params?.id as string;

  // ── State ──
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const [title, setTitle] = useState("");
  const [showcaseDescription, setShowcaseDescription] = useState("");
  const [categoryTags, setCategoryTags] = useState("");
  const [status, setStatus] = useState("active");
  const [safeDetails, setSafeDetails] = useState("");
  const [vaultId, setVaultId] = useState<string | null>(null);

  const [applications, setApplications] = useState<Application[]>([]);
  const [collapsedSections, setCollapsedSections] = useState<
    Record<string, boolean>
  >({});

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [deleting, setDeleting] = useState(false);

  const toggleSection = (key: string) =>
    setCollapsedSections((prev) => ({ ...prev, [key]: !prev[key] }));

  // ── Veri Çekme ──
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }

    const fetchProject = async () => {
      setLoading(true);

      const { data: project, error: projectError } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();

      if (projectError || !project) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      if (project.owner_id !== user.id) {
        setError("Bu projeyi düzenleme yetkiniz yok.");
        setLoading(false);
        return;
      }

      setTitle(project.title || "");
      setShowcaseDescription(project.showcase_description || "");
      setStatus(project.status || "active");
      setCategoryTags(
        Array.isArray(project.category_tags)
          ? project.category_tags.join(", ")
          : project.category_tags || "",
      );

      const { data: vault } = await supabase
        .from("project_vault")
        .select("*")
        .eq("project_id", projectId)
        .single();

      if (vault) {
        setSafeDetails(vault.safe_details || "");
        setVaultId(vault.id);
      }

      const { data: apps } = await supabase
        .from("project_applications")
        .select(`*, profiles:applicant_id (full_name, university, skills)`)
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (apps) setApplications(apps as Application[]);
      setLoading(false);
    };

    fetchProject();
  }, [user, authLoading, projectId]);

  // ── Kaydet ──
  const handleSave = async () => {
    setSaving(true);
    setError(null);

    const tagsArray = categoryTags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const { error: projectError } = await supabase
      .from("projects")
      .update({
        title,
        showcase_description: showcaseDescription,
        category_tags: tagsArray,
        status,
      })
      .eq("id", projectId);

    if (projectError) {
      setError("Proje güncellenemedi: " + projectError.message);
      setSaving(false);
      return;
    }

    if (vaultId) {
      const { error: vaultError } = await supabase
        .from("project_vault")
        .update({ safe_details: safeDetails })
        .eq("id", vaultId);
      if (vaultError) {
        setError("Kasa güncellenemedi: " + vaultError.message);
        setSaving(false);
        return;
      }
    } else {
      await supabase
        .from("project_vault")
        .insert({ project_id: projectId, safe_details: safeDetails });
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  // ── Başvuru İşlemleri ──
  const handleApplication = async (
    appId: string,
    newStatus: "accepted" | "rejected",
  ) => {
    const { error } = await supabase
      .from("project_applications")
      .update({ status: newStatus })
      .eq("id", appId);
    if (!error)
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a)),
      );
  };

  // ── Silme ──
  const handleDelete = async () => {
    if (deleteInput !== title) return;
    setDeleting(true);
    await supabase
      .from("project_applications")
      .delete()
      .eq("project_id", projectId);
    await supabase.from("project_vault").delete().eq("project_id", projectId);
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", projectId);
    if (error) {
      setError("Proje silinemedi: " + error.message);
      setDeleting(false);
      return;
    }
    router.push("/projeler");
    router.refresh();
  };

  // ── Arşivle ──
  const handleArchive = async () => {
    const { error } = await supabase
      .from("projects")
      .update({ status: "archived" })
      .eq("id", projectId);
    if (!error) {
      setStatus("archived");
      setShowArchiveConfirm(false);
    }
  };

  // ── Bölüm Başlığı ──
  const SectionHeader = ({
    sectionKey,
    icon: Icon,
    title: sTitle,
    subtitle,
    iconBg = "bg-[#7b7fc8]/10",
    iconColor = "text-[#8b8fd8]",
  }: {
    sectionKey: string;
    icon: React.ElementType;
    title: string;
    subtitle?: string;
    iconBg?: string;
    iconColor?: string;
  }) => (
    <button
      onClick={() => toggleSection(sectionKey)}
      className="w-full flex items-center justify-between p-6 text-left group"
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center`}
        >
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
        <div>
          <h2 className="text-[#e0e2ec] group-hover:text-white transition-colors">
            {sTitle}
          </h2>
          {subtitle && (
            <p className="text-xs text-[#6d7090] mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {collapsedSections[sectionKey] ? (
        <ChevronDown className="w-5 h-5 text-[#6d7090]" />
      ) : (
        <ChevronUp className="w-5 h-5 text-[#6d7090]" />
      )}
    </button>
  );

  // ── Yükleniyor ──
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#262836] flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8 text-[#7b7fc8]" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-[#262836] flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-[#e0e2ec] text-2xl mb-2">Proje Bulunamadı</h1>
          <p className="text-[#7d809e] mb-6">
            Aradığınız proje mevcut değil veya silinmiş.
          </p>
          <Link
            href="/projeler"
            className="px-6 py-3 bg-[#6366a8] text-white rounded-xl hover:bg-[#7074b8] transition-all"
          >
            Projelere Dön
          </Link>
        </div>
      </div>
    );
  }

  if (error && !title) {
    return (
      <div className="min-h-screen bg-[#262836] flex items-center justify-center px-4">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-[#e0e2ec] text-xl mb-2">Erişim Engellendi</h1>
          <p className="text-[#7d809e] mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-[#6366a8] text-white rounded-xl hover:bg-[#7074b8] transition-all"
          >
            Geri Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#262836]">
      {/* ── Sticky Üst Çubuk ── */}
      <div className="sticky top-16 z-40 bg-[#262836]/90 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/projeler"
              className="p-2 rounded-xl hover:bg-white/[0.05] transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[#8a8da8]" />
            </Link>
            <div className="hidden sm:block">
              <p className="text-xs text-[#6d7090]">Proje Düzenle</p>
              <p className="text-sm text-[#d0d2dc] truncate max-w-[300px]">
                {title}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/projeler/${projectId}`}
              className="px-4 py-2 border border-white/[0.08] text-[#8a8da8] rounded-xl hover:bg-white/[0.05] transition-all text-sm hidden sm:flex items-center gap-2"
            >
              <Eye className="w-4 h-4" /> Önizle
            </Link>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 bg-[#6366a8] text-white rounded-xl hover:bg-[#7074b8] transition-all shadow-md shadow-[#6366a8]/20 text-sm flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Kaydediliyor...
                </>
              ) : saved ? (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Kaydedildi!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Kaydet
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── İçerik ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-5">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3 text-sm"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
          </motion.div>
        )}

        {/* ── 1. Temel Bilgiler ── */}
        <div className="bg-[#2e3044]/60 backdrop-blur-sm rounded-2xl border border-white/[0.07] overflow-hidden">
          <SectionHeader
            sectionKey="basic"
            icon={Info}
            title="Temel Bilgiler"
            subtitle="Proje adı ve durum ayarları"
          />
          {!collapsedSections.basic && (
            <div className="px-6 pb-6 space-y-5 border-t border-white/[0.06]">
              <div className="pt-5 space-y-1.5">
                <label className="text-sm text-[#b0b3c8]">Proje Başlığı</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-white/[0.08] bg-[#262836] text-[#d0d2dc] placeholder-[#6d7090] focus:outline-none focus:ring-2 focus:ring-[#7b7fc8]/40 focus:border-transparent transition-all text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-[#b0b3c8]">Proje Durumu</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setStatus(opt.value)}
                      className={`px-3 py-2.5 rounded-xl text-sm border transition-all duration-200 ${
                        status === opt.value
                          ? opt.style + " border-current shadow-sm"
                          : "border-white/[0.06] text-[#6d7090] hover:border-white/[0.12] hover:text-[#8a8da8]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm text-[#b0b3c8]">
                  Etiketler (virgülle ayırın)
                </label>
                <input
                  type="text"
                  value={categoryTags}
                  onChange={(e) => setCategoryTags(e.target.value)}
                  placeholder="React, Next.js, Python..."
                  className="w-full px-4 py-2.5 rounded-xl border border-white/[0.08] bg-[#262836] text-[#d0d2dc] placeholder-[#6d7090] focus:outline-none focus:ring-2 focus:ring-[#7b7fc8]/40 focus:border-transparent transition-all text-sm"
                />
                {categoryTags.trim() && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {categoryTags
                      .split(",")
                      .map((t) => t.trim())
                      .filter((t) => t)
                      .map((tag, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg bg-[#7b7fc8]/10 text-[#a5a8d8] text-xs border border-[#7b7fc8]/15"
                        >
                          {tag}
                        </span>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── 2. Vitrin (Herkese Açık) ── */}
        <div className="bg-[#2e3044]/60 backdrop-blur-sm rounded-2xl border border-white/[0.07] overflow-hidden">
          <SectionHeader
            sectionKey="vitrin"
            icon={Eye}
            title="Vitrin Özeti"
            subtitle="Herkese açık — projeyle ilgilenenlerin gördüğü bilgi"
            iconBg="bg-sky-400/10"
            iconColor="text-sky-300"
          />
          {!collapsedSections.vitrin && (
            <div className="px-6 pb-6 border-t border-white/[0.06]">
              <div className="pt-5 space-y-1.5">
                <textarea
                  rows={4}
                  value={showcaseDescription}
                  onChange={(e) => setShowcaseDescription(e.target.value)}
                  placeholder="Projenizin merak uyandıran kısa özeti..."
                  className="w-full px-4 py-3 rounded-xl border border-white/[0.08] bg-[#262836] text-[#d0d2dc] placeholder-[#6d7090] focus:outline-none focus:ring-2 focus:ring-[#7b7fc8]/40 focus:border-transparent resize-none transition-all text-sm"
                />
                <p className="text-xs text-[#6d7090] flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  Bu metin herkes tarafından görülür. Projenizin cazip
                  taraflarını ön çıkarın.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── 3. Kasa (Gizli) ── */}
        <div className="bg-[#2e3044]/60 backdrop-blur-sm rounded-2xl border border-[#7b7fc8]/10 overflow-hidden">
          <SectionHeader
            sectionKey="kasa"
            icon={Lock}
            title="Kasa Detayları"
            subtitle="Gizli — sadece onayladığınız kişiler görebilir"
            iconBg="bg-violet-400/10"
            iconColor="text-violet-300"
          />
          {!collapsedSections.kasa && (
            <div className="px-6 pb-6 border-t border-white/[0.06]">
              <div className="pt-5 space-y-4">
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
                  placeholder="Teknik detaylar, proje planları, repo linkleri, API anahtarları..."
                  className="w-full px-4 py-3 rounded-xl border border-white/[0.08] bg-[#262836] text-[#d0d2dc] placeholder-[#6d7090] focus:outline-none focus:ring-2 focus:ring-[#7b7fc8]/40 focus:border-transparent resize-none transition-all text-sm"
                />
              </div>
            </div>
          )}
        </div>

        {/* ── 4. Başvurular ── */}
        {applications.length > 0 && (
          <div className="bg-[#2e3044]/60 backdrop-blur-sm rounded-2xl border border-white/[0.07] overflow-hidden">
            <SectionHeader
              sectionKey="applications"
              icon={Users}
              title="Başvurular"
              subtitle={`${applications.length} başvuru`}
              iconBg="bg-emerald-400/10"
              iconColor="text-emerald-300"
            />
            {!collapsedSections.applications && (
              <div className="divide-y divide-white/[0.06] border-t border-white/[0.06]">
                {applications.map((app) => (
                  <div key={app.id} className="p-5">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7b7fc8] to-[#9b7fb8] flex items-center justify-center text-white text-sm flex-shrink-0">
                          {app.profiles?.full_name?.[0] ?? "?"}
                        </div>
                        <div>
                          <p className="text-[#d0d2dc] text-sm">
                            {app.profiles?.full_name ?? "Bilinmiyor"}
                          </p>
                          <p className="text-xs text-[#8a8da8] mt-0.5">
                            {app.profiles?.university}
                          </p>
                          {app.message && (
                            <p className="text-xs text-[#7d809e] mt-2 max-w-md leading-relaxed italic">
                              &ldquo;{app.message}&rdquo;
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Clock className="w-3 h-3 text-[#6d7090]" />
                            <span className="text-xs text-[#6d7090]">
                              {new Date(app.created_at).toLocaleDateString(
                                "tr-TR",
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {app.status === "pending" ? (
                          <>
                            <button
                              onClick={() =>
                                handleApplication(app.id, "accepted")
                              }
                              className="px-3 py-1.5 rounded-lg bg-emerald-400/10 text-emerald-300 border border-emerald-400/20 text-sm hover:bg-emerald-400/20 transition-all"
                            >
                              Onayla
                            </button>
                            <button
                              onClick={() =>
                                handleApplication(app.id, "rejected")
                              }
                              className="px-3 py-1.5 rounded-lg bg-red-400/10 text-red-300 border border-red-400/20 text-sm hover:bg-red-400/20 transition-all"
                            >
                              Reddet
                            </button>
                            <Link
                              href={`/profil/${app.applicant_id}`}
                              className="p-1.5 rounded-lg border border-white/[0.08] text-[#8a8da8] hover:bg-white/[0.05] transition-all"
                            >
                              <Mail className="w-4 h-4" />
                            </Link>
                          </>
                        ) : (
                          <span
                            className={`px-3 py-1.5 rounded-lg text-sm border ${
                              app.status === "accepted"
                                ? "bg-emerald-400/10 text-emerald-300 border-emerald-400/20"
                                : "bg-red-400/10 text-red-300 border-red-400/20"
                            }`}
                          >
                            {app.status === "accepted"
                              ? "Onaylandı"
                              : "Reddedildi"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── 5. Tehlike Bölgesi ── */}
        <div className="bg-[#2e3044]/60 backdrop-blur-sm rounded-2xl border border-red-500/15 overflow-hidden">
          <SectionHeader
            sectionKey="danger"
            icon={AlertTriangle}
            title="Tehlike Bölgesi"
            subtitle="Geri alınamaz işlemler"
            iconBg="bg-red-400/10"
            iconColor="text-red-400"
          />
          {!collapsedSections.danger && (
            <div className="px-6 pb-6 border-t border-white/[0.06]">
              <div className="pt-5 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowArchiveConfirm(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-amber-500/20 text-amber-300 bg-amber-400/5 hover:bg-amber-400/10 transition-all text-sm"
                >
                  <Archive className="w-4 h-4" />
                  Projeyi Arşivle
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/20 text-red-400 bg-red-400/5 hover:bg-red-400/10 transition-all text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  Projeyi Kalıcı Sil
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Arşivle Modal ── */}
      {showArchiveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#2e3044] rounded-2xl max-w-md w-full p-6 border border-white/[0.08] shadow-2xl shadow-black/30"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center">
                <Archive className="w-5 h-5 text-amber-300" />
              </div>
              <h3 className="text-[#e0e2ec]">Projeyi Arşivle</h3>
            </div>
            <p className="text-[#8a8da8] text-sm mb-6 leading-relaxed">
              Bu proje arşivlenecek ve listelerden gizlenecek. İstediğiniz zaman
              geri alabilirsiniz.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowArchiveConfirm(false)}
                className="flex-1 px-4 py-2.5 border border-white/[0.08] text-[#8a8da8] rounded-xl hover:bg-white/[0.05] transition-all text-sm"
              >
                İptal
              </button>
              <button
                onClick={handleArchive}
                className="flex-1 px-4 py-2.5 bg-amber-500/80 text-white rounded-xl hover:bg-amber-500 transition-all text-sm"
              >
                Arşivle
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── Sil Modal ── */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#2e3044] rounded-2xl max-w-md w-full p-6 border border-red-500/20 shadow-2xl shadow-black/30"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-400/10 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="text-[#e0e2ec]">Projeyi Sil</h3>
              </div>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="p-1.5 rounded-lg hover:bg-white/[0.05] transition-colors"
              >
                <X className="w-5 h-5 text-[#8a8da8]" />
              </button>
            </div>
            <p className="text-[#8a8da8] text-sm mb-4 leading-relaxed">
              Bu işlem geri alınamaz. Projeniz, tüm başvurular ve kasa
              içeriğiyle birlikte kalıcı olarak silinecek.
            </p>
            <div className="space-y-1.5 mb-5">
              <label className="text-sm text-[#b0b3c8]">
                Onaylamak için proje adını yazın:{" "}
                <span className="text-red-400">{title}</span>
              </label>
              <input
                type="text"
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                placeholder="Proje adını yazın..."
                className="w-full px-4 py-2.5 rounded-xl border border-red-500/20 bg-[#262836] text-[#d0d2dc] placeholder-[#6d7090] focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-transparent transition-all text-sm"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteInput("");
                }}
                className="flex-1 px-4 py-2.5 border border-white/[0.08] text-[#8a8da8] rounded-xl hover:bg-white/[0.05] transition-all text-sm"
              >
                İptal
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteInput !== title || deleting}
                className="flex-1 px-4 py-2.5 bg-red-600/80 text-white rounded-xl hover:bg-red-600 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Siliniyor...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" /> Kalıcı Olarak Sil
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
