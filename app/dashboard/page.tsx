"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/app/AuthContext";
import {
  BarChart3,
  Bell,
  Heart,
  Star,
  Users,
  Zap,
  Settings,
  Loader2,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { motion } from "motion/react";

type Project = {
  id: string;
  title: string;
  category_tags: string[];
  created_at: string;
};

type Application = {
  id: string;
  message: string | null;
  status: string;
  project_id: string;
  project_title: string;
  applicant_id: string;
  applicant_name: string;
  applicant_username: string;
};

type MyApplication = {
  id: string;
  status: string;
  message: string | null;
  project_id: string;
  project_title: string;
  owner_username: string;
};

type Profile = {
  full_name: string;
  username: string;
  university: string;
  commitment_level: string;
  skills: string[];
};

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<"overview" | "team" | "messages">("overview");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [myApplications, setMyApplications] = useState<MyApplication[]>([]);
  const [totalProjects, setTotalProjects] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user]);

  useEffect(() => {
    if (authLoading || !user) return;

    const fetchData = async () => {
      setLoading(true);

      // Profil bilgisi
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, username, university, commitment_level, skills")
        .eq("id", user.id)
        .single();

      if (profileData) setProfile(profileData);

      // Kullanıcının projeleri
      const { data: projectData, count } = await supabase
        .from("projects")
        .select("id, title, category_tags, created_at", { count: "exact" })
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

      if (projectData) {
        setProjects(projectData);
        setTotalProjects(count ?? projectData.length);

        // Bu projelere gelen başvuruları çek
        const projectIds = projectData.map((p) => p.id);
        if (projectIds.length > 0) {
          const { data: appData } = await supabase
            .from("project_applications")
            .select(`
              id, message, status, project_id,
              projects ( title ),
              profiles:applicant_id ( full_name, username )
            `)
            .in("project_id", projectIds)
            .order("created_at", { ascending: false });

          if (appData) {
            const mapped: Application[] = (appData as any[]).map((a) => ({
              id: a.id,
              message: a.message,
              status: a.status,
              project_id: a.project_id,
              project_title: a.projects?.title ?? "Proje",
              applicant_id: a.profiles?.id ?? "",
              applicant_name: a.profiles?.full_name ?? "Kullanıcı",
              applicant_username: a.profiles?.username ?? "",
            }));
            setApplications(mapped);
          }
        }
      }

      // Kullanıcının kendi başvurduğu projeler
      const { data: myAppData } = await supabase
        .from("project_applications")
        .select(`
          id, status, message, project_id,
          projects ( title, profiles:owner_id ( username ) )
        `)
        .eq("applicant_id", user.id)
        .order("created_at", { ascending: false });

      if (myAppData) {
        const mappedMine: MyApplication[] = (myAppData as any[]).map((a) => ({
          id: a.id,
          status: a.status,
          message: a.message,
          project_id: a.project_id,
          project_title: a.projects?.title ?? "Proje",
          owner_username: a.projects?.profiles?.username ?? "",
        }));
        setMyApplications(mappedMine);
      }

      setLoading(false);
    };

    fetchData();
  }, [user, authLoading]);

  const pendingApplications = applications.filter((a) => a.status === "pending");

  const handleApplicationStatus = async (appId: string, newStatus: "approved" | "rejected") => {
    await supabase
      .from("project_applications")
      .update({ status: newStatus })
      .eq("id", appId);
    setApplications((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
    );
  };

  const displayName = profile?.full_name || user?.email || "Kullanıcı";
  const firstName = displayName.split(" ")[0];
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#7b7fc8] animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
        <h2 className="text-xl text-[#e0e2ec]">Giriş Yapmalısınız</h2>
        <Link href="/login" className="px-5 py-2.5 bg-[#6366a8] text-white rounded-xl hover:bg-[#7074b8] transition-all">
          Giriş Yap
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* ── Başlık ── */}
      <div className="bg-[#22242f]/60 backdrop-blur-sm border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-2xl sm:text-3xl text-[#e0e2ec]">Dashboard</h1>
              <p className="text-[#7d809e] mt-1">Hoş geldiniz, {firstName}!</p>
            </motion.div>

            <div className="flex items-center gap-1 bg-[#2e3044] rounded-xl p-1 border border-white/[0.07]">
              {(["overview", "team", "messages"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                    activeTab === tab
                      ? "bg-[#6366a8]/15 text-[#a5a8d8] shadow-sm"
                      : "text-[#7d809e] hover:text-[#b0b3c8]"
                  }`}
                >
                  {tab === "overview" ? "Genel Bakış" : tab === "team" ? "Ekip" : "Mesajlar"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ── İstatistik Kartları ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              icon: BarChart3,
              label: "Projelerim",
              value: String(totalProjects),
              color: "text-[#8b8fd8] bg-[#8b8fd8]/10",
            },
            {
              icon: Heart,
              label: "Bekleyen Başvurular",
              value: String(pendingApplications.length),
              color: "text-rose-300 bg-rose-400/10",
            },
            {
              icon: Star,
              label: "İtibar Puanı",
              value: "—",
              color: "text-amber-300 bg-amber-400/10",
            },
            {
              icon: Users,
              label: "Ekip Üyeleri",
              value: "—",
              color: "text-emerald-300 bg-emerald-400/10",
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="bg-[#2e3044]/60 backdrop-blur-sm rounded-2xl border border-white/[0.07] p-5"
            >
              <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-2xl text-[#e0e2ec]">{stat.value}</p>
              <p className="text-sm text-[#7d809e]">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* ── Ana İçerik ── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Projelerim */}
            <div className="bg-[#2e3044]/60 backdrop-blur-sm rounded-2xl border border-white/[0.07]">
              <div className="p-6 border-b border-white/[0.06] flex items-center justify-between">
                <h2 className="text-[#e0e2ec]">Projelerim</h2>
                <Link
                  href="/projeler/olustur"
                  className="flex items-center gap-1.5 text-sm text-[#a5a8d8] hover:text-[#c5c8f0] transition-colors"
                >
                  <Plus className="w-4 h-4" /> Yeni Proje
                </Link>
              </div>
              <div className="divide-y divide-white/[0.06]">
                {projects.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-[#7d809e] text-sm">Henüz proje oluşturmadınız.</p>
                    <Link
                      href="/projeler/olustur"
                      className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-[#6366a8] text-white rounded-xl hover:bg-[#7074b8] transition-all text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Proje Oluştur
                    </Link>
                  </div>
                ) : (
                  projects.map((project) => (
                    <div key={project.id} className="p-6">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h3 className="text-[#d0d2dc]">{project.title}</h3>
                          {project.category_tags?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {project.category_tags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className="px-2 py-0.5 rounded-lg bg-white/[0.05] text-[#8a8da8] text-xs border border-white/[0.04]"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <Link
                            href={`/projeler/${project.id}`}
                            className="p-2 rounded-lg hover:bg-white/[0.05] text-[#6d7090] hover:text-[#a5a8d8] transition-all"
                            title="Görüntüle"
                          >
                            <Zap className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/projeler/${project.id}/duzenle`}
                            className="p-2 rounded-lg hover:bg-white/[0.05] text-[#6d7090] hover:text-[#a5a8d8] transition-all"
                            title="Düzenle"
                          >
                            <Settings className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Başvurularım */}
            {myApplications.length > 0 && (
              <div className="bg-[#2e3044]/60 backdrop-blur-sm rounded-2xl border border-white/[0.07]">
                <div className="p-6 border-b border-white/[0.06] flex items-center justify-between">
                  <h2 className="text-[#e0e2ec]">Başvurularım</h2>
                  <span className="text-xs text-[#6d7090] bg-white/[0.04] px-2.5 py-0.5 rounded-lg">
                    {myApplications.length} başvuru
                  </span>
                </div>
                <div className="divide-y divide-white/[0.06]">
                  {myApplications.map((app) => (
                    <div key={app.id} className="p-5 flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex-1">
                        <Link
                          href={`/projeler/${app.project_id}`}
                          className="text-[#d0d2dc] hover:text-[#a5a8d8] transition-colors text-sm font-medium"
                        >
                          {app.project_title}
                        </Link>
                        {app.message && (
                          <p className="text-xs text-[#6d7090] mt-1 italic truncate max-w-xs">&quot;{app.message}&quot;</p>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        {app.status === "pending" && (
                          <span className="flex items-center gap-1.5 text-xs text-amber-300 bg-amber-400/10 px-3 py-1.5 rounded-xl">
                            <Clock className="w-3.5 h-3.5" /> Bekliyor
                          </span>
                        )}
                        {app.status === "approved" && (
                          <span className="flex items-center gap-1.5 text-xs text-emerald-300 bg-emerald-400/10 px-3 py-1.5 rounded-xl">
                            <CheckCircle className="w-3.5 h-3.5" /> Onaylandı
                          </span>
                        )}
                        {app.status === "rejected" && (
                          <span className="flex items-center gap-1.5 text-xs text-red-400 bg-red-400/10 px-3 py-1.5 rounded-xl">
                            <XCircle className="w-3.5 h-3.5" /> Reddedildi
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Başvurular */}
            <div className="bg-[#2e3044]/60 backdrop-blur-sm rounded-2xl border border-white/[0.07]">
              <div className="p-6 border-b border-white/[0.06] flex items-center justify-between">
                <h2 className="text-[#e0e2ec]">Projelerime Gelen Başvurular</h2>
                {pendingApplications.length > 0 && (
                  <span className="text-xs bg-rose-400/10 text-rose-300 px-2.5 py-0.5 rounded-lg">
                    {pendingApplications.length} bekleyen
                  </span>
                )}
              </div>
              <div className="divide-y divide-white/[0.06]">
                {applications.length === 0 ? (
                  <div className="p-6 text-center">
                    <p className="text-[#7d809e] text-sm">Henüz başvuru yok.</p>
                  </div>
                ) : (
                  applications.map((app) => (
                    <div key={app.id} className="p-5">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Link
                              href={`/profil/${app.applicant_username || app.applicant_id}`}
                              className="text-[#d0d2dc] hover:text-[#a5a8d8] transition-colors text-sm font-medium"
                            >
                              {app.applicant_name}
                            </Link>
                            <span className="text-[#6d7090] text-xs">→</span>
                            <Link
                              href={`/projeler/${app.project_id}`}
                              className="text-[#8a8da8] hover:text-[#a5a8d8] transition-colors text-xs"
                            >
                              {app.project_title}
                            </Link>
                          </div>
                          {app.message && (
                            <p className="text-sm text-[#7d809e] mt-1.5 italic">&quot;{app.message}&quot;</p>
                          )}
                        </div>
                        <div className="flex gap-2 flex-shrink-0 items-center">
                          {app.status === "pending" ? (
                            <>
                              <button
                                onClick={() => handleApplicationStatus(app.id, "approved")}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/20 transition-all text-xs"
                              >
                                <CheckCircle className="w-3.5 h-3.5" /> Onayla
                              </button>
                              <button
                                onClick={() => handleApplicationStatus(app.id, "rejected")}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-400/10 text-red-400 hover:bg-red-400/20 transition-all text-xs"
                              >
                                <XCircle className="w-3.5 h-3.5" /> Reddet
                              </button>
                            </>
                          ) : app.status === "approved" ? (
                            <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-lg">
                              <CheckCircle className="w-3.5 h-3.5" /> Onaylandı
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs text-red-400 bg-red-400/10 px-2.5 py-1 rounded-lg">
                              <XCircle className="w-3.5 h-3.5" /> Reddedildi
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Son Projeler (platformdan) */}
            <div className="bg-[#2e3044]/60 backdrop-blur-sm rounded-2xl border border-white/[0.07]">
              <div className="p-6 border-b border-white/[0.06] flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-300" />
                <h2 className="text-[#e0e2ec]">Projeleri Keşfet</h2>
              </div>
              <div className="p-6">
                <p className="text-sm text-[#7d809e] mb-4">
                  Platforma yeni eklenen projelere göz atın, ekip arkadaşı olun.
                </p>
                <Link
                  href="/projeler"
                  className="inline-flex items-center gap-2 px-4 py-2 border border-[#7b7fc8]/20 text-[#a5a8d8] rounded-xl hover:bg-[#7b7fc8]/10 transition-all text-sm"
                >
                  Tüm Projeleri Gör
                </Link>
              </div>
            </div>
          </div>

          {/* ── Kenar Çubuğu ── */}
          <div className="space-y-6">
            {/* Hızlı Profil */}
            <div className="bg-[#2e3044]/60 backdrop-blur-sm rounded-2xl border border-white/[0.07] p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#7b7fc8] to-[#9b7fb8] flex items-center justify-center text-white text-lg shadow-md shadow-[#7b7fc8]/15 font-semibold">
                  {initials}
                </div>
                <div>
                  <h3 className="text-[#e0e2ec]">{displayName}</h3>
                  {profile?.university && (
                    <p className="text-sm text-[#7d809e]">{profile.university}</p>
                  )}
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[#7d809e]">Projeler</span>
                  <span className="text-[#b0b3c8]">{totalProjects}</span>
                </div>
                {profile?.commitment_level && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#7d809e]">Taahhüt</span>
                    <span className="text-[#b0b3c8]">{profile.commitment_level}</span>
                  </div>
                )}
              </div>
              {profile?.skills && profile.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {profile.skills.slice(0, 4).map((s) => (
                    <span
                      key={s}
                      className="px-2.5 py-0.5 rounded-lg bg-[#7b7fc8]/10 text-[#a5a8d8] text-xs"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}
              <Link
                href={`/profil/${profile?.username || "me"}`}
                className="mt-4 w-full flex items-center justify-center py-2 border border-white/[0.08] rounded-xl text-sm text-[#8a8da8] hover:bg-white/[0.05] transition-all"
              >
                Profili Görüntüle
              </Link>
            </div>

            {/* Hızlı Linkler */}
            <div className="bg-[#2e3044]/60 backdrop-blur-sm rounded-2xl border border-white/[0.07] p-6">
              <h2 className="text-[#e0e2ec] mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#7d809e]" /> Hızlı Erişim
              </h2>
              <div className="space-y-2">
                {[
                  { label: "Profili Düzenle", href: "/profil/duzenle" },
                  { label: "Mesajlar", href: "/mesajlar" },
                  { label: "Keşfet", href: "/yetenekler" },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block px-4 py-2.5 rounded-xl text-sm text-[#8a8da8] hover:bg-white/[0.05] hover:text-[#c5c8d8] transition-all"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
