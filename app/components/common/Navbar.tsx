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
    // DEĞİŞİKLİK BURADA: Glassmorphism (Buzlu Cam) ve Sticky (Sabit) özelliği
    <nav className="w-full bg-[#01001C]/80 backdrop-blur-md border-b border-white/5 relative z-50 sticky top-0 transition-all duration-300">
      
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
            <Link href="/projeler" className="text-white/80 hover:text-white text-base font-medium font-['Inter'] transition-colors">
              Projeler
            </Link>
            <Link href="/yetenekler" className="text-white/80 hover:text-white text-base font-medium font-['Inter'] transition-colors">
              Yetenek Havuzu
            </Link>
            <Link href="/nasil-calisir" className="text-white/80 hover:text-white text-base font-medium font-['Inter'] transition-colors">
              Nasıl Çalışır?
            </Link>
          </div>
        </div>

        {/* --- SAĞ TARAF: Arama ve Profil --- */}
        <div className="hidden lg:flex items-center gap-6">
          
          {/* Arama Çubuğu */}
          <div className="relative w-[300px] xl:w-[380px] h-[40px] group">
            <input 
              type="text" 
              placeholder="Proje, etiket veya konu ara..." 
              className="w-full h-full bg-white/5 border border-white/10 rounded-full pl-5 pr-10 text-white placeholder-gray-400 text-sm font-['Inter'] focus:outline-none focus:bg-white/10 focus:border-[#0088FF]/50 transition-all"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <Search className="w-4 h-4 text-gray-400 group-focus-within:text-[#0088FF] transition-colors" />
            </div>
          </div>

          {/* Auth Durumu */}
          {loading ? (
             <div className="w-8 h-8 rounded-full bg-white/5 animate-pulse"></div>
          ) : user ? (
            // --- GİRİŞ YAPMIŞ KULLANICI ---
            <div className="flex items-center gap-5">
              
              {/* İkonlar */}
              <Link href="/mesajlar" className="text-gray-300 hover:text-white transition relative group">
                <MessageCircle size={20} strokeWidth={1.5} />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-[#01001C]"></span>
              </Link>

              <button className="text-gray-300 hover:text-white transition">
                <Bell size={20} strokeWidth={1.5} />
              </button>

              <button className="text-gray-300 hover:text-white transition">
                <Bookmark size={20} strokeWidth={1.5} />
              </button>

              {/* Dikey Ayıraç */}
              <div className="w-px h-6 bg-white/10"></div>

              {/* Avatar & Dropdown Menü */}
              <div className="relative" ref={profileMenuRef}>
                <button 
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="w-9 h-9 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center hover:ring-2 hover:ring-[#0088FF]/50 transition overflow-hidden border border-white/10"
                >
                  <User size={18} className="text-white" />
                </button>

                {/* Dropdown İçeriği */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 top-12 w-60 bg-[#1B1A33] border border-white/10 rounded-xl shadow-2xl py-2 flex flex-col z-50 animate-in fade-in slide-in-from-top-2 duration-200 backdrop-blur-xl">
                    <div className="px-4 py-3 border-b border-white/5 mb-2">
                      <p className="text-white text-sm font-semibold truncate">{user.email}</p>
                      <p className="text-[#0088FF] text-xs mt-0.5">Aktif Üye</p>
                    </div>

                    <Link 
                      href="/dashboard" 
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="px-4 py-2.5 text-gray-300 hover:bg-white/5 hover:text-white text-sm flex items-center gap-3 transition"
                    >
                      <LayoutDashboard size={16} /> Panelim
                    </Link>

                    <Link 
                      href="/profil/duzenle" 
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="px-4 py-2.5 text-gray-300 hover:bg-white/5 hover:text-white text-sm flex items-center gap-3 transition"
                    >
                      <Settings size={16} /> Ayarlar
                    </Link>

                    <div className="h-px bg-white/5 my-2 mx-2"></div>

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
                <div className="h-[36px] px-6 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/5 transition cursor-pointer group">
                  <span className="text-white text-sm font-medium tracking-wide group-hover:text-white/90">
                    Giriş Yap
                  </span>
                </div>
              </Link>

              <Link href="/register">
                <div className="h-[36px] px-6 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition cursor-pointer shadow-[0_0_15px_-3px_rgba(255,255,255,0.3)] hover:shadow-[0_0_20px_-3px_rgba(255,255,255,0.5)]">
                  <span className="text-black text-sm font-bold tracking-wide">
                    Kayıt Ol
                  </span>
                </div>
              </Link>
            </div>
          )}
        </div>

        {/* --- MOBİL MENÜ BUTONU --- */}
        <div className="lg:hidden">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white p-2 hover:bg-white/5 rounded-full transition">
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* --- MOBİL MENÜ İÇERİĞİ --- */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-[72px] left-0 w-full bg-[#01001C]/95 backdrop-blur-xl border-t border-white/10 p-6 flex flex-col gap-6 shadow-2xl h-[calc(100vh-72px)] z-40 overflow-y-auto">
          <Link href="/projeler" className="text-gray-300 hover:text-white text-lg font-medium" onClick={() => setIsMobileMenuOpen(false)}>Projeler</Link>
          <Link href="/yetenekler" className="text-gray-300 hover:text-white text-lg font-medium" onClick={() => setIsMobileMenuOpen(false)}>Yetenek Havuzu</Link>
          <Link href="/nasil-calisir" className="text-gray-300 hover:text-white text-lg font-medium" onClick={() => setIsMobileMenuOpen(false)}>Nasıl Çalışır?</Link>
          
          <div className="h-px bg-white/10 w-full my-2"></div>
          
          {!user && (
            <div className="flex flex-col gap-4">
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full h-12 rounded-full border border-white/20 flex items-center justify-center text-white text-base font-medium">
                Giriş Yap
              </Link>
              <Link href="/register" onClick={() => setIsMobileMenuOpen(false)} className="w-full h-12 rounded-full bg-white flex items-center justify-center text-black text-base font-bold">
                Kayıt Ol
              </Link>
            </div>
          )}
          
          {user && (
             <div className="flex flex-col gap-4">
               <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 text-white text-lg p-2 hover:bg-white/5 rounded-lg">
                 <LayoutDashboard size={22} /> Panelim
               </Link>
               <Link href="/mesajlar" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 text-white text-lg p-2 hover:bg-white/5 rounded-lg">
                 <MessageCircle size={22} /> Mesajlar
               </Link>
               <Link href="/profil/duzenle" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 text-white text-lg p-2 hover:bg-white/5 rounded-lg">
                 <Settings size={22} /> Ayarlar
               </Link>
               <button onClick={handleLogout} className="flex items-center gap-3 text-red-400 text-lg p-2 hover:bg-red-500/10 rounded-lg w-full text-left">
                 <LogOut size={22} /> Çıkış Yap
               </button>
             </div>
          )}
        </div>
      )}
    </nav>
  )
}