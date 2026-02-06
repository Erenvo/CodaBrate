// app/components/talents/TalentList.tsx
'use client'
import Link from 'next/link'
import { User, ArrowRight } from 'lucide-react'

export type ProfileType = {
  id: string
  username: string
  full_name: string | null
  university: string
  department: string
  bio: string
  skills: string[] | null
  avatar_url?: string
}

type Props = {
  profiles: ProfileType[]
  loading: boolean
}

export function TalentList({ profiles, loading }: Props) {
  
  // Yükleniyor Durumu
  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="h-[260px] bg-[#1B1A33] rounded-[25px] animate-pulse border border-white/5"></div>
      ))}
    </div>
  )

  // Sonuç Yoksa
  if (profiles.length === 0) return (
    <div className="text-center py-20 bg-[#1B1A33] rounded-[25px] border border-dashed border-gray-700">
      <div className="bg-white/10 inline-flex p-4 rounded-full mb-4">
        <User size={32} className="text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-white">Kimse bulunamadı</h3>
      <p className="text-gray-400 mt-2">Farklı bir arama yapmayı dene.</p>
    </div>
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
      {profiles.map((profile) => (
        <Link 
          href={`/profil/${profile.id}`} 
          key={profile.id}
          className="group relative h-[260px] bg-[#1B1A33] rounded-[25px] p-6 flex flex-col justify-between transition-all hover:translate-y-[-5px] hover:shadow-2xl hover:shadow-[#0088FF]/10"
        >
          {/* 1. Üst Kısım: Avatar ve İsim */}
          <div className="flex items-center gap-3">
             {/* Avatar (Figma: Circle Large) */}
             <div className="w-[40px] h-[40px] rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border border-white/10 shrink-0">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[#1E1E1E] font-bold text-lg">
                    {profile.full_name ? profile.full_name[0].toUpperCase() : profile.username[0].toUpperCase()}
                  </span>
                )}
             </div>

             {/* İsim ve Okul */}
             <div className="flex flex-col">
                <span className="text-white text-base font-semibold font-['Inter'] leading-tight truncate max-w-[200px]">
                  {profile.full_name || profile.username}
                </span>
                <span className="text-[#B3B3B3] text-sm font-normal font-['Inter'] truncate max-w-[200px]">
                  {profile.university || 'Üniversite Belirtilmemiş'}
                </span>
             </div>
          </div>

          {/* 2. Orta Kısım: Ayraç Çizgisi */}
          <div className="w-full h-px bg-white/20 my-2"></div>

          {/* 3. Alt Kısım: Biyografi Özeti */}
          <div className="flex-1 flex items-center justify-center text-center px-2">
            <p className="text-white text-base font-normal font-['Inter'] line-clamp-3 opacity-90">
              {profile.bio || "Henüz biyografi eklenmemiş."}
            </p>
          </div>

          {/* 4. İkon: Ok Butonu (Figma: Sağ altta yuvarlak ikon) */}
          <div className="absolute bottom-6 right-6">
             <div className="w-[24px] h-[24px] rounded-full border border-white/30 flex items-center justify-center group-hover:bg-white group-hover:border-white transition-colors">
               <ArrowRight size={14} className="text-white group-hover:text-[#1B1A33] transition-colors" />
             </div>
          </div>

        </Link>
      ))}
    </div>
  )
}