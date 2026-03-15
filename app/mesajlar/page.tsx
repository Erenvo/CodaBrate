"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Search,
  Send,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  Shield,
  ChevronLeft,
  CheckCheck,
  Check,
  Lock,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/app/AuthContext";
import { useRouter } from "next/navigation";

const GRADIENTS = [
  "from-sky-400 to-indigo-500",
  "from-emerald-400 to-teal-500",
  "from-violet-400 to-purple-500",
  "from-rose-400 to-pink-500",
  "from-amber-400 to-orange-500",
  "from-[#7b7fc8] to-[#9b7fb8]",
];

interface DbMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
  project_id: string;
}

interface Conversation {
  otherUserId: string;
  name: string;
  username: string;
  avatar: string;
  color: string;
  lastMessage: string;
  time: string;
  unread: number;
  messages: DbMessage[];
}

function formatTimeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "Az önce";
  if (diff < 3600) return `${Math.floor(diff / 60)} dk`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} sa`;
  return `${Math.floor(diff / 86400)} gün`;
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function MesajlarPage() {
  const { user, loading: authLoading } = useAuth();
  const supabase = createClient();
  const router = useRouter();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [showMobileList, setShowMobileList] = useState(true);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user]);

  const fetchConversations = useCallback(async () => {
    if (!user) return;
    const { data: msgs } = await supabase
      .from("messages")
      .select("*")
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order("created_at", { ascending: true });

    if (!msgs) { setLoading(false); return; }

    // Benzersiz karşı tarafları bul
    const otherIds = [...new Set((msgs as DbMessage[]).map((m) =>
      m.sender_id === user.id ? m.receiver_id : m.sender_id
    ))];

    if (otherIds.length === 0) { setLoading(false); return; }

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, username")
      .in("id", otherIds);

    const profileMap = new Map<string, { full_name: string; username: string }>();
    for (const p of (profiles ?? []) as { id: string; full_name: string; username: string }[]) {
      profileMap.set(p.id, p);
    }

    const convs: Conversation[] = otherIds.map((otherId, i) => {
      const convoMsgs = (msgs as DbMessage[]).filter(
        (m) =>
          (m.sender_id === user.id && m.receiver_id === otherId) ||
          (m.sender_id === otherId && m.receiver_id === user.id)
      );
      const last = convoMsgs[convoMsgs.length - 1];
      const profile = profileMap.get(otherId);
      const name = profile?.full_name || profile?.username || "Kullanıcı";
      const unread = convoMsgs.filter((m) => m.sender_id === otherId && !m.is_read).length;
      return {
        otherUserId: otherId,
        name,
        username: profile?.username || "",
        avatar: getInitials(name),
        color: GRADIENTS[i % GRADIENTS.length],
        lastMessage: last?.content ?? "",
        time: last ? formatTimeAgo(last.created_at) : "",
        unread,
        messages: convoMsgs,
      };
    });

    // En son mesaja göre sırala
    convs.sort((a, b) => {
      const aLast = a.messages[a.messages.length - 1]?.created_at ?? "";
      const bLast = b.messages[b.messages.length - 1]?.created_at ?? "";
      return bLast.localeCompare(aLast);
    });

    setConversations(convs);
    if (!selectedId && convs.length > 0) setSelectedId(convs[0].otherUserId);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) fetchConversations();
  }, [user, fetchConversations]);

  // Realtime
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("mesajlar_list")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const newMsg = payload.new as DbMessage;
        if (newMsg.sender_id !== user.id && newMsg.receiver_id !== user.id) return;
        const otherId = newMsg.sender_id === user.id ? newMsg.receiver_id : newMsg.sender_id;
        setConversations((prev) => {
          const existing = prev.find((c) => c.otherUserId === otherId);
          if (existing) {
            return prev.map((c) =>
              c.otherUserId === otherId
                ? {
                    ...c,
                    messages: c.messages.some((m) => m.id === newMsg.id)
                      ? c.messages
                      : [...c.messages, newMsg],
                    lastMessage: newMsg.content,
                    time: "Az önce",
                    unread: newMsg.sender_id === otherId ? c.unread + 1 : c.unread,
                  }
                : c
            );
          }
          // Yeni konuşma — listeyi yenile
          fetchConversations();
          return prev;
        });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, fetchConversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedId, conversations]);

  const selected = conversations.find((c) => c.otherUserId === selectedId);

  const filtered = conversations.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSend = async () => {
    if (!newMessage.trim() || !user || !selected) return;
    const lastMsg = selected.messages[selected.messages.length - 1];
    const projectId = lastMsg?.project_id;
    if (!projectId) {
      alert("Proje bilgisi bulunamadı. Lütfen proje sayfasından 'Proje Sahibiyle Konuş' butonu ile gelin.");
      return;
    }
    setSending(true);
    const content = newMessage.trim();
    setNewMessage("");
    const { data, error } = await supabase
      .from("messages")
      .insert({ project_id: projectId, sender_id: user.id, receiver_id: selected.otherUserId, content })
      .select()
      .single();
    if (error) {
      alert("Gönderilemedi: " + error.message);
      setNewMessage(content);
    } else if (data) {
      setConversations((prev) =>
        prev.map((c) =>
          c.otherUserId === selected.otherUserId
            ? { ...c, messages: [...c.messages, data as DbMessage], lastMessage: content, time: "Az önce" }
            : c
        )
      );
    }
    setSending(false);
  };

  const handleSelectConversation = (id: string) => {
    setSelectedId(id);
    setShowMobileList(false);
    // Local state'te sıfırla
    setConversations((prev) =>
      prev.map((c) => (c.otherUserId === id ? { ...c, unread: 0 } : c))
    );
    // Supabase'de is_read = true yap
    if (user) {
      supabase
        .from("messages")
        .update({ is_read: true })
        .eq("receiver_id", user.id)
        .eq("sender_id", id)
        .eq("is_read", false)
        .then(() => {}); // fire and forget
    }
  };

  if (authLoading || loading) {
    return (
      <div className="h-[calc(100vh-64px)] flex items-center justify-center">
        <Loader2 className="w-7 h-7 text-[#7b7fc8] animate-spin" />
      </div>
    );
  }

  if (!selected && conversations.length === 0) {
    return (
      <div className="h-[calc(100vh-64px)] flex items-center justify-center text-center px-4">
        <div>
          <p className="text-[#7d809e]">Henüz mesajınız yok.</p>
          <p className="text-xs text-[#5a5d7a] mt-2 max-w-xs mx-auto">
            Bir projeye başvurunuz onaylandığında proje sahibiyle mesajlaşabilirsiniz.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] flex overflow-hidden">
      {/* ── Konuşma Listesi ── */}
      <div
        className={`${
          showMobileList ? "flex" : "hidden"
        } md:flex flex-col w-full md:w-[360px] lg:w-[400px] border-r border-white/[0.07] bg-[#262836] flex-shrink-0`}
      >
        {/* Başlık */}
        <div className="p-4 border-b border-white/[0.07]">
          <h2 className="text-xl text-[#e0e2ec] mb-3">Mesajlar</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6d7090]" />
            <input
              type="text"
              placeholder="Kişi ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-white/[0.08] bg-[#2a2c3e] text-[#d0d2dc] placeholder-[#6d7090] text-sm focus:outline-none focus:ring-2 focus:ring-[#7b7fc8]/40 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Liste */}
        <div className="flex-1 overflow-y-auto">
          {filtered.map((conv) => (
            <button
              key={conv.otherUserId}
              onClick={() => handleSelectConversation(conv.otherUserId)}
              className={`w-full flex items-start gap-3 px-4 py-3.5 transition-all duration-150 text-left ${
                selectedId === conv.otherUserId
                  ? "bg-[#7b7fc8]/8 border-l-2 border-l-[#7b7fc8]"
                  : "border-l-2 border-l-transparent hover:bg-white/[0.03]"
              }`}
            >
              <div className="relative flex-shrink-0">
                <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${conv.color} flex items-center justify-center text-white text-sm shadow-md`}>
                  {conv.avatar}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[#d0d2dc] truncate text-sm">{conv.name}</span>
                  <span className="text-xs text-[#6d7090] flex-shrink-0 ml-2">{conv.time}</span>
                </div>
                {conv.username && (
                  <p className="text-xs text-[#7b7fc8] truncate mt-0.5">@{conv.username}</p>
                )}
                <p className="text-sm text-[#6d7090] truncate mt-0.5">{conv.lastMessage}</p>
              </div>
              {conv.unread > 0 && (
                <span className="flex-shrink-0 w-5 h-5 bg-[#6366a8] text-white text-xs rounded-full flex items-center justify-center mt-1">
                  {conv.unread}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Sohbet Alanı ── */}
      <div className={`${showMobileList ? "hidden" : "flex"} md:flex flex-col flex-1 bg-[#262836] min-w-0`}>
        {selected ? (
          <>
            {/* Sohbet Başlığı */}
            <div className="flex items-center justify-between px-4 lg:px-6 py-3.5 border-b border-white/[0.07] bg-[#262836] flex-shrink-0">
              <div className="flex items-center gap-3">
                <button
                  className="md:hidden p-1.5 rounded-lg hover:bg-white/[0.05] -ml-1"
                  onClick={() => setShowMobileList(true)}
                >
                  <ChevronLeft className="w-5 h-5 text-[#8a8da8]" />
                </button>
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${selected.color} flex items-center justify-center text-white text-sm shadow-md`}>
                  {selected.avatar}
                </div>
                <div>
                  <h3 className="text-[#e0e2ec] text-sm">{selected.name}</h3>
                  {selected.username && (
                    <span className="text-xs text-[#7b7fc8]">@{selected.username}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-2 rounded-xl hover:bg-white/[0.05] transition-colors" title="Sesli arama">
                  <Phone className="w-4 h-4 text-[#8a8da8]" />
                </button>
                <button className="p-2 rounded-xl hover:bg-white/[0.05] transition-colors" title="Görüntülü arama">
                  <Video className="w-4 h-4 text-[#8a8da8]" />
                </button>
                <button className="p-2 rounded-xl hover:bg-white/[0.05] transition-colors">
                  <MoreVertical className="w-4 h-4 text-[#8a8da8]" />
                </button>
              </div>
            </div>

            {/* Güvenlik Bandı */}
            <div className="mx-4 lg:mx-6 mt-3 px-4 py-2.5 rounded-xl bg-[#7b7fc8]/[0.06] border border-[#7b7fc8]/10 flex items-center gap-2.5 flex-shrink-0">
              <Shield className="w-4 h-4 text-[#a5a8d8] flex-shrink-0" />
              <p className="text-xs text-[#8a8da8]">Tüm mesajlar şifrelenmiştir.</p>
              <Lock className="w-3.5 h-3.5 text-[#6d7090] flex-shrink-0 ml-auto" />
            </div>

            {/* Mesajlar */}
            <div className="flex-1 overflow-y-auto px-4 lg:px-6 py-4 space-y-1">
              {selected.messages.length === 0 && (
                <p className="text-center text-[#6d7090] text-sm mt-10">Sohbeti başlatın 👋</p>
              )}
              {selected.messages.map((msg) => {
                const isMe = msg.sender_id === user?.id;
                return (
                  <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"} mb-1.5`}>
                    <div className={`max-w-[75%] lg:max-w-[60%] px-4 py-2.5 rounded-2xl ${
                      isMe
                        ? "bg-[#6366a8]/80 text-white rounded-br-md"
                        : "bg-[#2e3044] text-[#d0d2dc] border border-white/[0.06] rounded-bl-md"
                    }`}>
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                      <div className={`flex items-center justify-end gap-1 mt-1 ${isMe ? "text-white/50" : "text-[#6d7090]"}`}>
                        <span className="text-[11px]">
                          {new Date(msg.created_at).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        {isMe && (msg.is_read ? <CheckCheck className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />)}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Mesaj Giriş Alanı */}
            <div className="px-4 lg:px-6 py-3.5 border-t border-white/[0.07] bg-[#262836] flex-shrink-0">
              <div className="flex items-end gap-2">
                <div className="flex gap-1">
                  <button className="p-2 rounded-xl hover:bg-white/[0.05] transition-colors" title="Dosya ekle">
                    <Paperclip className="w-5 h-5 text-[#6d7090]" />
                  </button>
                </div>
                <div className="flex-1">
                  <textarea
                    rows={1}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
                    }}
                    placeholder="Mesajınızı yazın..."
                    className="w-full px-4 py-2.5 rounded-xl border border-white/[0.08] bg-[#2a2c3e] text-[#d0d2dc] placeholder-[#6d7090] text-sm focus:outline-none focus:ring-2 focus:ring-[#7b7fc8]/40 focus:border-transparent resize-none transition-all"
                  />
                </div>
                <button
                  onClick={handleSend}
                  disabled={!newMessage.trim() || sending}
                  className="p-2.5 rounded-xl bg-[#6366a8] text-white hover:bg-[#7074b8] transition-all shadow-md shadow-[#6366a8]/20 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                >
                  {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-[#6d7090] text-sm">Bir konuşma seçin</p>
          </div>
        )}
      </div>
    </div>
  );
}
