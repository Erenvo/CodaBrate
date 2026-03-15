"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Shield,
  Users,
  Star,
  ArrowRight,
  Eye,
  Lock,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  Globe,
  Tag,
  MapPin,
  Clock,
} from "lucide-react";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import { motion } from "motion/react";

const features = [
  {
    icon: Eye,
    title: "Vitrin Sistemi",
    desc: "Projenizin merak uyandıran özetini herkesle paylaşın. Hassas detaylar sizde kalsın.",
    color: "bg-sky-400/10 text-sky-300",
  },
  {
    icon: Lock,
    title: "Kasa (Zaman Damgası)",
    desc: "Her fikir otomatik zaman damgasıyla korunur. Fikir hırsızlığına karşı somut kanıt.",
    color: "bg-violet-400/10 text-violet-300",
  },
  {
    icon: Star,
    title: "İtibar Puanı",
    desc: "Karşılıklı değerlendirme ile güvenilir bir topluluk oluşuyor. Puanlar profilinizde görünür.",
    color: "bg-amber-400/10 text-amber-300",
  },
  {
    icon: Shield,
    title: "Güvenli Entegrasyon",
    desc: "NDA imzalama, aşamalı erişim ve branch korumasıyla yeni üyeleri güvenle ekleyin.",
    color: "bg-emerald-400/10 text-emerald-300",
  },
  {
    icon: MessageSquare,
    title: "Mesajlaşma",
    desc: "İlgilenen adaylarla doğrudan platform üzerinden güvenli iletişim kurun.",
    color: "bg-rose-400/10 text-rose-300",
  },
  {
    icon: Sparkles,
    title: "Akıllı Eşleştirme",
    desc: "Yeteneklerinize ve ilgi alanlarınıza göre en uygun projeleri otomatik önerir.",
    color: "bg-teal-400/10 text-teal-300",
  },
];

const howItWorks = [
  {
    step: "1",
    title: "Kayıt Olun",
    desc: "Üniversite e-postanızla (.edu.tr) kaydolun ve profilinizi oluşturun.",
  },
  {
    step: "2",
    title: "Proje Oluşturun veya Keşfedin",
    desc: "Vitrin sistemiyle projenizi paylaşın ya da mevcut projeleri keşfedin.",
  },
  {
    step: "3",
    title: "Eşleşin ve Başlayın",
    desc: "Doğru ekip arkadaşınızı bulun, anlaşma imzalayın ve birlikte başlayın.",
  },
];

const stats = [
  { value: "12,500+", label: "Öğrenci" },
  { value: "3,200+", label: "Proje" },
  { value: "850+", label: "Üniversite" },
  { value: "45+", label: "Ülke" },
];

type RecentProject = {
  id: string;
  title: string;
  showcase_description: string;
  category_tags: string[] | null;
  created_at: string;
  profiles: { full_name: string; university: string } | null;
};

type RecentUser = {
  id: string;
  full_name: string;
  username: string;
  university: string;
  skills: string[] | null;
};

