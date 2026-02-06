// app/components/talents/TalentHeader.tsx
'use client'
import { Search } from 'lucide-react'

type Props = {
  searchTerm: string
  setSearchTerm: (term: string) => void
}

export function TalentHeader({ searchTerm, setSearchTerm }: Props) {
  return (
    <div className="flex flex-col lg:flex-row justify-between items-end gap-8 mb-12">
      
      {/* Sol Taraf: Başlıklar (Figma'daki Font Boyutları) */}
      <div className="max-w-2xl flex flex-col gap-6">
        <h1 className="text-[#FFFDFD] text-[34px] font-bold font-['Inter'] leading-tight">
          Yetenek Havuzu
        </h1>
        <p className="text-white text-[24px] font-normal font-['Inter'] leading-9">
          Projelerin için en doğru ekip arkadaşlarını keşfet.
        </p>
      </div>
      
      {/* Sağ Taraf: Arama Kutusu (Figma: Beyaz Zemin) */}
      <div className="w-full lg:w-[380px] relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <Search className="text-[#1E1E1E]" size={18} />
        </div>
        <input 
          type="text" 
          placeholder="İsim veya yetenek ara..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full h-[50px] bg-white rounded-full pl-11 pr-6 text-[#1E1E1E] placeholder-[#B3B3B3] text-base font-normal font-['Inter'] focus:outline-none focus:ring-2 focus:ring-[#0088FF] transition shadow-lg"
        />
      </div>
    </div>
  )
}