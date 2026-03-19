// app/mesajlar/[id]/page.tsx
'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/app/AuthContext'
import Link from 'next/link'
import { Send, ArrowLeft, Loader2 } from 'lucide-react'

// Tip Tanımları
type MessageType = {
  id: string
  content: string
  sender_id: string
  receiver_id: string
  created_at: string
  is_read: boolean
  project_id: string
}

type ProfileType = {
  username: string
  full_name: string
}

export default function SohbetEkrani() {
  const params = useParams()
  // ID'yi güvenli alıyoruz
  const otherUserId = (Array.isArray(params?.id) ? params?.id[0] : params?.id) as string

  const searchParams = useSearchParams()
  const projectIdParam = searchParams.get('projectId')

  const { user } = useAuth()
  const supabase = createClient()
  
  const [messages, setMessages] = useState<MessageType[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [otherUser, setOtherUser] = useState<ProfileType | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    // DOM'un güncellenmesi için ufak bir bekleme (Next.js batch updates)
    const timeout = setTimeout(() => {
      scrollToBottom()
    }, 100)
    return () => clearTimeout(timeout)
  }, [messages])

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !otherUserId) return

      // 1. Karşı tarafı çek
      const { data: profile } = await supabase
        .from('profiles')
        .select('username, full_name')
        .eq('id', otherUserId)
        .single()
      
      if (profile) setOtherUser(profile)

      // 2. Mesajları çek
      const { data: msgs } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true })

      if (msgs) {
        setMessages(msgs as MessageType[]) 
        
        if (msgs.length > 0) {
          setActiveProjectId(msgs[msgs.length - 1].project_id)
        } 
        else if (projectIdParam) {
          setActiveProjectId(projectIdParam)
        }
      }
      setLoading(false)
    }

    if (user) fetchData()

    // 3. Realtime Abonelik (DÜZELTİLDİ: Duplicate Kontrolü)
    const channel = supabase
      .channel('chat_room')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const newMsg = payload.new as MessageType
        
        // Sadece bu sohbetle ilgiliyse...
        if (
          (newMsg.sender_id === otherUserId && newMsg.receiver_id === user?.id) ||
          (newMsg.sender_id === user?.id && newMsg.receiver_id === otherUserId)
        ) {
          // EĞER MESAJ LİSTEDE YOKSA EKLE (Duplicate önleme)
          setMessages((prev) => {
            if (prev.some(m => m.id === newMsg.id)) return prev
            return [...prev, newMsg]
          })
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }

  }, [user, otherUserId, projectIdParam, supabase])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !user || !activeProjectId) {
      if (!activeProjectId) alert("Hata: Hangi proje için konuştuğunuz belirlenemedi. Lütfen proje sayfasından 'İletişime Geç' diyerek gelin.")
      return
    }

    setSending(true)
    const msgContent = newMessage.trim()
    setNewMessage('') 

    // 👇 DÜZELTME: Veritabanına yaz ve yazılan veriyi GERİ AL (.select)
    const { data, error } = await supabase
      .from('messages')
      .insert({
        project_id: activeProjectId,
        sender_id: user.id,
        receiver_id: otherUserId,
        content: msgContent
      })
      .select() // Gönderilen mesajın ID'sini ve tarihini geri getir
      .single()

    if (error) {
      alert('Gönderilemedi: ' + error.message)
      setNewMessage(msgContent)
      console.error("Mesaj gönderme hatası:", error)
    } else if (data) {
      console.log("Mesaj başarıyla veritabanına eklendi, ekrana yansıtılıyor...", data)
      // 👇 EKRANA HEMEN EKLE (Duplicate önleme)
      setMessages((prev) => {
        if (prev.some(m => m.id === data.id)) return prev;
        return [...prev, data as MessageType];
      })
    }
    setSending(false)
  }

  if (loading) return (
    <div className="h-[calc(100vh-64px)] flex items-center justify-center">
      <Loader2 className="w-7 h-7 text-[#7b7fc8] animate-spin" />
    </div>
  )

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-[#262836] text-[#d0d2dc]">
      
      {/* HEADER */}
      <div className="bg-[#22242f]/80 backdrop-blur-md border-b border-white/[0.06] p-4 flex items-center gap-4 sticky top-0 z-10">
        <Link href="/mesajlar" className="text-[#8a8da8] hover:text-[#d0d2dc] transition">
          <ArrowLeft size={24} />
        </Link>
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#7b7fc8] to-[#9b7fb8] flex items-center justify-center text-white font-bold">
          {otherUser?.full_name ? otherUser.full_name.slice(0, 2).toUpperCase() : otherUser?.username?.slice(0, 2).toUpperCase() || '?'}
        </div>
        <div>
          <h2 className="text-[#e0e2ec]">{otherUser?.full_name || otherUser?.username}</h2>
          <p className="text-xs text-[#7b7fc8]">@{otherUser?.username}</p>
        </div>
      </div>

      {/* MESAJLAR */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-[#6d7090] mt-10">
            <p>Sohbeti başlat 👋</p>
            <p className="text-xs mt-1">Bu mesajlar gizlidir ve sadece ikiniz arasında kalır.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === user?.id
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                  isMe 
                    ? 'bg-[#6366a8]/80 text-white rounded-br-md' 
                    : 'bg-[#2e3044] text-[#d0d2dc] border border-white/[0.06] rounded-bl-md'
                }`}>
                  <p className="leading-relaxed">{msg.content}</p>
                  <span className={`text-[10px] block text-right mt-1 ${isMe ? 'text-white/40' : 'text-[#6d7090]'}`}>
                    {new Date(msg.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <form onSubmit={handleSendMessage} className="bg-[#22242f]/80 backdrop-blur-md border-t border-white/[0.06] p-4 flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Bir mesaj yaz..."
          className="flex-1 bg-[#2a2c3e] border border-white/[0.08] text-[#d0d2dc] placeholder-[#6d7090] rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-[#7b7fc8]/40 focus:border-transparent transition-all text-sm"
        />
        <button 
          type="submit" 
          disabled={sending || !newMessage.trim()}
          className="bg-[#6366a8] hover:bg-[#7074b8] text-white p-3 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-[#6366a8]/20"
        >
          {sending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
        </button>
      </form>

    </div>
  )
}