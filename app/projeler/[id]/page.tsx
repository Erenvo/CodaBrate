'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/app/AuthContext'
import Link from 'next/link'
import { motion } from 'motion/react'
import {
  ArrowLeft, User, Calendar, MapPin, Lock, Globe,
  CheckCircle, Trash2, Edit, Send, Clock, XCircle,
  MessageSquare, Tag, Loader2, AlertCircle, Shield, TriangleAlert
} from 'lucide-react'

type ProjectType = {
  id: string
  title: string
  showcase_description: string
  safe_details?: string | null
  category_tags: string[] | null
  created_at: string
  owner_id: string
  status: string | null
  profiles: {
    id: string
    username: string
    full_name: string
    university: string
    department: string
  } | null
}

type ApplicationType = {
  id: string
  status: 'pending' | 'approved' | 'rejected'
}

export default function ProjeDetay() {
  const params = useParams()
  const id = params?.id as string
  const { user } = useAuth()
  const supabase = createClient()
  const router = useRouter()

  const [project, setProject] = useState<ProjectType | null>(null)
  const [myApplication, setMyApplication] = useState<ApplicationType | null>(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [applyMessage, setApplyMessage] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      const { data: publicData, error: projectError } = await supabase
        .from('projects')
        .select(`*, profiles:owner_id ( id, username, full_name, university, department )`)
        .eq('id', id)
        .single()

      if (projectError || !publicData) {
        setError('Proje bulunamadı.')
        setLoading(false)
        return
      }

      const projectWithSafe: ProjectType = { ...publicData, safe_details: null } as any

      if (user) {
        const { data: vaultData } = await supabase
          .from('project_vault')
          .select('safe_details')
          .eq('project_id', id)
          .single()
        if (vaultData) projectWithSafe.safe_details = vaultData.safe_details

        const { data: appData } = await supabase
          .from('project_applications')
          .select('id, status')
          .eq('project_id', id)
          .eq('applicant_id', user.id)
          .single()
        if (appData) setMyApplication(appData as any)
      }

      setProject(projectWithSafe)
      setLoading(false)
    }

    if (id) fetchData()
  }, [id, user])

  const handleApply = () => {
    if (!user) { router.push('/login'); return }
    setShowApplyModal(true)
  }

  const submitApply = async () => {
    setApplying(true)
    const { error } = await supabase.from('project_applications').insert({
      project_id: id,
      applicant_id: user!.id,
      message: applyMessage.trim() || null
    })
    if (error) {
      alert('Hata: ' + error.message)
    } else {
      setMyApplication({ id: 'temp', status: 'pending' })
      setShowApplyModal(false)
      setApplyMessage('')
    }
    setApplying(false)
  }

  const handleDelete = () => {
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    setIsDeleting(true)
    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (!error) {
      router.push('/projeler')
      router.refresh()
    } else {
      setIsDeleting(false)
      setShowDeleteModal(false)
      alert('Silme hatası: ' + error.message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#7b7fc8] animate-spin" />
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
        <AlertCircle className="w-12 h-12 text-[#6d7090]" />
        <p className="text-[#8a8da8]">{error || 'Proje bulunamadı.'}</p>
        <Link href="/projeler" className="px-5 py-2.5 bg-[#6366a8] text-white rounded-xl hover:bg-[#7074b8] transition-all text-sm">
          Projelere Dön
        </Link>
      </div>
    )
  }

  const isOwner = user?.id === project.owner_id
  const isSafeUnlocked = !!project.safe_details
  const rawStatus = project.status ? project.status.toLowerCase().trim() : 'active'
  const normalizedStatus = (rawStatus === 'active' || rawStatus === 'yayinda' || rawStatus === '') ? 'active' : rawStatus
  const isProjectActive = normalizedStatus !== 'completed' && normalizedStatus !== 'closed'

  const owner = project.profiles
  const ownerName = owner?.full_name || owner?.username || 'Anonim'
  const ownerInitials = ownerName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="min-h-screen">
      {/* ── Başlık Bandı ── */}
      <div className="bg-[#22242f]/60 backdrop-blur-sm border-b border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/projeler" className="inline-flex items-center gap-2 text-[#7d809e] hover:text-[#b0b3c8] transition-colors text-sm mb-6">
            <ArrowLeft className="w-4 h-4" /> Projelere Dön
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Durum etiketi */}
            <div className="mb-3">
              {normalizedStatus === 'active' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs bg-emerald-400/10 text-emerald-300 border border-emerald-400/15">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Aktif — Üye Aranıyor
                </span>
              )}
              {normalizedStatus === 'completed' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs bg-sky-400/10 text-sky-300 border border-sky-400/15">
                  🏁 Tamamlandı
                </span>
              )}
              {normalizedStatus === 'closed' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs bg-red-400/10 text-red-300 border border-red-400/15">
                  🔴 Alım Kapalı
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl text-[#e0e2ec] mb-4">{project.title}</h1>

            {/* Etiketler */}
            {project.category_tags && project.category_tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {project.category_tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs bg-[#7b7fc8]/10 text-[#a5a8d8] border border-[#7b7fc8]/15">
                    <Tag className="w-3 h-3" /> {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Proje sahibi bilgisi */}
            <div className="flex flex-wrap items-center gap-5 text-sm text-[#7d809e]">
              <Link href={`/profil/${owner?.username || project.owner_id}`} className="flex items-center gap-2 hover:text-[#a5a8d8] transition-colors">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#7b7fc8] to-[#9b7fb8] flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                  {ownerInitials}
                </div>
                <span>{ownerName}</span>
              </Link>
              {owner?.university && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" /> {owner.university}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {new Date(project.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── İçerik ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Sol ana içerik */}
          <div className="lg:col-span-2 space-y-5">

            {/* Proje Vitrini */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="bg-[#2e3044]/60 backdrop-blur-sm rounded-2xl border border-white/[0.07] overflow-hidden"
            >
              <div className="p-6 border-b border-white/[0.06] flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-sky-400/10 flex items-center justify-center">
                  <Globe className="w-4 h-4 text-sky-300" />
                </div>
                <h2 className="text-[#e0e2ec]">Proje Vitrini</h2>
                <span className="text-xs text-[#6d7090] bg-white/[0.04] px-2 py-0.5 rounded-lg ml-1">Herkese Açık</span>
              </div>
              <div className="p-6">
                <p className="text-[#8a8da8] leading-relaxed whitespace-pre-line">{project.showcase_description}</p>
              </div>
            </motion.div>

            {/* Kasa — sadece yetkili ise */}
            {isSafeUnlocked && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="bg-emerald-400/[0.04] backdrop-blur-sm rounded-2xl border border-emerald-400/15 overflow-hidden"
              >
                <div className="p-6 border-b border-emerald-400/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-400/10 flex items-center justify-center">
                      <Lock className="w-4 h-4 text-emerald-300" />
                    </div>
                    <h2 className="text-[#e0e2ec]">Kasa Detayları</h2>
                    <span className="text-xs text-[#6d7090] bg-white/[0.04] px-2 py-0.5 rounded-lg ml-1">Gizli</span>
                  </div>
                  {isOwner && (
                    <span className="text-xs text-emerald-300 bg-emerald-400/10 px-2.5 py-1 rounded-lg border border-emerald-400/15">Sahibi Sensin</span>
                  )}
                  {myApplication?.status === 'approved' && !isOwner && (
                    <span className="text-xs text-emerald-300 bg-emerald-400/10 px-2.5 py-1 rounded-lg border border-emerald-400/15">Erişim İznin Var</span>
                  )}
                </div>
                <div className="p-6">
                  <p className="text-[#8a8da8] leading-relaxed whitespace-pre-line">{project.safe_details}</p>
                </div>
              </motion.div>
            )}

            {/* Kasa kilitliyse bilgi */}
            {!isSafeUnlocked && !isOwner && (
              <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl bg-[#7b7fc8]/[0.06] border border-[#7b7fc8]/10">
                <Shield className="w-4 h-4 text-[#8b8fd8] flex-shrink-0 mt-0.5" />
                <p className="text-sm text-[#8a8da8]">
                  {isProjectActive
                    ? 'Başvurun onaylanınca "Kasa" detayları görünür hale gelir.'
                    : 'Bu proje şu an kapalı.'}
                </p>
              </div>
            )}
          </div>

          {/* Sağ Aksiyon Paneli */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.12 }}
              className="bg-[#2e3044]/60 backdrop-blur-sm rounded-2xl border border-white/[0.07] p-6 sticky top-24"
            >
              {isOwner ? (
                <div className="space-y-3">
                  <h3 className="text-[#e0e2ec] mb-4">Proje Yönetimi</h3>
                  <Link
                    href="/dashboard"
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#6366a8]/15 text-[#a5a8d8] border border-[#6366a8]/25 hover:bg-[#6366a8]/25 transition-all text-sm"
                  >
                    <CheckCircle className="w-4 h-4" /> Başvuruları Yönet
                  </Link>
                  <Link
                    href={`/projeler/${id}/duzenle`}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/[0.08] text-[#8a8da8] hover:bg-white/[0.05] hover:text-[#c5c8d8] transition-all text-sm"
                  >
                    <Edit className="w-4 h-4" /> Projeyi Düzenle
                  </Link>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-400/10 text-red-400 border border-red-400/15 hover:bg-red-400/15 transition-all text-sm disabled:opacity-50"
                  >
                    {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    {isDeleting ? 'Siliniyor...' : 'Projeyi Sil'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-[#e0e2ec]">İlgileniyor musun?</h3>
                  <p className="text-sm text-[#7d809e]">Bu projeye katılmak için başvurabilirsin.</p>

                  {!myApplication && isProjectActive && (
                    <button
                      onClick={handleApply}
                      disabled={applying}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#6366a8] text-white hover:bg-[#7074b8] transition-all shadow-md shadow-[#6366a8]/20 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {applying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      {applying ? 'Gönderiliyor...' : 'Projeye Başvur'}
                    </button>
                  )}

                  {!isProjectActive && (
                    <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-[#6d7090] text-sm">
                      <XCircle className="w-4 h-4" /> Alım Kapalı
                    </div>
                  )}

                  {myApplication?.status === 'pending' && (
                    <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-amber-400/10 border border-amber-400/15 text-amber-300 text-sm">
                      <Clock className="w-4 h-4" /> Başvurun Beklemede
                    </div>
                  )}

                  {myApplication?.status === 'approved' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-400/10 border border-emerald-400/15 text-emerald-300 text-sm">
                        <CheckCircle className="w-4 h-4" /> Başvurun Onaylandı!
                      </div>
                      <Link
                        href={`/mesajlar/${project.owner_id}?projectId=${project.id}`}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#6366a8] text-white hover:bg-[#7074b8] transition-all text-sm"
                      >
                        <MessageSquare className="w-4 h-4" /> Proje Sahibiyle Konuş
                      </Link>
                    </div>
                  )}

                  {myApplication?.status === 'rejected' && (
                    <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-400/10 border border-red-400/15 text-red-400 text-sm">
                      <XCircle className="w-4 h-4" /> Başvurun Reddedildi
                    </div>
                  )}

                  {!user && (
                    <p className="text-xs text-[#6d7090] text-center">
                      <Link href="/login" className="text-[#a5a8d8] hover:underline">Giriş yap</Link> veya{' '}
                      <Link href="/register" className="text-[#a5a8d8] hover:underline">kayıt ol</Link> — başvurmak için giriş yapman gerekiyor.
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          </div>

        </div>
      </div>

      {/* ── Silme Onay Modalı ── */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !isDeleting && setShowDeleteModal(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md bg-[#2a2c3e] border border-white/[0.09] rounded-2xl shadow-2xl shadow-black/40 overflow-hidden"
          >
            <div className="h-1 w-full bg-gradient-to-r from-red-500 to-rose-400" />
            <div className="p-6">
              <div className="flex items-start gap-4 mb-5">
                <div className="w-12 h-12 rounded-xl bg-red-400/10 flex items-center justify-center flex-shrink-0">
                  <TriangleAlert className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h2 className="text-[#e0e2ec] mb-1">Projeyi Sil</h2>
                  <p className="text-sm text-[#7d809e]">
                    Bu işlem geri alınamaz.{' '}
                    <span className="text-[#d0d2dc] font-medium">&quot;{project?.title}&quot;</span>{' '}
                    adlı proje ve tüm başvurular kalıcı olarak silinecek.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-400/[0.06] border border-red-400/10 mb-6">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <p className="text-xs text-red-300">
                  Başvurular, kasa verileri ve mesaj geçmişi silinecektir.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-white/[0.08] text-[#8a8da8] hover:bg-white/[0.05] hover:text-[#d0d2dc] transition-all text-sm disabled:opacity-50"
                >
                  Vazgeç
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/90 text-white hover:bg-red-500 transition-all text-sm shadow-md shadow-red-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isDeleting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Siliniyor...</>
                  ) : (
                    <><Trash2 className="w-4 h-4" /> Evet, Sil</>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── Başvuru Modalı ── */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !applying && setShowApplyModal(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-lg bg-[#2a2c3e] border border-white/[0.09] rounded-2xl shadow-2xl shadow-black/40 overflow-hidden"
          >
            <div className="h-1 w-full bg-gradient-to-r from-[#6366a8] to-[#9b7fb8]" />
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#6366a8]/20 flex items-center justify-center flex-shrink-0">
                  <Send className="w-6 h-6 text-[#9b7fb8]" />
                </div>
                <div>
                  <h2 className="text-[#e0e2ec] mb-1">Projeye Başvur</h2>
                  <p className="text-sm text-[#7d809e]">
                    <span className="text-[#d0d2dc]">&quot;{project?.title}&quot;</span> projesi için başvurunu gönderiyorsun.
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm text-[#d0d2dc] mb-2 font-medium">
                  Projeye katılma nedenin nedir? <span className="text-[#6d7090] font-normal">(Opsiyonel)</span>
                </label>
                <textarea
                  value={applyMessage}
                  onChange={(e) => setApplyMessage(e.target.value)}
                  placeholder="Kendinden bahset, projenin hangi kısmıyla ilgilendiğini anlat..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-white/[0.08] bg-[#22242f]/50 text-[#d0d2dc] placeholder-[#6d7090] text-sm focus:outline-none focus:ring-2 focus:ring-[#7b7fc8]/40 focus:border-transparent transition-all resize-none"
                />
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setShowApplyModal(false)}
                  disabled={applying}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-white/[0.08] text-[#8a8da8] hover:bg-white/[0.05] hover:text-[#d0d2dc] transition-all text-sm disabled:opacity-50"
                >
                  Vazgeç
                </button>
                <button
                  onClick={submitApply}
                  disabled={applying}
                  className="flex-[2] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#6366a8] text-white hover:bg-[#7074b8] transition-all text-sm shadow-md shadow-[#6366a8]/20 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {applying ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Gönderiliyor...</>
                  ) : (
                    <><CheckCircle className="w-4 h-4" /> Başvurumu Gönder</>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}