const cardGradients = [
  "from-sky-400/20 to-indigo-400/10",
  "from-violet-400/20 to-purple-400/10",
  "from-emerald-400/20 to-teal-400/10",
  "from-rose-400/20 to-pink-400/10",
  "from-amber-400/20 to-orange-400/10",
  "from-[#7b7fc8]/20 to-[#9b7fb8]/10",
];

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 3600) return `${Math.floor(diff / 60)} dk önce`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} sa önce`;
  return `${Math.floor(diff / 86400)} gün önce`;
}

function getInitials(name: string) {
  return (name || "?").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function HomePage() {
  const supabase = createClient();
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: projects } = await supabase
        .from("projects")
        .select("id, title, showcase_description, category_tags, created_at, profiles:owner_id(full_name, university)")
        .order("created_at", { ascending: false })
        .limit(6);
      if (projects) setRecentProjects(projects as unknown as RecentProject[]);

      const { data: users } = await supabase
        .from("profiles")
        .select("id, full_name, username, university, skills")
        .not("skills", "is", null)
        .order("created_at", { ascending: false })
        .limit(6);
      if (users) setRecentUsers(users as RecentUser[]);
    };
    fetchData();
  }, []);

  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#262836] via-[#2a2d42] to-[#262836]" />
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-[#7b7fc8]/6 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#9b7fb8]/6 rounded-full blur-[120px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-28 lg:pt-28 lg:pb-36">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#7b7fc8]/10 border border-[#7b7fc8]/15 text-[#a5a8d8] mb-6">
                <Globe className="w-4 h-4" />
                <span className="text-sm">Küresel Üniversite Ağı</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] tracking-tight text-[#e8eaf2] mb-6 leading-[1.15]">
                Proje Fikriniz İçin{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8b8fd8] to-[#b88fc8]">
                  Doğru Ekibi
                </span>{" "}
                Bulun
              </h1>
              <p className="text-lg text-[#8a8da8] mb-8 max-w-lg leading-relaxed">
                Farklı disiplinlerden ve coğrafyalardan üniversite öğrencilerini
                bir araya getiren güvenli platform. Fikirlerinizi koruyun, doğru
                partneri bulun.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/projeler"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#6366a8] text-white rounded-2xl hover:bg-[#7074b8] transition-all shadow-md shadow-[#6366a8]/20"
                >
                  Projeleri Keşfet
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/projeler/olustur"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-white/10 text-[#b0b3c8] rounded-2xl hover:bg-white/[0.05] transition-all"
                >
                  Proje Oluştur
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
              className="hidden lg:block"
            >
              <div className="relative">
                <div className="rounded-3xl overflow-hidden shadow-xl shadow-black/20 ring-1 ring-white/[0.08]">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1080&q=80"
                    alt="Öğrenciler işbirliği yapıyor"
                    className="w-full h-80 object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 bg-[#2e3044]/95 backdrop-blur-sm rounded-2xl shadow-lg shadow-black/20 p-4 border border-white/[0.08]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-400/10 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                    </div>
                    <div>
                      <p className="text-sm text-[#d0d2dc]">Fikir Korundu</p>
                      <p className="text-xs text-[#6d7090]">
                        Zaman damgası oluşturuldu
                      </p>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 bg-[#2e3044]/95 backdrop-blur-sm rounded-2xl shadow-lg shadow-black/20 p-4 border border-white/[0.08]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-400/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-violet-300" />
                    </div>
                    <div>
                      <p className="text-sm text-[#d0d2dc]">3 Yeni Eşleşme</p>
                      <p className="text-xs text-[#6d7090]">
                        Yeteneklerinize uygun
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="border-y border-white/[0.06] bg-[#22242f]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl text-[#8b8fd8] mb-1">{s.value}</p>
                <p className="text-[#6d7090]">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Son Eklenen Projeler ── */}
      {recentProjects.length > 0 && (
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-12">
              <div>
                <h2 className="text-3xl sm:text-4xl text-[#e0e2ec] mb-3">
                  Son Eklenen Projeler
                </h2>
                <p className="text-[#7d809e]">
                  Platformdaki en yeni projeler — hemen başvur!
                </p>
              </div>
              <Link
                href="/projeler"
                className="hidden sm:inline-flex items-center gap-2 text-[#a5a8d8] hover:text-[#d0d2dc] transition-colors text-sm"
              >
                Tümünü Gör <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {recentProjects.map((project, i) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.07 }}
                >
                  <Link
                    href={`/projeler/${project.id}`}
                    className="group block h-full bg-[#2e3044]/60 backdrop-blur-sm rounded-2xl border border-white/[0.07] hover:border-white/[0.14] hover:bg-[#2e3044]/90 transition-all duration-300 overflow-hidden"
                  >
                    {/* Renk şeridi */}
                    <div className={`h-1.5 w-full bg-gradient-to-r ${cardGradients[i % cardGradients.length]}`} />
                    <div className="p-6">
                      <h3 className="text-[#d0d2dc] group-hover:text-[#e8eaf2] transition-colors mb-2 line-clamp-1">
                        {project.title}
                      </h3>
                      <p className="text-[#7d809e] text-sm leading-relaxed line-clamp-2 mb-4">
                        {project.showcase_description}
                      </p>

                      {project.category_tags && project.category_tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {project.category_tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs bg-[#7b7fc8]/10 text-[#a5a8d8] border border-[#7b7fc8]/10">
                              <Tag className="w-3 h-3" /> {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
                        <div className="flex items-center gap-2 text-xs text-[#6d7090]">
                          {project.profiles?.university && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {project.profiles.university.split(" ").slice(0, 2).join(" ")}
                            </span>
                          )}
                        </div>
                        <span className="flex items-center gap-1 text-xs text-[#5a5d7a]">
                          <Clock className="w-3 h-3" />
                          {timeAgo(project.created_at)}
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 text-center sm:hidden">
              <Link href="/projeler" className="inline-flex items-center gap-2 text-[#a5a8d8] text-sm">
                Tüm Projeleri Gör <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Features ── */}
      <section className="py-24 bg-[#22242f]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl text-[#e0e2ec] mb-4">
              Güven Üzerine Kurulu Platform
            </h2>
            <p className="text-lg text-[#7d809e] max-w-2xl mx-auto">
              Fikir hırsızlığını önleyen, ekip içi güveni artıran ve güvenli
              entegrasyon sağlayan benzersiz özellikler.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="bg-[#2e3044]/60 backdrop-blur-sm rounded-2xl p-6 border border-white/[0.07] hover:border-white/[0.12] hover:bg-[#2e3044]/80 transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl ${f.color} flex items-center justify-center mb-4`}>
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="text-[#d0d2dc] mb-2">{f.title}</h3>
                <p className="text-[#7d809e] text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Öne Çıkan Yetenekler ── */}
      {recentUsers.length > 0 && (
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-12">
              <div>
                <h2 className="text-3xl sm:text-4xl text-[#e0e2ec] mb-3">
                  Yetenekli Öğrenciler
                </h2>
                <p className="text-[#7d809e]">
                  Projene katılmaya hazır öğrencileri keşfet.
                </p>
              </div>
              <Link
                href="/yetenekler"
                className="hidden sm:inline-flex items-center gap-2 text-[#a5a8d8] hover:text-[#d0d2dc] transition-colors text-sm"
              >
                Tümünü Gör <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {recentUsers.map((u, i) => (
                <motion.div
                  key={u.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.07 }}
                >
                  <Link
                    href={`/profil/${u.username || u.id}`}
                    className="group flex items-start gap-4 p-5 bg-[#2e3044]/60 backdrop-blur-sm rounded-2xl border border-white/[0.07] hover:border-white/[0.14] hover:bg-[#2e3044]/90 transition-all duration-300"
                  >
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${cardGradients[i % cardGradients.length]} flex items-center justify-center text-white font-semibold flex-shrink-0 shadow-md`}>
                      {getInitials(u.full_name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[#d0d2dc] group-hover:text-[#e8eaf2] transition-colors text-sm truncate">
                        {u.full_name || u.username}
                      </p>
                      {u.university && (
                        <p className="text-xs text-[#7b7fc8] mt-0.5 truncate">{u.university}</p>
                      )}
                      {u.skills && u.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {u.skills.slice(0, 3).map((s) => (
                            <span key={s} className="text-xs px-2 py-0.5 rounded-lg bg-white/[0.06] text-[#8a8da8] border border-white/[0.04]">
                              {s}
                            </span>
                          ))}
                          {u.skills.length > 3 && (
                            <span className="text-xs px-2 py-0.5 rounded-lg bg-white/[0.04] text-[#6d7090]">
                              +{u.skills.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── How it works ── */}
      <section className="py-24 bg-[#22242f]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl text-[#e0e2ec] mb-4">
              Nasıl Çalışır?
            </h2>
            <p className="text-lg text-[#7d809e]">
              Üç basit adımda projeniz için doğru ekibi bulun.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="text-center"
              >
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#6366a8] to-[#9b7fb8] text-white flex items-center justify-center text-2xl shadow-md shadow-[#6366a8]/15">
                  {item.step}
                </div>
                <h3 className="text-[#d0d2dc] mb-2">{item.title}</h3>
                <p className="text-[#7d809e] text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-gradient-to-br from-[#5558a0] to-[#8568a8] rounded-3xl p-12 sm:p-16 text-center shadow-xl shadow-[#5558a0]/10">
            <h2 className="text-3xl sm:text-4xl text-white mb-4">
              Projenizi Hayata Geçirmeye Hazır mısınız?
            </h2>
            <p className="text-white/65 mb-8 text-lg">
              Binlerce öğrenci zaten platformda. Siz de katılıp doğru partneri bulun.
            </p>
            <Link
              href="/projeler"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white/95 text-[#5558a0] rounded-2xl hover:bg-white transition-all shadow-md"
            >
              Hemen Başla
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
