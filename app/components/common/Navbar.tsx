// app/components/common/Navbar.tsx
'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/app/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { Search, Menu, X, User, LogOut, MessageCircle, Bell, Bookmark, Settings, LayoutDashboard } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const { user, loading } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const profileMenuRef = useRef<HTMLDivElement>(null)
  
  const router = useRouter()
  const supabase = createClient()

  // Profil menüsü dışına tıklayınca kapanması için
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [profileMenuRef])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    // Ana Konteyner: Siyah Arkaplan
    <nav className="w-full bg-black border-b border-gray-800/50 relative z-50">
      
      {/* İçerik Hizalama */}
      <div className="max-w-[1440px] mx-auto px-6 h-[72px] flex items-center justify-between">
        
        {/* --- SOL TARAF: Logo ve Linkler --- */}
        <div className="flex items-center gap-12">
          {/* Logo */}
          <Link href="/" className="flex flex-col justify-center">
            <span className="text-white text-xl font-bold font-['Inter'] leading-tight tracking-tight hover:opacity-80 transition">
              CodeBrate
            </span>
          </Link>

          {/* Menü Linkleri (Desktop) */}
          <div className="hidden lg:flex items-center gap-8">
            <Link href="/projeler" className="text-white text-base font-medium font-['Inter'] hover:text-gray-300 transition-colors">
              Projeler
            </Link>
            <Link href="/yetenekler" className="text-white text-base font-medium font-['Inter'] hover:text-gray-300 transition-colors">
              Yetenek Havuzu
            </Link>
            <Link href="/nasil-calisir" className="text-white text-base font-medium font-['Inter'] hover:text-gray-300 transition-colors">
              Nasıl Çalışır?
            </Link>
          </div>
        </div>

        {/* --- SAĞ TARAF: Arama ve Profil --- */}
        <div className="hidden lg:flex items-center gap-6">
          
          {/* Arama Çubuğu */}
          <div className="relative w-[380px] h-[40px]">
            <input 
              type="text" 
              placeholder="Proje, etiket veya konu ara..." 
              className="w-full h-full bg-white rounded-full border border-[#D9D9D9] pl-5 pr-10 text-[#1E1E1E] placeholder-[#B3B3B3] text-sm font-['Inter'] focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <Search className="w-4 h-4 text-[#1E1E1E]" />
            </div>
          </div>

          {/* Auth Durumu */}
          {loading ? (
             <div className="text-white text-[10px] animate-pulse">...</div>
          ) : user ? (
            // --- GİRİŞ YAPMIŞ KULLANICI (Figma Tasarımı) ---
            <div className="flex items-center gap-5">
              
              {/* İkon 1: Mesajlar */}
              <Link href="/mesajlar" className="text-white hover:text-gray-300 transition relative group">
                <MessageCircle size={22} strokeWidth={1.5} />
                {/* Bildirim Noktası (Örnek) */}
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-black"></span>
              </Link>

              {/* İkon 2: Bildirimler */}
              <button className="text-white hover:text-gray-300 transition relative">
                <Bell size={22} strokeWidth={1.5} />
              </button>

              {/* İkon 3: Kaydedilenler */}
              <button className="text-white hover:text-gray-300 transition relative">
                <Bookmark size={22} strokeWidth={1.5} />
              </button>

              {/* Dikey Ayıraç */}
              <div className="w-px h-6 bg-gray-700"></div>

              {/* Avatar & Dropdown Menü */}
              <div className="relative" ref={profileMenuRef}>
                <button 
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-gray-200 transition overflow-hidden border-2 border-transparent focus:border-white"
                >
                  <User size={24} className="text-black" />
                </button>

                {/* Dropdown İçeriği */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 top-12 w-56 bg-[#1E1E1E] border border-gray-700 rounded-xl shadow-2xl py-2 flex flex-col z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-gray-700 mb-2">
                      <p className="text-white text-sm font-semibold truncate">{user.email}</p>
                      <p className="text-gray-400 text-xs">Aktif Üye</p>
                    </div>

                    <Link 
                      href="/dashboard" 
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="px-4 py-2.5 text-gray-200 hover:bg-white/10 hover:text-white text-sm flex items-center gap-3 transition"
                    >
                      <LayoutDashboard size={16} /> Panelim
                    </Link>

                    <Link 
                      href="/profil/duzenle" 
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="px-4 py-2.5 text-gray-200 hover:bg-white/10 hover:text-white text-sm flex items-center gap-3 transition"
                    >
                      <Settings size={16} /> Ayarlar
                    </Link>

                    <div className="h-px bg-gray-700 my-2 mx-2"></div>

                    <button 
                      onClick={handleLogout}
                      className="px-4 py-2.5 text-red-400 hover:bg-red-500/10 hover:text-red-300 text-sm flex items-center gap-3 transition w-full text-left"
                    >
                      <LogOut size={16} /> Çıkış Yap
                    </button>
                  </div>
                )}
              </div>

            </div>
          ) : (
            // --- GİRİŞ YAPMAMIŞ KULLANICI ---
            <div className="flex items-center gap-3">
              <Link href="/login">
                <div className="h-[36px] px-5 rounded-full border border-[#CAC4D0] flex items-center justify-center hover:bg-white/10 transition cursor-pointer group">
                  <span className="text-[#FEF7FF] text-sm font-medium font-['Roboto'] tracking-wide group-hover:text-white">
                    Giriş Yap
                  </span>
                </div>
              </Link>

              <Link href="/register">
                <div className="h-[36px] px-5 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition cursor-pointer shadow-md shadow-white/5">
                  <span className="text-black text-sm font-medium font-['Roboto'] tracking-wide">
                    Kayıt Ol
                  </span>
                </div>
              </Link>
            </div>
          )}
        </div>

        {/* --- MOBİL MENÜ BUTONU --- */}
        <div className="lg:hidden">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white p-1">
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* --- MOBİL MENÜ İÇERİĞİ --- */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-[72px] left-0 w-full bg-black/95 backdrop-blur-md border-t border-gray-800 p-6 flex flex-col gap-6 shadow-2xl h-screen z-40">
          <Link href="/projeler" className="text-gray-300 hover:text-white text-base font-medium" onClick={() => setIsMobileMenuOpen(false)}>Projeler</Link>
          <Link href="/yetenekler" className="text-gray-300 hover:text-white text-base font-medium" onClick={() => setIsMobileMenuOpen(false)}>Yetenek Havuzu</Link>
          <Link href="/nasil-calisir" className="text-gray-300 hover:text-white text-base font-medium" onClick={() => setIsMobileMenuOpen(false)}>Nasıl Çalışır?</Link>
          
          <div className="h-px bg-gray-800 w-full my-2"></div>
          
          {!user && (
            <div className="flex flex-col gap-3">
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full h-10 rounded-full border border-[#CAC4D0] flex items-center justify-center text-white text-sm font-medium">
                Giriş Yap
              </Link>
              <Link href="/register" onClick={() => setIsMobileMenuOpen(false)} className="w-full h-10 rounded-full bg-white flex items-center justify-center text-black text-sm font-medium">
                Kayıt Ol
              </Link>
            </div>
          )}
          
          {user && (
             <div className="flex flex-col gap-4">
               <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 text-white">
                 <LayoutDashboard size={20} /> Panelim
               </Link>
               <Link href="/mesajlar" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 text-white">
                 <MessageCircle size={20} /> Mesajlar
               </Link>
               <Link href="/profil/duzenle" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 text-white">
                 <Settings size={20} /> Ayarlar
               </Link>
               <button onClick={handleLogout} className="flex items-center gap-3 text-red-400">
                 <LogOut size={20} /> Çıkış Yap
               </button>
             </div>
          )}
        </div>
      )}
    </nav>
  )
}