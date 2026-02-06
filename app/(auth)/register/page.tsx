// app/(auth)/register/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Eye, EyeOff, Check, X, Loader2 } from 'lucide-react'

export default function RegisterPage() {
  // --- MEVCUT MANTIK (LOGIC) ---
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('') 
  const [username, setUsername] = useState('')
  const [usernameStatus, setUsernameStatus] = useState<'available' | 'taken' | null>(null)
  const [checkingUsername, setCheckingUsername] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const supabase = createClient()

  // Username kontrolü
  useEffect(() => {
    const checkUsername = async () => {
      if (!username || username.length < 3) {
        setUsernameStatus(null)
        return
      }

      setCheckingUsername(true)
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username.toLowerCase())
        .single()

      setUsernameStatus(existingUser ? 'taken' : 'available')
      setCheckingUsername(false)
    }

    const debounceTimer = setTimeout(checkUsername, 500)
    return () => clearTimeout(debounceTimer)
  }, [username])

  const validateEmailDomain = (email: string) => {
    // Geçici olarak her emaile izin veriyoruz, kısıtlamayı sonra açabilirsin:
    // return email.endsWith('.edu.tr')
    return true 
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)

    if (!validateEmailDomain(email)) {
      setError('Kayıt olmak için .edu.tr uzantılı bir üniversite e-postası kullanmalısınız.')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor.')
      setLoading(false)
      return
    }

    if (usernameStatus === 'taken') {
      setError('Bu kullanıcı adı alınmış.')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username.toLowerCase(), 
          full_name: fullName,
        },
      },
    })

    if (error) {
      setError(error.message)
    } else {
      setMessage('Kayıt başarılı! Lütfen e-postanı kontrol et.')
      // Formu temizle
      setEmail('')
      setPassword('')
      setConfirmPassword('')
      setUsername('')
      setFullName('')
    }
    setLoading(false)
  }

  // --- YENİ TASARIM (UI) ---
  return (
    // Ana Arkaplan (Figma: #01001C -> bg-slate-950)
    <div className="min-h-screen w-full bg-[#01001C] flex items-center justify-center relative overflow-hidden font-['Inter']">
      
      {/* Arkaplan Süslemeleri (Opsiyonel blur efektleri eklenebilir) */}
      
      {/* KART YAPISI */}
      {/* Figma: w-[501px] h-[594px] bg-slate-900 rounded-3xl opacity-80 */}
      <div className="w-full max-w-[500px] bg-[#1B1A33] bg-opacity-90 rounded-3xl shadow-2xl border border-gray-800/50 p-8 md:p-12 z-10 backdrop-blur-sm mx-4">
        
        {/* Başlık */}
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-stone-300 text-2xl font-semibold tracking-tight shadow-black drop-shadow-md">
            Hesap Oluştur
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleRegister} className="flex flex-col gap-5">
          
          {/* Ad Soyad */}
          <div className="flex flex-col gap-2">
             {/* Input: bg-neutral-400 (#999999) olarak verilmiş ama yazı okunabilirliği için biraz şeffaflık veya koyuluk gerekebilir. 
                 Tasarımı korumak için neutral-400 verdim ama text rengini ayarladım. */}
            <div className="relative group">
              <input
                type="text"
                placeholder="Ad Soyad"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full h-12 px-4 bg-[#999999] rounded-lg text-[#1B1A33] placeholder-[#4a4a4a] outline-none focus:ring-2 focus:ring-indigo-500 transition font-medium"
              />
            </div>
          </div>

          {/* Kullanıcı Adı */}
          <div className="flex flex-col gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Kullanıcı Adı"
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/\s/g, ''))}
                required
                className="w-full h-12 px-4 bg-[#999999] rounded-lg text-[#1B1A33] placeholder-[#4a4a4a] outline-none focus:ring-2 focus:ring-indigo-500 transition font-medium pr-10"
              />
              {/* Durum İkonu */}
              <div className="absolute right-3 top-3.5">
                {checkingUsername && <Loader2 className="animate-spin text-gray-700" size={20} />}
                {!checkingUsername && usernameStatus === 'available' && <Check className="text-green-700" size={20} />}
                {!checkingUsername && usernameStatus === 'taken' && <X className="text-red-700" size={20} />}
              </div>
            </div>
            {/* Hata Mesajı */}
            {usernameStatus === 'taken' && <span className="text-red-400 text-xs ml-1">Bu kullanıcı adı alınmış.</span>}
          </div>

          {/* E-posta */}
          <div className="flex flex-col gap-2">
            <input
              type="email"
              placeholder="Üniversite e-postan (@edu.tr)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-12 px-4 bg-[#999999] rounded-lg text-[#1B1A33] placeholder-[#4a4a4a] outline-none focus:ring-2 focus:ring-indigo-500 transition font-medium"
            />
          </div>

          {/* Şifre */}
          <div className="flex flex-col gap-2 relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Şifre"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full h-12 px-4 bg-[#999999] rounded-lg text-[#1B1A33] placeholder-[#4a4a4a] outline-none focus:ring-2 focus:ring-indigo-500 transition font-medium pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3.5 text-gray-700 hover:text-black transition"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Şifre Tekrar */}
          <div className="flex flex-col gap-2 relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Şifre Tekrar"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full h-12 px-4 bg-[#999999] rounded-lg text-[#1B1A33] placeholder-[#4a4a4a] outline-none focus:ring-2 focus:ring-indigo-500 transition font-medium pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-3.5 text-gray-700 hover:text-black transition"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Hata / Başarı Mesajları */}
          {error && (
            <div className="bg-red-500/20 text-red-200 text-sm p-3 rounded-lg border border-red-500/30 text-center">
              {error}
            </div>
          )}
          {message && (
            <div className="bg-green-500/20 text-green-200 text-sm p-3 rounded-lg border border-green-500/30 text-center">
              {message}
            </div>
          )}

          {/* Kayıt Ol Butonu */}
          {/* Figma: bg-Background-Brand-Default (#2C2C2C) + border */}
          <div className="flex justify-center mt-2">
            <button
              type="submit"
              disabled={loading}
              className="group relative px-8 py-3 bg-[#2C2C2C] rounded-[20px] shadow-lg border border-[#2C2C2C] hover:border-gray-500 hover:bg-[#363636] transition-all duration-300 w-full md:w-auto"
            >
              <span className="text-[#F5F5F5] text-base font-normal font-['Inter']">
                {loading ? 'İşleniyor...' : 'Kayıt Ol'}
              </span>
            </button>
          </div>

        </form>

        {/* Alt Linkler */}
        <div className="flex justify-center items-center gap-2 mt-8">
          <span className="text-stone-400 text-sm font-semibold shadow-black drop-shadow-sm">
            Zaten hesabın var mı?
          </span>
          <Link href="/login" className="text-gray-200 text-sm font-semibold hover:text-white transition shadow-black drop-shadow-sm border-b border-transparent hover:border-white">
            Giriş Yap
          </Link>
        </div>

      </div>
    </div>
  )
}