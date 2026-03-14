// app/components/home/ProjectsSection.tsx
import React from 'react'
import Link from 'next/link'
import { ArrowRight, Search } from 'lucide-react'

type Project = {
  id: string
  title: string
  summary: string
  tags: string[]
  owner: string
}

interface ProjectsSectionProps {
  projects: Project[]
}

export default function ProjectsSection({ projects }: ProjectsSectionProps) {
  return (
    <section id="projeler" className="py-20 px-6 md:px-12 lg:px-24 bg-[#0C1B2B]/30">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
        <div>
          <h2 className="text-4xl font-bold mb-4 text-white">Öne Çıkan Projeler</h2>
          <p className="text-gray-400">Bu hafta en çok ilgi gören ve ekip arkadaşı arayan projeler.</p>
        </div>
        <Link href="/projeler" className="hidden md:flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition group">
          Tümünü Gör <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((p) => (
          <div key={p.id} className="bg-white rounded-3xl p-6 text-black relative group hover:-translate-y-2 transition duration-300 shadow-xl border border-transparent hover:border-indigo-500/30">
            
            {/* Üniversite Rozeti */}
            <div className="absolute top-6 right-6">
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md font-bold uppercase tracking-wider border border-gray-200">
                {p.owner}
              </span>
            </div>
            
            {/* İkon */}
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Search size={24} />
            </div>
            
            <h3 className="text-xl font-bold mb-3 group-hover:text-indigo-600 transition">{p.title}</h3>
            <p className="text-gray-600 text-sm mb-6 line-clamp-3 leading-relaxed">
              {p.summary}
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
              {p.tags.map((t) => (
                <span key={t} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium border border-gray-200">
                  {t}
                </span>
              ))}
            </div>

            <Link 
              href={`/projeler/${p.id}`} 
              className="w-full block text-center bg-black text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition shadow-lg shadow-black/20"
            >
              İlgileniyorum
            </Link>
          </div>
        ))}
      </div>
      
      <div className="mt-8 text-center md:hidden">
        <Link href="/projeler" className="inline-flex items-center gap-2 text-indigo-400 font-medium">
          Tüm Projeleri Gör <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  )
}