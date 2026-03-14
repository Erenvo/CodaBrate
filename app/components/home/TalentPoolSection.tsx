// app/components/home/TalentPoolSection.tsx
'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Code2, TrendingUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

// Varsayılan Veriler (Veritabanı boşsa veya yüklenirken)
const DEFAULT_LANGUAGES = [
  { name: 'Python', count: 42, percentage: 85 },
  { name: 'TypeScript', count: 38, percentage: 70 },
  { name: 'JavaScript', count: 35, percentage: 65 },
  { name: 'Dart (Flutter)', count: 24, percentage: 45 },
  { name: 'Go', count: 18, percentage: 30 },
  { name: 'C#', count: 12, percentage: 20 },
]

// Sol taraf için örnek yetenek kartları
const sampleTalents = [
  { 
    id: '1', 
    name: 'Eren A.', 
    role: 'Full Stack Dev', 
    quote: 'Next.js ve Supabase ile ölçeklenebilir sistemler kuruyorum.', 
    image: 'https://placehold.co/40x40/2563eb/FFF?text=E'
  },
  { 
    id: '2', 
    name: 'Zeynep T.', 
    role: 'Mobile Dev', 
    quote: 'Flutter ile hem iOS hem Android için native performanslı uygulamalar geliştiriyorum.', 
    image: 'https://placehold.co/40x40/db2777/FFF?text=Z'
  }
]

export default function TalentPoolSection() {
  const [languages, setLanguages] = useState(DEFAULT_LANGUAGES)
  const supabase = createClient()

  useEffect(() => {
    const fetchLanguageStats = async () => {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('category_tags')
          .not('category_tags', 'is', null)

        if (error) throw error

        if (data && data.length > 0) {
          const allTags = data.map(p => p.category_tags).flat().filter(Boolean) as string[]
          const tagCounts: { [key: string]: number } = {}
          
          allTags.forEach(tag => {
            const normalizedTag = tag.trim() 
            tagCounts[normalizedTag] = (tagCounts[normalizedTag] || 0) + 1
          })

          // En yüksek sayıyı bul (Yüzde hesaplamak için)
          const maxCount = Math.max(...Object.values(tagCounts))

          const sortedStats = Object.entries(tagCounts)
            .sort(([, countA], [, countB]) => countB - countA)
            .slice(0, 6) // İlk 6 dili göster
            .map(([name, count]) => ({
              name,
              count,
              percentage: Math.round((count / maxCount) * 100) // Göreceli yüzde
            }))

          if (sortedStats.length > 0) {
            setLanguages(sortedStats)
          }
        }
      } catch (err) {
        console.error('İstatistik hatası:', err)
      }
    }

    fetchLanguageStats()
  }, [supabase])

  return (
    <section id="yetenekler" className="py-24 px-6 md:px-12 lg:px-24">
      <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        
        {/* --- SOL PANEL: YETENEK VİTRİNİ --- */}
        <div className="space-y-8">
          <div>
            <h2 className="text-4xl font-bold text-white mb-4">Yetenek Havuzu</h2>
            <p className="text-gray-400 text-lg leading-relaxed">
              Sadece bir ilan sitesi değil, yaşayan bir ekosistem. 
              Doğru yeteneği bulmak için binlerce profili analiz ediyoruz.
            </p>
          </div>
          
          <div className="space-y-6">
            {sampleTalents.map((talent) => (
              <div key={talent.id} className="bg-[#0C1B2B] border border-white/10 p-6 rounded-2xl relative hover:border-indigo-500/50 transition group">
                <div className="flex items-start gap-4">
                  <img src={talent.image} alt={talent.name} className="w-12 h-12 rounded-full bg-gray-700 border-2 border-indigo-500/20" />
                  <div>
                    <h4 className="text-white font-bold text-lg">{talent.name}</h4>
                    <span className="text-xs font-semibold bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded-md border border-indigo-500/20">
                      {talent.role}
                    </span>
                    <p className="text-gray-400 mt-3 text-sm italic">"{talent.quote}"</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <Link href="/yetenekler" className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-medium transition">
            Tüm yetenekleri keşfet <ArrowRight size={18} />
          </Link>
        </div>

        {/* --- SAĞ PANEL: POPÜLER DİLLER TABLOSU (Language Stats) --- */}
        <div className="bg-[#0C1B2B]/80 backdrop-blur-xl rounded-[30px] border border-white/5 p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <Code2 className="text-indigo-500" />
                Popüler Diller
              </h3>
              <p className="text-gray-500 text-sm mt-1">Platformdaki projelerin teknoloji dağılımı</p>
            </div>
            <div className="bg-white/5 p-2 rounded-lg border border-white/5">
              <TrendingUp className="text-emerald-400" size={20} />
            </div>
          </div>

          <div className="space-y-5">
            {languages.map((lang, index) => (
              <div key={lang.name} className="group">
                {/* Dil Başlığı ve Sayı */}
                <div className="flex items-center justify-between mb-2 text-sm">
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                      index === 0 ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' : 
                      index === 1 ? 'bg-gray-400/20 text-gray-300 border border-gray-400/30' : 
                      index === 2 ? 'bg-orange-700/20 text-orange-400 border border-orange-700/30' : 
                      'text-gray-600'
                    }`}>
                      {index + 1}
                    </span>
                    <span className="text-gray-200 font-medium group-hover:text-white transition">
                      {lang.name}
                    </span>
                  </div>
                  <span className="text-gray-500 text-xs font-mono group-hover:text-indigo-400 transition">
                    {lang.count} Proje
                  </span>
                </div>

                {/* Progress Bar Arka Planı */}
                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                  {/* Progress Bar Doluluk */}
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${
                      index === 0 ? 'bg-gradient-to-r from-yellow-500 to-amber-600' :
                      'bg-gradient-to-r from-indigo-600 to-purple-600'
                    }`}
                    style={{ width: `${lang.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <Link 
              href="/projeler" 
              className="block w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-sm font-medium transition border border-white/5"
            >
              Tüm İstatistikleri Gör
            </Link>
          </div>
        </div>

      </div>
    </section>
  )
}