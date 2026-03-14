"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Search, Clock, Eye, Lock, Heart, Users, Plus, Loader2 } from "lucide-react";
import { motion } from "motion/react";

const SKILL_FILTERS = [
  "React", "Python", "UI/UX", "Figma", "Node.js",
  "Machine Learning", "Flutter", "Data Science", "Pazarlama", "Blockchain",
];

type Project = {
  id: string;
  title: string;
  showcase_description: string;
  category_tags: string[];
  created_at: string;
  owner_id: string;
  profiles: {
    full_name: string;
    username: string;
    university: string;
  } | null;
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} dakika önce`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} saat önce`;
  const days = Math.floor(hours / 24);
  return `${days} gün önce`;
}

export default function ProjelerPage() {
  const supabase = createClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("projects")
        .select(`
          id,
          title,
          showcase_description,
          category_tags,
          created_at,
          owner_id,
          profiles:owner_id ( full_name, username, university )
        `)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setProjects(data as unknown as Project[]);
      }
      setLoading(false);
    };
    fetchProjects();
  }, []);

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const filtered = projects.filter((p) => {
    const matchSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.showcase_description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchSkills =
      selectedSkills.length === 0 ||
      selectedSkills.some((s) => p.category_tags?.includes(s));
    return matchSearch && matchSkills;
  });

  return (
    <div className="min-h-screen">
      {/* ── Başlık ── */}
      <div className="bg-[#22242f]/60 backdrop-blur-sm border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl text-[#e0e2ec]">Projeler</h1>
              <p className="text-[#7d809e] mt-1">
                Açık projeleri keşfet veya kendi projenizi oluşturun
              </p>
            </div>
            <Link
              href="/projeler/olustur"
              className="flex items-center gap-2 px-5 py-2.5 bg-[#6366a8] text-white rounded-xl hover:bg-[#7074b8] transition-all shadow-md shadow-[#6366a8]/20"
            >
              <Plus className="w-4 h-4" />
              Yeni Proje
            </Link>
          </div>

          {/* Arama */}
          <div className="relative max-w-xl">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6d7090]" />
            <input
              type="text"
              placeholder="Proje ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-white/[0.08] bg-[#2a2c3e] text-[#d0d2dc] placeholder-[#6d7090] focus:outline-none focus:ring-2 focus:ring-[#7b7fc8]/40 focus:border-transparent transition-all"
            />
          </div>

          {/* Filtreler */}
          <div className="flex flex-wrap gap-2 mt-4">
            {SKILL_FILTERS.map((skill) => (
              <button
                key={skill}
                onClick={() => toggleSkill(skill)}
                className={`px-3 py-1.5 rounded-xl text-sm transition-all duration-200 ${
                  selectedSkills.includes(skill)
                    ? "bg-[#6366a8] text-white shadow-md shadow-[#6366a8]/20"
                    : "bg-[#2e3044] text-[#8a8da8] border border-white/[0.06] hover:border-white/[0.12] hover:text-[#b0b3c8]"
                }`}
              >
                {skill}
              </button>
            ))}
            {selectedSkills.length > 0 && (
              <button
                onClick={() => setSelectedSkills([])}
                className="px-3 py-1.5 rounded-xl text-sm text-[#e07070] bg-[#e07070]/10 hover:bg-[#e07070]/15 transition-colors"
              >
                Temizle
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Proje Listesi ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#7b7fc8] animate-spin" />
          </div>
        ) : (
          <>
            <p className="text-sm text-[#6d7090] mb-6">
              {filtered.length} proje bulundu
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((project, i) => {
                const owner = project.profiles;
                const ownerName = owner?.full_name || owner?.username || "Anonim";
                const tags = project.category_tags ?? [];

                return (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: i * 0.05 }}
                    className="bg-[#2e3044]/60 backdrop-blur-sm rounded-2xl border border-white/[0.07] hover:border-white/[0.12] hover:bg-[#2e3044]/80 transition-all duration-300 group"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-sky-400/10 text-sky-300 text-xs">
                          <Eye className="w-3 h-3" /> Vitrin
                        </span>
                        <button className="p-1.5 rounded-lg hover:bg-white/[0.05] transition-colors opacity-0 group-hover:opacity-100">
                          <Heart className="w-4 h-4 text-[#6d7090]" />
                        </button>
                      </div>

                      <Link href={`/projeler/${project.id}`}>
                        <h3 className="text-[#d0d2dc] mb-2 group-hover:text-[#a5a8d8] transition-colors cursor-pointer line-clamp-2">
                          {project.title}
                        </h3>
                      </Link>
                      <p className="text-sm text-[#7d809e] mb-4 line-clamp-2 leading-relaxed">
                        {project.showcase_description}
                      </p>

                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {tags.slice(0, 4).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 rounded-lg bg-white/[0.05] text-[#8a8da8] text-xs border border-white/[0.04]"
                            >
                              {tag}
                            </span>
                          ))}
                          {tags.length > 4 && (
                            <span className="px-2 py-0.5 rounded-lg bg-white/[0.05] text-[#6d7090] text-xs">
                              +{tags.length - 4}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="border-t border-white/[0.06] pt-4 flex items-center justify-between">
                        <Link
                          href={`/profil/${owner?.username || project.owner_id}`}
                          className="flex items-center gap-2 group/owner"
                        >
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#7b7fc8] to-[#9b7fb8] flex items-center justify-center text-white text-xs shadow-sm flex-shrink-0">
                            {ownerName[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="text-xs text-[#b0b3c8] group-hover/owner:text-[#a5a8d8] transition-colors">
                              {ownerName}
                            </p>
                            {owner?.university && (
                              <p className="text-xs text-[#6d7090] truncate max-w-[120px]">
                                {owner.university}
                              </p>
                            )}
                          </div>
                        </Link>
                        <span className="flex items-center gap-1 text-xs text-[#6d7090]">
                          <Clock className="w-3 h-3" />
                          {timeAgo(project.created_at)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {filtered.length === 0 && !loading && (
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-2xl bg-[#2e3044] flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-[#6d7090]" />
                </div>
                <h3 className="text-[#d0d2dc] mb-2">Proje bulunamadı</h3>
                <p className="text-[#7d809e] text-sm">
                  {projects.length === 0
                    ? "Henüz hiç proje yok. İlk projeyi sen oluştur!"
                    : "Farklı anahtar kelimeler veya filtreler deneyebilirsiniz."}
                </p>
                {projects.length === 0 && (
                  <Link
                    href="/projeler/olustur"
                    className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-[#6366a8] text-white rounded-xl hover:bg-[#7074b8] transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Proje Oluştur
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
