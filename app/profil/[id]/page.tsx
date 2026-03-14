'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/app/AuthContext'
import {
  ExternalLink,
  Clock,
  Edit3,
  Github,
  Linkedin,
  Globe,
  MessageSquare,
  Loader2,
  Eye,
  Lock,
  Plus,
} from 'lucide-react'
import { motion } from 'motion/react'

type Profile = {
  id: string
  username: string
  full_name: string
  university: string
  department: string
  bio: string
  skills: string[]
  github_link: string
  linkedin_link: string
  discord_username: string
  commitment_level: string

}

type Project = {
  id: string
  title: string
  showcase_description: string
  category_tags: string[]
  created_at: string
}

export default function ProfilPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const supabase = createClient()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [loadingProjects, setLoadingProjects] = useState(false)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [activeTab, setActiveTab] = useState<'about' | 'projects' | 'reviews'>('about')

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true)

      // "me" ise giriş yapan kullanıcının profilini çek
      let query = supabase.from('profiles').select('*')

      if (id === 'me') {
        if (!user) { setNotFound(true); setLoading(false); return }
        query = query.eq('id', user.id)
      } else {
        // Önce username olarak dene, sonra UUID olarak
        const { data: byUsername } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', id)
          .single()

        if (byUsername) {
          setProfile(byUsername)
          setLoading(false)
          return
        }

        query = query.eq('id', id)
      }

      const { data, error } = await query.single()

      if (error || !data) {
        setNotFound(true)
      } else {
        setProfile(data)
      }
      setLoading(false)
    }

    fetchProfile()
  }, [id, user])

  // Profil yüklendikten sonra projeleri çek
  useEffect(() => {
    if (!profile?.id) return
    const fetchProjects = async () => {
      setLoadingProjects(true)
      const { data } = await supabase
        .from('projects')
        .select('id, title, showcase_description, category_tags, created_at')
        .eq('owner_id', profile.id)
        .order('created_at', { ascending: false })
      setProjects(data ?? [])
      setLoadingProjects(false)
    }
    fetchProjects()
  }, [profile?.id])

  const isOwnProfile = user && profile && user.id === profile.id

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#7b7fc8] animate-spin" />
      </div>
    )
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
        <p className="text-4xl">😕</p>
        <h1 className="text-2xl text-[#e0e2ec]">Profil Bulunamadı</h1>
        <p className="text-[#7d809e]">Bu kullanıcı mevcut değil ya da hesabı silinmiş olabilir.</p>
        <Link href="/" className="px-5 py-2.5 bg-[#6366a8] text-white rounded-xl hover:bg-[#7074b8] transition-all">
          Ana Sayfaya Dön
        </Link>
      </div>
    )
  }

  const links = [
    profile.github_link && { icon: Github, label: 'GitHub', url: profile.github_link },
    profile.linkedin_link && { icon: Linkedin, label: 'LinkedIn', url: profile.linkedin_link },
  ].filter(Boolean) as { icon: typeof Github; label: string; url: string }[]

  return (
    <div className="min-h-screen">

      {/* ── Profil Başlığı ── */}
      <div className="bg-[#22242f]/60 backdrop-blur-sm border-b border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-6 items-start"
          >
            {/* Avatar */}
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#7b7fc8] to-[#9b7fb8] flex items-center justify-center text-white text-3xl flex-shrink-0 shadow-lg shadow-[#7b7fc8]/15">
              <span className="font-semibold">{initials}</span>
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <h1 className="text-2xl text-[#e0e2ec]">{profile.full_name || profile.username}</h1>
                  {profile.university && (
                    <p className="text-[#8a8da8] mt-0.5">{profile.university}</p>
                  )}
                  {profile.department && (
                    <p className="text-sm text-[#6d7090]">{profile.department}</p>
                  )}
                </div>
                <div className="flex gap-2 flex-wrap">
                  {!isOwnProfile && (
                    <Link
                      href="/mesajlar"
                      className="flex items-center gap-2 px-4 py-2 bg-[#6366a8] text-white rounded-xl hover:bg-[#7074b8] transition-all shadow-md shadow-[#6366a8]/20 text-sm"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Mesaj Gönder
                    </Link>
                  )}
                  {isOwnProfile && (
                    <Link
                      href="/profil/duzenle"
                      className="flex items-center gap-2 px-4 py-2 border border-white/[0.08] rounded-xl text-[#8a8da8] hover:bg-white/[0.05] transition-all text-sm"
                    >
                      <Edit3 className="w-4 h-4" />
                      Düzenle
                    </Link>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-[#7d809e]">
                {profile.commitment_level && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {profile.commitment_level}
                  </span>
                )}
              </div>
            </div>
          </motion.div>

          {/* Sekmeler */}
          <div className="flex gap-1 mt-8 border-b border-white/[0.06] -mb-px">
            {(['about', 'projects', 'reviews'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 text-sm border-b-2 transition-all duration-200 ${
                  activeTab === tab
                    ? 'border-[#7b7fc8] text-[#a5a8d8]'
                    : 'border-transparent text-[#7d809e] hover:text-[#b0b3c8]'
                }`}
              >
                {tab === 'about' ? 'Hakkında' : tab === 'projects' ? 'Projeler' : 'Değerlendirmeler'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── İçerik ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Hakkında Sekmesi */}
        {activeTab === 'about' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="grid lg:grid-cols-3 gap-6"
          >
            <div className="lg:col-span-2 space-y-6">

              {/* Hakkımda */}
              <div className="bg-[#2e3044]/60 backdrop-blur-sm rounded-2xl border border-white/[0.07] p-6">
                <h2 className="text-[#e0e2ec] mb-3">Hakkında</h2>
                {profile.bio ? (
                  <p className="text-[#8a8da8] leading-relaxed">{profile.bio}</p>
                ) : (
                  <p className="text-[#6d7090] italic text-sm">
                    {isOwnProfile ? 'Henüz bir biyografi eklemediniz.' : 'Biyografi eklenmemiş.'}
                  </p>
                )}
              </div>

              {/* Yetenekler */}
              {profile.skills && profile.skills.length > 0 && (
                <div className="bg-[#2e3044]/60 backdrop-blur-sm rounded-2xl border border-white/[0.07] p-6">
                  <h2 className="text-[#e0e2ec] mb-4">Yetenekler</h2>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1.5 rounded-xl bg-[#7b7fc8]/10 text-[#a5a8d8] text-sm border border-[#7b7fc8]/15"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sağ Panel */}
            <div className="space-y-6">

              {/* Linkleri */}
              {links.length > 0 && (
                <div className="bg-[#2e3044]/60 backdrop-blur-sm rounded-2xl border border-white/[0.07] p-6">
                  <h2 className="text-[#e0e2ec] mb-4">Bağlantılar</h2>
                  <div className="space-y-3">
                    {links.map((link) => (
                      <a
                        key={link.label}
                        href={link.url.startsWith('http') ? link.url : `https://${link.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-sm text-[#7d809e] hover:text-[#a5a8d8] transition-colors group"
                      >
                        <link.icon className="w-4 h-4 flex-shrink-0" />
                        <span className="flex-1 truncate">{link.url}</span>
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    ))}
                    {profile.discord_username && (
                      <div className="flex items-center gap-3 text-sm text-[#7d809e]">
                        <Globe className="w-4 h-4 flex-shrink-0" />
                        <span>Discord: {profile.discord_username}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Profil Bilgisi */}
              <div className="bg-[#2e3044]/60 backdrop-blur-sm rounded-2xl border border-white/[0.07] p-6">
                <h2 className="text-[#e0e2ec] mb-4">Profil</h2>
                <div className="space-y-2 text-sm text-[#8a8da8]">
                  <p>@{profile.username}</p>
                  {profile.university && <p>{profile.university}</p>}
                  {profile.department && <p>{profile.department}</p>}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Projeler Sekmesi */}
        {activeTab === 'projects' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="space-y-4"
          >
            {loadingProjects ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 text-[#7b7fc8] animate-spin" />
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-[#7d809e]">
                  {isOwnProfile ? 'Henüz proje oluşturmadınız.' : 'Bu kullanıcının projesi bulunmuyor.'}
                </p>
                {isOwnProfile && (
                  <Link
                    href="/projeler/olustur"
                    className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-[#6366a8] text-white rounded-xl hover:bg-[#7074b8] transition-all text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Proje Oluştur
                  </Link>
                )}
              </div>
            ) : (
              projects.map((project) => (
                <div
                  key={project.id}
                  className="bg-[#2e3044]/60 backdrop-blur-sm rounded-2xl border border-white/[0.07] hover:border-white/[0.12] transition-all p-6"
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex-1">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-sky-400/10 text-sky-300 text-xs mb-2">
                        <Eye className="w-3 h-3" /> Vitrin
                      </span>
                      <h3 className="text-[#d0d2dc] mt-1">{project.title}</h3>
                      {project.showcase_description && (
                        <p className="text-sm text-[#7d809e] mt-1.5 line-clamp-2 leading-relaxed">
                          {project.showcase_description}
                        </p>
                      )}
                      {project.category_tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {project.category_tags.slice(0, 4).map((tag) => (
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
                        className="px-4 py-2 border border-white/[0.08] rounded-xl text-sm text-[#8a8da8] hover:bg-white/[0.05] transition-all"
                      >
                        Görüntüle
                      </Link>
                      {isOwnProfile && (
                        <Link
                          href={`/projeler/${project.id}/duzenle`}
                          className="px-4 py-2 border border-white/[0.08] rounded-xl text-sm text-[#8a8da8] hover:bg-white/[0.05] transition-all"
                        >
                          Düzenle
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}

        {/* Değerlendirmeler Sekmesi */}
        {activeTab === 'reviews' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <p className="text-[#7d809e] text-center py-12">Henüz değerlendirme yok.</p>
          </motion.div>
        )}

      </div>
    </div>
  )
}
