// app/components/home/FeaturesSection.tsx
import React from 'react'
import { ShieldCheck, Users, Zap } from 'lucide-react'

export default function FeaturesSection() {
  return (
    <section id="nasilcalisir" className="py-20 px-6 md:px-12 lg:px-24 relative z-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Özellik 1 */}
        <div className="bg-[#0C1B2B]/50 border border-white/10 p-8 rounded-3xl hover:border-indigo-500/50 transition duration-300 group hover:-translate-y-2">
          <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <Users size={28} className="text-indigo-400 group-hover:text-white" />
          </div>
          <h3 className="text-2xl font-semibold mb-4 text-white">Profilini Özelleştir</h3>
          <p className="text-gray-400 leading-relaxed">
            Yeteneklerini, portfolyonu ve ilgi alanlarını detaylıca sergile. 
            Seni en iyi yansıtan profil ile doğru projelere davet al.
          </p>
        </div>

        {/* Özellik 2 */}
        <div className="bg-[#0C1B2B]/50 border border-white/10 p-8 rounded-3xl hover:border-purple-500/50 transition duration-300 group hover:-translate-y-2">
          <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-600 group-hover:text-white transition-colors">
            <ShieldCheck size={28} className="text-purple-400 group-hover:text-white" />
          </div>
          <h3 className="text-2xl font-semibold mb-4 text-white">Vitrin & Kasa</h3>
          <p className="text-gray-400 leading-relaxed">
            Projenin özetini herkese (Vitrin), teknik detaylarını ise sadece güvendiğin ekibine (Kasa) göster.
            Fikrin güvende kalsın.
          </p>
        </div>

        {/* Özellik 3 */}
        <div className="bg-[#0C1B2B]/50 border border-white/10 p-8 rounded-3xl hover:border-blue-500/50 transition duration-300 group hover:-translate-y-2">
          <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <Zap size={28} className="text-blue-400 group-hover:text-white" />
          </div>
          <h3 className="text-2xl font-semibold mb-4 text-white">Üniversite Doğrulama</h3>
          <p className="text-gray-400 leading-relaxed">
            Sadece .edu.tr uzantılı e-postalar ile doğrulanmış gerçek üniversite öğrencileriyle çalış.
            Güvenilir bir ağ kur.
          </p>
        </div>
      </div>
    </section>
  )
}