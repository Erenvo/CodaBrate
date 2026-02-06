// app/projeler/olustur/page.tsx
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/app/AuthContext'
import { useRouter } from 'next/navigation'
import { Lock, X, Check, Loader2, AlertCircle } from 'lucide-react'

export default function ProjeOlustur() {
  const { user, loading } = useAuth()
  const supabase = createClient()
  const router = useRouter()

  const [formData, setFormData] = useState({
    title: '',
    short_description: '', 
    public_details: '',    
    safe_details: '',      
    tagsInput: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    if (!user) {
      setError('Proje oluşturmak için giriş yapmalısınız.')
      setIsSubmitting(false)
      return
    }

    // Etiketleri temizle
    const tagsArray = formData.tagsInput
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)

    // Açıklamaları birleştir
    const combinedDescription = `${formData.short_description}\n\n${formData.public_details}`

    // 1. ADIM: Vitrin (projects) Kaydı
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .insert({
        owner_id: user.id,
        title: formData.title,
        showcase_description: combinedDescription, // DÜZELTİLDİ: DB'deki isme geri döndük
        category_tags: tagsArray,                  // DÜZELTİLDİ: DB'deki isme geri döndük
      })
      .select('id')
      .single()

    if (projectError) {
      setError('Proje kaydedilemedi: ' + projectError.message)
      setIsSubmitting(false)
      return
    }

    if (projectData) {
      // 2. ADIM: Kasa (project_vault) Kaydı
      const { error: vaultError } = await supabase
        .from('project_vault')
        .insert({
          project_id: projectData.id,
          safe_details: formData.safe_details
        })

      if (vaultError) {
        console.error('Kasa hatası:', vaultError)
      }
      
      router.push('/projeler')
      router.refresh()
    }
    
    setIsSubmitting(false)
  }

  // Yükleniyor ekranı
  if (loading) return (
    <div className="min-h-screen bg-[#01001C] flex items-center justify-center text-white">
      <Loader2 className="animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#01001C] py-12 px-4 flex items-center justify-center font-['Inter'] relative overflow-hidden">
      
      {/* Arkaplan Süslemesi */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#01001C] to-[#01001C] -z-10"></div>

      {/* --- ANA KART --- */}
      <div className="w-full max-w-[900px] bg-[#08101A]/90 backdrop-blur-md border border-gray-800 rounded-[30px] p-8 md:p-12 relative shadow-2xl">
        
        {/* Başlık ve Kapat Butonu */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-[#FFFDFD] text-3xl font-bold tracking-tight">
            Yeni Proje Oluştur
          </h1>
          <button 
            onClick={() => router.back()}
            className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition group"
          >
            <X className="text-white group-hover:text-red-400 transition" size={24} />
          </button>
        </div>

        {/* Ayıraç Çizgi */}
        <div className="w-full h-px bg-[#8E8E93] opacity-30 mb-10"></div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          
          {/* Proje Başlığı */}
          <div className="flex flex-col gap-2">
            <label className="text-white text-base font-normal">Proje Başlığı</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full h-[50px] px-4 bg-white rounded-lg border border-[#D9D9D9] text-[#1E1E1E] placeholder-[#757575] focus:outline-none focus:ring-2 focus:ring-[#0088FF] transition"
              placeholder="Örn: Dijital Ajanda"
            />
          </div>

          {/* Kısa Açıklama */}
          <div className="flex flex-col gap-2">
            <label className="text-white text-base font-normal">Kısa Açıklama</label>
            <input
              type="text"
              required
              value={formData.short_description}
              onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
              className="w-full h-[50px] px-4 bg-white rounded-lg border border-[#D9D9D9] text-[#1E1E1E] placeholder-[#757575] focus:outline-none focus:ring-2 focus:ring-[#0088FF] transition"
              placeholder="Listelerde görünecek kısa özet..."
            />
          </div>

          {/* Herkese Açık Detaylar */}
          <div className="flex flex-col gap-2">
            <label className="text-white text-base font-normal">Herkese Açık Detaylar</label>
            <textarea
              required
              rows={4}
              value={formData.public_details}
              onChange={(e) => setFormData({ ...formData, public_details: e.target.value })}
              className="w-full p-4 bg-white rounded-lg border border-[#D9D9D9] text-[#1E1E1E] placeholder-[#757575] focus:outline-none focus:ring-2 focus:ring-[#0088FF] transition resize-none"
              placeholder="Projenin amacı, kullanılan teknolojiler ve aranan ekip arkadaşları..."
            />
            <p className="text-[#B3B3B3] text-[10px] mt-1">Bu kısım tüm kullanıcılar tarafından görülebilir.</p>
          </div>

          {/* Gizli Detaylar */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Lock className="text-[#FFCC00]" size={18} />
              <label className="text-[#FFCC00] text-base font-normal">Gizli Detaylar</label>
            </div>
            <textarea
              required
              rows={4}
              value={formData.safe_details}
              onChange={(e) => setFormData({ ...formData, safe_details: e.target.value })}
              className="w-full p-4 bg-white rounded-lg border border-[#D9D9D9] text-[#1E1E1E] placeholder-[#757575] focus:outline-none focus:ring-2 focus:ring-[#FFCC00] transition resize-none"
              placeholder="Repo linkleri, API anahtarları, tasarım dosyaları, Trello board link vb."
            />
            <p className="text-[#B3B3B3] text-[10px] mt-1">Bu kısım sadece onayladığın ekip üyeleri tarafından görülebilir.</p>
          </div>

          {/* Etiketler */}
          <div className="flex flex-col gap-2">
            <label className="text-white text-base font-normal">Etiketler (Virgül ile ayırın)</label>
            <input
              type="text"
              value={formData.tagsInput}
              onChange={(e) => setFormData({ ...formData, tagsInput: e.target.value })}
              className="w-full h-[50px] px-4 bg-white rounded-lg border border-[#D9D9D9] text-[#1E1E1E] placeholder-[#757575] focus:outline-none focus:ring-2 focus:ring-[#0088FF] transition"
              placeholder="React, Next.js.."
            />
          </div>

          {/* Hata Mesajı */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg flex items-center gap-3 text-sm">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          {/* Butonlar */}
          <div className="flex items-center justify-end gap-4 mt-4">
            
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 bg-[#2C2C2C] rounded-lg text-[#F5F5F5] text-base font-medium hover:bg-[#363636] transition border border-[#2C2C2C]"
            >
              İptal
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-white rounded-lg text-[#1E1E1E] text-base font-medium hover:bg-gray-100 transition flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin w-4 h-4" /> Yayınlanıyor...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" /> Projeyi Yayınla
                </>
              )}
            </button>

          </div>
        </form>
      </div>
    </div>
  )
}