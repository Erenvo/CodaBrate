// app/components/home/HeroSection.tsx
import React from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function HeroSection() {
  return (
    <section className="relative w-full pt-32 pb-20 px-6 md:px-12 lg:px-24 flex flex-col justify-center min-h-[85vh]">
      {/* Arka Plan Efektleri */}
      <div className="absolute top-0 right-0 w-full h-full opacity-40 pointer-events-none z-0 overflow-hidden">
        <div className="w-[500px] h-[500px] bg-indigo-900/40 rounded-full blur-[120px] absolute -top-20 -right-20 animate-pulse"></div>
        <div className="w-[400px] h-[400px] bg-purple-900/30 rounded-full blur-[100px] absolute bottom-0 left-0"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center md:text-left md:mx-0">
        <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-8 font-inter">
          Doğru ekip, <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
            doğru fikirle buluşsun.
          </span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 max-w-2xl leading-relaxed mb-10 mx-auto md:mx-0">
          Üniversite öğrencileri için projeni paylaş, yetenekleri filtrele, güvenli bir şekilde ekip kur. 
          <span className="text-white font-semibold"> "Vitrin"</span> ve <span className="text-white font-semibold">"Kasa"</span> ile fikirlerini koru.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
          <Link 
            href="/auth/register" 
            className="px-8 py-4 bg-white text-black font-semibold rounded-full text-lg hover:bg-gray-200 transition shadow-[0_0_20px_rgba(255,255,255,0.3)] flex items-center justify-center gap-2"
          >
            Hemen Başla <ArrowRight size={20} />
          </Link>
          <Link 
            href="/projeler" 
            className="px-8 py-4 bg-transparent border border-gray-600 text-white font-medium rounded-full text-lg hover:border-white hover:bg-white/5 transition flex items-center justify-center"
          >
            Projeleri Keşfet
          </Link>
        </div>

        {/* Güven Rozetleri - Alt Kısım */}
        <div className="mt-12 flex flex-wrap gap-4 justify-center md:justify-start text-sm text-gray-400">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
            🔒 Vitrin & Kasa
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
            🌍 .edu.tr Doğrulama
          </div>
        </div>
      </div>
    </section>
  )
}