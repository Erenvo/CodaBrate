'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/app/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { X, Lock, Eye, EyeOff, ArrowLeft, Loader2, Check, AlertCircle, Shield } from 'lucide-react'
import { motion } from 'motion/react'

export default function ProfilDuzenle() {
  const { user, loading } = useAuth()
  const supabase = createClient()
  const router = useRouter()

  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    university: '',
    department: '',
    bio: '',
    github_link: '',
    linkedin_link: '',
    discord_username: '',
    commitment_level: '',
  })
  const [skills, setSkills] = useState<string[]>([])
  const [currentSkill, setCurrentSkill] = useState('')

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showCurrentPass, setShowCurrentPass] = useState(false)
  const [showNewPass, setShowNewPass] = useState(false)
  const [showConfirmPass, setShowConfirmPass] = useState(false)

  const [isSaving, setIsSaving] = useState(false)
  const [isChangingPass, setIsChangingPass] = useState(false)
  const [dataFetched, setDataFetched] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const [passMessage, setPassMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    const getProfile = async () => {
      if (dataFetched || !user) return
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) {
        setFormData({
          username: data.username || '',
          full_name: data.full_name || '',
          university: data.university || '',
          department: data.department || '',
          bio: data.bio || '',
          github_link: data.github_link || '',
          linkedin_link: data.linkedin_link || '',
          discord_username: data.discord_username || '',
          commitment_level: data.commitment_level || '',
        })
        if (data.skills) setSkills(data.skills)
      }
      setDataFetched(true)
    }
    if (!loading && user) getProfile()
  }, [user, loading, dataFetched])

  const handleAddSkill = (e?: React.MouseEvent | React.KeyboardEvent) => {
    e?.preventDefault()
    if (currentSkill.trim() && !skills.includes(currentSkill.trim())) {
      setSkills([...skills, currentSkill.trim()])
      setCurrentSkill('')
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    if (!formData.username?.trim()) {
      setMessage({ text: 'Kullanıcı adı boş bırakılamaz.', type: 'error' })
      return
    }
    setIsSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({ ...formData, skills, updated_at: new Date().toISOString() })
      .eq('id', user?.id as string)
    if (error) {
      setMessage({ text: 'Hata: ' + error.message, type: 'error' })
    } else {
      setMessage({ text: 'Profil başarıyla güncellendi! 🎉', type: 'success' })
      router.refresh()
    }
    setIsSaving(false)
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPassMessage(null)
    if (!user?.email) return
    if (!passwordData.currentPassword) {
      setPassMessage({ text: 'Lütfen mevcut şifrenizi girin.', type: 'error' })
      return
    }
    if (passwordData.newPassword.length < 6) {
      setPassMessage({ text: 'Yeni şifre en az 6 karakter olmalı.', type: 'error' })
      return
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPassMessage({ text: 'Yeni şifreler eşleşmiyor.', type: 'error' })
      return
    }
    setIsChangingPass(true)
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: passwordData.currentPassword
    })
    if (signInError) {
      setPassMessage({ text: 'Mevcut şifre yanlış.', type: 'error' })
      setIsChangingPass(false)
      return
    }
    const { error } = await supabase.auth.updateUser({ password: passwordData.newPassword })
    if (error) {
      setPassMessage({ text: 'Hata: ' + error.message, type: 'error' })
    } else {
      setPassMessage({ text: 'Şifreniz başarıyla değiştirildi! 🔒', type: 'success' })
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    }
    setIsChangingPass(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#7b7fc8] animate-spin" />
      </div>
    )
  }
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
        <p className="text-[#7d809e]">Giriş yapmalısınız.</p>
        <Link href="/login" className="px-5 py-2.5 bg-[#6366a8] text-white rounded-xl hover:bg-[#7074b8] transition-all">
          Giriş Yap
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Üst çubuk */}
      <div className="bg-[#22242f]/60 backdrop-blur-sm border-b border-white/[0.06] sticky top-16 z-30">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href={`/profil/me`} className="p-2 rounded-xl hover:bg-white/[0.05] transition-colors">
              <ArrowLeft className="w-5 h-5 text-[#8a8da8]" />
            </Link>
            <h1 className="text-[#e0e2ec]">Profili Düzenle</h1>
          </div>
          <button
            form="profile-form"
            type="submit"
            disabled={isSaving || !formData.username}
            className="flex items-center gap-2 px-5 py-2 bg-[#6366a8] text-white rounded-xl hover:bg-[#7074b8] transition-all shadow-md shadow-[#6366a8]/20 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-5">

        {/* Profil Bilgileri */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-[#2e3044]/60 backdrop-blur-sm rounded-2xl border border-white/[0.07] overflow-hidden"
        >
          <div className="p-6 border-b border-white/[0.06]">
            <h2 className="text-[#e0e2ec]">Profil Bilgileri</h2>
            <p className="text-xs text-[#6d7090] mt-0.5">Diğer kullanıcılar bu bilgileri görecek</p>
          </div>

          <form id="profile-form" onSubmit={handleUpdateProfile} className="p-6 space-y-5">
            {/* Ad & Kullanıcı adı */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm text-[#b0b3c8]">Ad Soyad</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Adınız Soyadınız"
                  className="w-full px-4 py-2.5 rounded-xl border border-white/[0.08] bg-[#262836] text-[#d0d2dc] placeholder-[#6d7090] focus:outline-none focus:ring-2 focus:ring-[#7b7fc8]/40 focus:border-transparent transition-all text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-[#b0b3c8]">Kullanıcı Adı *</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s/g, '') })}
                  placeholder="kullanici_adi"
                  required
                  className={`w-full px-4 py-2.5 rounded-xl border bg-[#262836] text-[#d0d2dc] placeholder-[#6d7090] focus:outline-none focus:ring-2 focus:ring-[#7b7fc8]/40 focus:border-transparent transition-all text-sm ${!formData.username ? 'border-red-500/50' : 'border-white/[0.08]'}`}
                />
                {!formData.username && (
                  <p className="text-xs text-red-400">Kullanıcı adı boş bırakılamaz</p>
                )}
              </div>
            </div>

            {/* Üniversite & Bölüm */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm text-[#b0b3c8]">Üniversite</label>
                <input
                  type="text"
                  value={formData.university}
                  onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                  placeholder="Üniversite adı"
                  className="w-full px-4 py-2.5 rounded-xl border border-white/[0.08] bg-[#262836] text-[#d0d2dc] placeholder-[#6d7090] focus:outline-none focus:ring-2 focus:ring-[#7b7fc8]/40 focus:border-transparent transition-all text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-[#b0b3c8]">Bölüm</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="Bölüm adı"
                  className="w-full px-4 py-2.5 rounded-xl border border-white/[0.08] bg-[#262836] text-[#d0d2dc] placeholder-[#6d7090] focus:outline-none focus:ring-2 focus:ring-[#7b7fc8]/40 focus:border-transparent transition-all text-sm"
                />
              </div>
            </div>

            {/* Hakkımda */}
            <div className="space-y-1.5">
              <label className="text-sm text-[#b0b3c8]">Hakkımda</label>
              <textarea
                rows={3}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Kendin hakkında kısa bir şeyler yaz..."
                className="w-full px-4 py-3 rounded-xl border border-white/[0.08] bg-[#262836] text-[#d0d2dc] placeholder-[#6d7090] focus:outline-none focus:ring-2 focus:ring-[#7b7fc8]/40 focus:border-transparent resize-none transition-all text-sm"
              />
            </div>

            {/* Taahhüt */}
            <div className="space-y-1.5">
              <label className="text-sm text-[#b0b3c8]">Haftalık Ayırabileceğin Süre</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['Haftada 0-5 Saat', 'Haftada 5-10 Saat', 'Haftada 10-20 Saat', 'Haftada 20+ Saat'].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setFormData({ ...formData, commitment_level: opt })}
                    className={`px-3 py-2.5 rounded-xl text-xs border transition-all duration-200 ${
                      formData.commitment_level === opt
                        ? 'bg-[#6366a8]/15 text-[#a5a8d8] border-[#6366a8]/30'
                        : 'border-white/[0.06] text-[#6d7090] hover:border-white/[0.12] hover:text-[#8a8da8]'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Yetenekler */}
            <div className="space-y-1.5">
              <label className="text-sm text-[#b0b3c8]">Yetenekler</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentSkill}
                  onChange={(e) => setCurrentSkill(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill() } }}
                  placeholder="Örn: React, Python, Figma"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-white/[0.08] bg-[#262836] text-[#d0d2dc] placeholder-[#6d7090] focus:outline-none focus:ring-2 focus:ring-[#7b7fc8]/40 focus:border-transparent transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-4 py-2.5 rounded-xl bg-[#2e3044] border border-white/[0.08] text-[#8a8da8] hover:text-[#c5c8f0] hover:border-white/[0.15] transition-all text-sm"
                >
                  Ekle
                </button>
              </div>
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {skills.map((skill) => (
                    <span key={skill} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#7b7fc8]/10 text-[#a5a8d8] text-sm border border-[#7b7fc8]/15">
                      {skill}
                      <button type="button" onClick={() => setSkills(skills.filter(s => s !== skill))} className="hover:text-[#e07070] transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Sosyal Linkler */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              {[
                { key: 'github_link', label: 'GitHub', placeholder: 'github.com/...' },
                { key: 'linkedin_link', label: 'LinkedIn', placeholder: 'linkedin.com/in/...' },
                { key: 'discord_username', label: 'Discord', placeholder: 'kullanici#0000' },
              ].map(({ key, label, placeholder }) => (
                <div key={key} className="space-y-1.5">
                  <label className="text-sm text-[#b0b3c8]">{label}</label>
                  <input
                    type="text"
                    value={formData[key as keyof typeof formData]}
                    onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                    placeholder={placeholder}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/[0.08] bg-[#262836] text-[#d0d2dc] placeholder-[#6d7090] focus:outline-none focus:ring-2 focus:ring-[#7b7fc8]/40 focus:border-transparent transition-all text-sm"
                  />
                </div>
              ))}
            </div>

            {message && (
              <div className={`flex items-center gap-3 p-4 rounded-xl text-sm ${
                message.type === 'success'
                  ? 'bg-emerald-400/10 border border-emerald-400/20 text-emerald-300'
                  : 'bg-red-500/10 border border-red-500/20 text-red-400'
              }`}>
                {message.type === 'success' ? <Check className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                {message.text}
              </div>
            )}
          </form>
        </motion.div>

        {/* Güvenlik */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-[#2e3044]/60 backdrop-blur-sm rounded-2xl border border-white/[0.07] overflow-hidden"
        >
          <div className="p-6 border-b border-white/[0.06] flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-400/10 flex items-center justify-center">
              <Lock className="w-4 h-4 text-violet-300" />
            </div>
            <div>
              <h2 className="text-[#e0e2ec]">Güvenlik</h2>
              <p className="text-xs text-[#6d7090] mt-0.5">{user.email}</p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="p-6 space-y-5">
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-[#7b7fc8]/[0.06] border border-[#7b7fc8]/10">
              <Shield className="w-4 h-4 text-[#8b8fd8] flex-shrink-0 mt-0.5" />
              <p className="text-xs text-[#8a8da8]">Şifrenizi değiştirmek için önce mevcut şifrenizi doğrulamanız gerekiyor.</p>
            </div>

            <div className="relative space-y-1.5">
              <label className="text-sm text-[#b0b3c8]">Mevcut Şifre</label>
              <input
                type={showCurrentPass ? 'text' : 'password'}
                required
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                placeholder="Mevcut şifreniz"
                className="w-full px-4 py-2.5 pr-10 rounded-xl border border-white/[0.08] bg-[#262836] text-[#d0d2dc] placeholder-[#6d7090] focus:outline-none focus:ring-2 focus:ring-[#7b7fc8]/40 focus:border-transparent transition-all text-sm"
              />
              <button type="button" onClick={() => setShowCurrentPass(!showCurrentPass)} className="absolute right-3 top-9 text-[#6d7090] hover:text-[#a5a8d8] transition-colors">
                {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="relative space-y-1.5">
                <label className="text-sm text-[#b0b3c8]">Yeni Şifre</label>
                <input
                  type={showNewPass ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="En az 6 karakter"
                  className="w-full px-4 py-2.5 pr-10 rounded-xl border border-white/[0.08] bg-[#262836] text-[#d0d2dc] placeholder-[#6d7090] focus:outline-none focus:ring-2 focus:ring-[#7b7fc8]/40 focus:border-transparent transition-all text-sm"
                />
                <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="absolute right-3 top-9 text-[#6d7090] hover:text-[#a5a8d8] transition-colors">
                  {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="relative space-y-1.5">
                <label className="text-sm text-[#b0b3c8]">Yeni Şifre (Tekrar)</label>
                <input
                  type={showConfirmPass ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  placeholder="Şifreyi tekrar girin"
                  className="w-full px-4 py-2.5 pr-10 rounded-xl border border-white/[0.08] bg-[#262836] text-[#d0d2dc] placeholder-[#6d7090] focus:outline-none focus:ring-2 focus:ring-[#7b7fc8]/40 focus:border-transparent transition-all text-sm"
                />
                <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} className="absolute right-3 top-9 text-[#6d7090] hover:text-[#a5a8d8] transition-colors">
                  {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {passMessage && (
              <div className={`flex items-center gap-3 p-4 rounded-xl text-sm ${
                passMessage.type === 'success'
                  ? 'bg-emerald-400/10 border border-emerald-400/20 text-emerald-300'
                  : 'bg-red-500/10 border border-red-500/20 text-red-400'
              }`}>
                {passMessage.type === 'success' ? <Check className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                {passMessage.text}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isChangingPass}
                className="px-5 py-2.5 border border-white/[0.08] rounded-xl text-sm text-[#8a8da8] hover:bg-white/[0.05] hover:text-[#c5c8d8] transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isChangingPass ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                {isChangingPass ? 'Doğrulanıyor...' : 'Şifreyi Güncelle'}
              </button>
            </div>
          </form>
        </motion.div>

      </div>
    </div>
  )
}