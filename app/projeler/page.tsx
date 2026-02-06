// app/projeler/page.tsx
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Plus, Search, ArrowRight, User } from 'lucide-react'

// Cache'i kapatıp verinin her zaman güncel kalmasını sağlar
export const dynamic = 'force-dynamic'

// Veri Tipi Tanımlaması
type Project = {
  id: string
  title: string
  description: string
  tags: string[]
  category_tags?: string[]
  created_at: string
  owner_id: string
  profiles?: {
    username: string
    full_name: string
    // avatar_url kaldırıldı çünkü veritabanında yok
  }
}

// Filtre Kategorileri
const CATEGORIES = [
  "Machine Learning", "Python", "Data Science", 
  "Web Development", "Flutter", "Cyber Security", 
  "Game Development", "React", "C#", "Swift"
]

export default async function ProjectsPage() {
  const supabase = createClient()

  // Projeleri Çek (Profil bilgisiyle beraber)
  // DÜZELTME: 'avatar_url' sorgudan çıkarıldı.
  const { data: projects, error } = await supabase
    .from('projects')
    .select(`
      *,
      profiles:owner_id (username, full_name)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error("Supabase Hatası:", error.message)
  }

  return (
    // Ana Konteyner: bg-[#01001C] (Koyu Lacivert)
    <main className="min-h-screen bg-[#01001C] text-white font-['Inter'] pb-20">
      
      {/* --- HEADER BÖLÜMÜ --- */}
      <div className="max-w-[1440px] mx-auto px-6 pt-12 pb-8">
        
        {/* Başlık ve Alt Başlık */}
        <div className="flex flex-col gap-4 mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-[#FFFDFD]">
            Projeler
          </h1>
          <p className="text-2xl font-normal text-gray-300">
            Hayalindeki projeyi bul veya kendi ekibini kur.
          </p>
        </div>

        {/* Arama ve Aksiyon Alanı */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          
          {/* Arama Çubuğu */}
          <div className="relative w-full md:w-[320px] group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-[#1E1E1E]" />
            </div>
            <input
              type="text"
              placeholder="Proje veya konu ara..."
              className="block w-full pl-10 pr-4 py-3 bg-white border border-[#D9D9D9] rounded-full text-[#B3B3B3] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0088FF] focus:border-transparent transition-all shadow-sm"
            />
          </div>

          {/* Proje Oluştur Butonu */}
          <Link 
            href="/projeler/olustur" 
            className="flex items-center gap-2 bg-[#0088FF] hover:bg-blue-600 text-[#F5F5F5] px-6 py-3 rounded-full transition shadow-lg shadow-blue-500/20"
          >
            <Plus size={20} />
            <span className="text-base font-medium">Proje Oluştur</span>
          </Link>
        </div>

        {/* Kategori Filtreleri */}
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide mb-8">
          <button className="flex-shrink-0 bg-white text-black px-5 py-2.5 rounded-full text-sm font-medium border border-transparent hover:opacity-90 transition">
            Tümü
          </button>
          {CATEGORIES.map((cat) => (
            <button 
              key={cat}
              className="flex-shrink-0 bg-[#2C2C2C] text-[#F5F5F5] px-5 py-2.5 rounded-full border border-[#2C2C2C] text-sm font-normal hover:border-gray-500 hover:bg-[#363636] transition"
            >
              {cat}
            </button>
          ))}
        </div>

      </div>

      {/* --- PROJE KARTLARI GRID --- */}
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Eğer proje yoksa veya hata varsa */}
          {(!projects || projects.length === 0) && (
             <div className="col-span-full text-center py-20 text-gray-500 flex flex-col items-center">
               <p className="mb-4">Henüz hiç proje oluşturulmamış veya görüntülenemiyor.</p>
               {error && <p className="text-red-400 text-sm">Hata Detayı: {error.message}</p>}
             </div>
          )}

          {/* Projeleri Listele */}
          {projects?.map((project: any) => {
             // Etiket verisini güvenli hale getir
             const displayTags = project.tags || project.category_tags || [];
             
             return (
              <div 
                key={project.id}
                className="group relative flex flex-col h-[380px] bg-[#0E0436]/80 backdrop-blur-sm border border-[#EDEDED]/20 rounded-[30px] p-8 transition hover:border-[#0088FF]/50 hover:shadow-[0_0_30px_-10px_rgba(0,136,255,0.3)] shadow-[inset_0_16px_32px_-4px_rgba(12,12,13,0.1)]"
              >
                {/* Kart Üstü: Kullanıcı Bilgisi */}
                <div className="flex items-center gap-3 mb-6">
                  {/* Avatar olmadığı için direkt User ikonu kullanıyoruz */}
                  <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
                    <User className="text-white w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-white text-sm font-light tracking-wide">
                      {project.profiles?.full_name || project.profiles?.username || 'Anonim Kaptan'}
                    </h3>
                    <span className="text-xs text-gray-400">Project Owner</span>
                  </div>
                </div>

                {/* Kart İçeriği: Başlık ve Açıklama */}
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold text-white mb-3 line-clamp-1 group-hover:text-[#0088FF] transition-colors">
                    {project.title}
                  </h2>
                  <p className="text-[#B3B3B3] text-lg font-light leading-relaxed line-clamp-3 whitespace-pre-line">
                    {project.description || "Açıklama yok."}
                  </p>
                </div>

                {/* Ayıraç Çizgiler */}
                <div className="relative h-px w-full bg-white/10 my-6">
                   <div className="absolute left-0 top-0 h-full w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                </div>

                {/* Kart Altı: Etiketler ve Buton */}
                <div className="flex items-center justify-between mt-auto">
                  
                  {/* Etiketler */}
                  <div className="flex gap-2">
                    {displayTags.slice(0, 2).map((tag: string, index: number) => (
                      <span 
                        key={index} 
                        className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                          index === 0 
                          ? 'bg-[#0088FF] text-white' 
                          : 'bg-white text-black'
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                    {displayTags.length > 2 && (
                      <span className="px-2 py-1.5 rounded-full bg-white/10 text-white text-xs">+</span>
                    )}
                  </div>

                  {/* İncele Linki */}
                  <Link 
                    href={`/projeler/${project.id}`} 
                    className="flex items-center gap-2 text-white hover:text-[#0088FF] transition group/link"
                  >
                    <span className="text-sm font-medium">İncele</span>
                    <div className="bg-white text-black p-1 rounded-full group-hover/link:bg-[#0088FF] group-hover/link:text-white transition">
                       <ArrowRight size={14} />
                    </div>
                  </Link>

                </div>
              </div>
            )
          })}

        </div>
      </div>
    </main>
  )
}