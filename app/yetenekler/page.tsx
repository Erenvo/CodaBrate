"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Search, Loader2 } from "lucide-react";
import { motion } from "motion/react";

type Profile = {
  id: string;
  username: string;
  full_name: string;
  university: string;
  department: string;
  bio: string;
  skills: string[];
  commitment_level: string;

};

const AVATAR_GRADIENTS = [
  "from-rose-400 to-pink-500",
  "from-sky-400 to-indigo-500",
  "from-emerald-400 to-teal-500",
  "from-amber-400 to-orange-500",
  "from-violet-400 to-purple-500",
  "from-cyan-400 to-blue-500",
  "from-fuchsia-400 to-pink-500",
  "from-lime-400 to-green-500",
];

export default function YeteneklerPage() {
  const supabase = createClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfiles = async () => {
      setLoading(true);
      setFetchError(null);
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, full_name, university, department, bio, skills, commitment_level")
        .order("full_name", { ascending: true });

      if (error) {
        console.error("Profiles fetch error:", error);
        setFetchError(error.message);
      } else if (data) {
        console.log("Profiles fetched:", data.length, data);
        setProfiles(data as Profile[]);
      }
      setLoading(false);
    };
    fetchProfiles();
  }, []);

  const filtered = profiles.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      (u.full_name || "").toLowerCase().includes(q) ||
      (u.username || "").toLowerCase().includes(q) ||
      (u.university || "").toLowerCase().includes(q) ||
      (u.department || "").toLowerCase().includes(q) ||
      (u.skills || []).some((s) => s.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen">
      {/* ── Başlık ── */}
      <div className="bg-[#22242f]/60 backdrop-blur-sm border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-2xl sm:text-3xl text-[#e0e2ec] mb-2">Keşfet</h1>
            <p className="text-[#7d809e] mb-6">
              Yetenekli öğrencileri keşfet ve projenize davet edin
            </p>
          </motion.div>

          <div className="relative max-w-xl">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6d7090]" />
            <input
              type="text"
              placeholder="İsim, yetenek veya üniversite ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-white/[0.08] bg-[#2a2c3e] text-[#d0d2dc] placeholder-[#6d7090] focus:outline-none focus:ring-2 focus:ring-[#7b7fc8]/40 focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

      {/* ── Kullanıcı Kartları ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#7b7fc8] animate-spin" />
          </div>
        ) : fetchError ? (
          <div className="text-center py-20">
            <p className="text-red-400 text-sm mb-2">Veri yüklenirken hata oluştu:</p>
            <p className="text-[#6d7090] text-xs font-mono bg-[#2e3044] rounded-xl px-4 py-2 inline-block">{fetchError}</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-[#6d7090] mb-6">
              {filtered.length} yetenek bulundu
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((profile, i) => {
                const displayName = profile.full_name || profile.username || "Kullanıcı";
                const initials = displayName
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2);
                const gradient = AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length];

                return (
                  <motion.div
                    key={profile.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    className="bg-[#2e3044]/60 backdrop-blur-sm rounded-2xl border border-white/[0.07] hover:border-white/[0.12] p-6 hover:bg-[#2e3044]/80 transition-all duration-300"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white flex-shrink-0 shadow-md text-sm font-semibold overflow-hidden`}>
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[#d0d2dc] truncate">{displayName}</h3>
                        {profile.university && (
                          <p className="text-sm text-[#8a8da8] truncate">{profile.university}</p>
                        )}
                        {profile.department && (
                          <p className="text-xs text-[#6d7090] truncate">{profile.department}</p>
                        )}
                      </div>
                    </div>

                    {profile.bio ? (
                      <p className="text-sm text-[#7d809e] mb-4 leading-relaxed line-clamp-2">
                        {profile.bio}
                      </p>
                    ) : (
                      <p className="text-sm text-[#555770] italic mb-4">Biyografi eklenmemiş</p>
                    )}

                    {profile.skills && profile.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {profile.skills.slice(0, 4).map((skill) => (
                          <span
                            key={skill}
                            className="px-2.5 py-0.5 rounded-lg bg-[#7b7fc8]/10 text-[#a5a8d8] text-xs"
                          >
                            {skill}
                          </span>
                        ))}
                        {profile.skills.length > 4 && (
                          <span className="px-2.5 py-0.5 rounded-lg bg-white/[0.05] text-[#6d7090] text-xs">
                            +{profile.skills.length - 4}
                          </span>
                        )}
                      </div>
                    )}

                    {profile.commitment_level && (
                      <p className="text-xs text-[#6d7090] mb-4">{profile.commitment_level}</p>
                    )}

                    <Link
                      href={`/profil/${profile.username || profile.id}`}
                      className="block w-full py-2.5 border border-[#7b7fc8]/20 text-[#a5a8d8] rounded-xl hover:bg-[#7b7fc8]/10 transition-all text-sm text-center"
                    >
                      Profili Görüntüle
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-2xl bg-[#2e3044] flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-[#6d7090]" />
                </div>
                <h3 className="text-[#d0d2dc] mb-2">Kullanıcı bulunamadı</h3>
                <p className="text-[#7d809e] text-sm">
                  {profiles.length === 0
                    ? "Henüz kayıtlı kullanıcı yok."
                    : "Farklı anahtar kelimeler deneyebilirsiniz."}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
