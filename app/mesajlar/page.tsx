"use client";

import { useState, useRef, useEffect } from "react";
import {
  Search,
  Send,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  Shield,
  ChevronLeft,
  Image,
  CheckCheck,
  Check,
  Lock,
  FileText,
  Clock,
} from "lucide-react";

interface Message {
  id: number;
  sender: "me" | "other";
  text: string;
  time: string;
  read: boolean;
}

interface Conversation {
  id: number;
  name: string;
  avatar: string;
  color: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  project?: string;
  messages: Message[];
}

const conversations: Conversation[] = [
  {
    id: 1,
    name: "Ahmet Demir",
    avatar: "AD",
    color: "from-sky-400 to-indigo-500",
    lastMessage: "NDA belgesini inceledim, uygun görünüyor.",
    time: "5 dk",
    unread: 2,
    online: true,
    project: "Sürdürülebilir Moda Pazaryeri",
    messages: [
      {
        id: 1,
        sender: "other",
        text: "Merhaba Elif! Projenizi vitrin sayfasında gördüm, çok ilgimi çekti.",
        time: "14:20",
        read: true,
      },
      {
        id: 2,
        sender: "me",
        text: "Merhaba Ahmet! Teşekkürler, hangi rolde katılmak istersiniz?",
        time: "14:22",
        read: true,
      },
      {
        id: 3,
        sender: "other",
        text: "UI/UX tasarımı konusunda deneyimim var, o rolde katılabilirim. Daha önce 3 farklı e-ticaret projesi üzerinde çalıştım.",
        time: "14:25",
        read: true,
      },
      {
        id: 4,
        sender: "me",
        text: "Harika! Portfolyonuzu inceledim, çok başarılı çalışmalar yapmışsınız. Size kasa erişimi sağlamak için NDA belgesini gönderiyorum.",
        time: "14:30",
        read: true,
      },
      {
        id: 5,
        sender: "other",
        text: "Tabii, hemen inceleyelim. Güvenlik konusundaki yaklaşımlarınız çok profesyonel.",
        time: "14:32",
        read: true,
      },
      {
        id: 6,
        sender: "me",
        text: "Teşekkürler! NDA imzalandıktan sonra projenin detaylarına erişim sağlayabilirsiniz. İşte belge:",
        time: "14:35",
        read: true,
      },
      {
        id: 7,
        sender: "other",
        text: "NDA belgesini inceledim, uygun görünüyor.",
        time: "14:40",
        read: false,
      },
      {
        id: 8,
        sender: "other",
        text: "İmzalayıp geri gönderdim, artık başlayabiliriz!",
        time: "14:41",
        read: false,
      },
    ],
  },
  {
    id: 2,
    name: "Zeynep Kara",
    avatar: "ZK",
    color: "from-emerald-400 to-teal-500",
    lastMessage:
      "Branch korumasını aktif ettim, artık merge için onay gerekiyor.",
    time: "1 sa",
    unread: 0,
    online: true,
    project: "Akıllı Sera İzleme Sistemi",
    messages: [
      {
        id: 1,
        sender: "other",
        text: "Merhaba! IoT sensörlerinden gelen verileri işleme konusunda ilerleme kaydettim.",
        time: "11:00",
        read: true,
      },
      {
        id: 2,
        sender: "me",
        text: "Süper! ML modelini de entegre etmeye başladım. Bu hafta sonu test edebiliriz.",
        time: "11:15",
        read: true,
      },
      {
        id: 3,
        sender: "other",
        text: "Branch korumasını aktif ettim, artık merge için onay gerekiyor.",
        time: "12:30",
        read: true,
      },
    ],
  },
  {
    id: 3,
    name: "Can Öztürk",
    avatar: "CO",
    color: "from-violet-400 to-purple-500",
    lastMessage: "Proje sunumunu hazırlıyorum, yarın paylaşırım.",
    time: "3 sa",
    unread: 1,
    online: false,
    project: "AI Kampüs Navigasyon",
    messages: [
      {
        id: 1,
        sender: "me",
        text: "Sunum için hazırlık nasıl gidiyor?",
        time: "09:00",
        read: true,
      },
      {
        id: 2,
        sender: "other",
        text: "Frontend taslaklarını bitirdim, harita entegrasyonu için API key lazım.",
        time: "09:30",
        read: true,
      },
      {
        id: 3,
        sender: "me",
        text: "API key'i kasa üzerinden paylaşıyorum, güvenli erişim linki alacaksın.",
        time: "09:45",
        read: true,
      },
      {
        id: 4,
        sender: "other",
        text: "Proje sunumunu hazırlıyorum, yarın paylaşırım.",
        time: "10:20",
        read: false,
      },
    ],
  },
  {
    id: 4,
    name: "Selin Aydın",
    avatar: "SA",
    color: "from-rose-400 to-pink-500",
    lastMessage: "Toplantı için müsait misiniz bu cuma?",
    time: "5 sa",
    unread: 0,
    online: false,
    messages: [
      {
        id: 1,
        sender: "other",
        text: "Merhaba Elif! Etkinlik yönetim aracı projenizle ilgileniyorum.",
        time: "08:00",
        read: true,
      },
      {
        id: 2,
        sender: "me",
        text: "Merhaba Selin! Harika, detayları konuşmak ister misiniz?",
        time: "08:30",
        read: true,
      },
      {
        id: 3,
        sender: "other",
        text: "Toplantı için müsait misiniz bu cuma?",
        time: "09:00",
        read: true,
      },
    ],
  },
  {
    id: 5,
    name: "Mert Aksoy",
    avatar: "MA",
    color: "from-amber-400 to-orange-500",
    lastMessage: "Smart contract deploy edildi, test ağında çalışıyor.",
    time: "1 gün",
    unread: 0,
    online: false,
    project: "Blockchain Sertifika Sistemi",
    messages: [
      {
        id: 1,
        sender: "other",
        text: "Solidity kodunu tamamladım, review edebilir misin?",
        time: "Dün 16:00",
        read: true,
      },
      {
        id: 2,
        sender: "me",
        text: "Tabii, bu akşam inceliyorum.",
        time: "Dün 16:30",
        read: true,
      },
      {
        id: 3,
        sender: "other",
        text: "Smart contract deploy edildi, test ağında çalışıyor.",
        time: "Dün 20:00",
        read: true,
      },
    ],
  },
];

export default function MesajlarPage() {
  const [selectedId, setSelectedId] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [showMobileList, setShowMobileList] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [localConversations, setLocalConversations] = useState(conversations);

  const selected = localConversations.find((c) => c.id === selectedId)!;

  const filtered = localConversations.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.project &&
        c.project.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selected?.messages.length]);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    const msg: Message = {
      id: Date.now(),
      sender: "me",
      text: newMessage.trim(),
      time: new Date().toLocaleTimeString("tr-TR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      read: false,
    };
    setLocalConversations((prev) =>
      prev.map((c) =>
        c.id === selectedId
          ? {
              ...c,
              messages: [...c.messages, msg],
              lastMessage: msg.text,
              time: "Şimdi",
            }
          : c,
      ),
    );
    setNewMessage("");
  };

  const handleSelectConversation = (id: number) => {
    setSelectedId(id);
    setShowMobileList(false);
  };

  if (!selected) return null;

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
              placeholder="Kişi veya proje ara..."
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
              key={conv.id}
              onClick={() => handleSelectConversation(conv.id)}
              className={`w-full flex items-start gap-3 px-4 py-3.5 transition-all duration-150 text-left ${
                selectedId === conv.id
                  ? "bg-[#7b7fc8]/8 border-l-2 border-l-[#7b7fc8]"
                  : "border-l-2 border-l-transparent hover:bg-white/[0.03]"
              }`}
            >
              <div className="relative flex-shrink-0">
                <div
                  className={`w-11 h-11 rounded-full bg-gradient-to-br ${conv.color} flex items-center justify-center text-white text-sm shadow-md`}
                >
                  {conv.avatar}
                </div>
                {conv.online && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-[#262836] rounded-full" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[#d0d2dc] truncate text-sm">
                    {conv.name}
                  </span>
                  <span className="text-xs text-[#6d7090] flex-shrink-0 ml-2">
                    {conv.time}
                  </span>
                </div>
                {conv.project && (
                  <p className="text-xs text-[#7b7fc8] truncate mt-0.5">
                    {conv.project}
                  </p>
                )}
                <p className="text-sm text-[#6d7090] truncate mt-0.5">
                  {conv.lastMessage}
                </p>
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
      <div
        className={`${
          showMobileList ? "hidden" : "flex"
        } md:flex flex-col flex-1 bg-[#262836] min-w-0`}
      >
        {/* Sohbet Başlığı */}
        <div className="flex items-center justify-between px-4 lg:px-6 py-3.5 border-b border-white/[0.07] bg-[#262836] flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-1.5 rounded-lg hover:bg-white/[0.05] -ml-1"
              onClick={() => setShowMobileList(true)}
            >
              <ChevronLeft className="w-5 h-5 text-[#8a8da8]" />
            </button>
            <div className="relative">
              <div
                className={`w-10 h-10 rounded-full bg-gradient-to-br ${selected.color} flex items-center justify-center text-white text-sm shadow-md`}
              >
                {selected.avatar}
              </div>
              {selected.online && (
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-[#262836] rounded-full" />
              )}
            </div>
            <div>
              <h3 className="text-[#e0e2ec] text-sm">{selected.name}</h3>
              <div className="flex items-center gap-2">
                {selected.project ? (
                  <span className="text-xs text-[#7b7fc8]">
                    {selected.project}
                  </span>
                ) : (
                  <span className="text-xs text-[#6d7090]">
                    {selected.online ? "Çevrimiçi" : "Çevrimdışı"}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              className="p-2 rounded-xl hover:bg-white/[0.05] transition-colors"
              title="Sesli arama"
            >
              <Phone className="w-4 h-4 text-[#8a8da8]" />
            </button>
            <button
              className="p-2 rounded-xl hover:bg-white/[0.05] transition-colors"
              title="Görüntülü arama"
            >
              <Video className="w-4 h-4 text-[#8a8da8]" />
            </button>
            <button className="p-2 rounded-xl hover:bg-white/[0.05] transition-colors">
              <MoreVertical className="w-4 h-4 text-[#8a8da8]" />
            </button>
          </div>
        </div>

        {/* Güvenlik Bandı */}
        {selected.project && (
          <div className="mx-4 lg:mx-6 mt-3 px-4 py-2.5 rounded-xl bg-[#7b7fc8]/8 border border-[#7b7fc8]/12 flex items-center gap-2.5 flex-shrink-0">
            <Shield className="w-4 h-4 text-[#a5a8d8] flex-shrink-0" />
            <p className="text-xs text-[#8a8da8]">
              Bu konuşma{" "}
              <span className="text-[#a5a8d8]">{selected.project}</span>{" "}
              projesiyle ilişkili. Tüm mesajlar şifrelenmiştir.
            </p>
            <Lock className="w-3.5 h-3.5 text-[#6d7090] flex-shrink-0 ml-auto" />
          </div>
        )}

        {/* Mesajlar */}
        <div className="flex-1 overflow-y-auto px-4 lg:px-6 py-4 space-y-1">
          <div className="flex items-center justify-center my-4">
            <span className="text-xs text-[#6d7090] bg-[#2e3044] px-3 py-1 rounded-full border border-white/[0.06]">
              Bugün
            </span>
          </div>

          {selected.messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.sender === "me" ? "justify-end" : "justify-start"
              } mb-1.5`}
            >
              <div
                className={`max-w-[75%] lg:max-w-[60%] px-4 py-2.5 rounded-2xl ${
                  msg.sender === "me"
                    ? "bg-[#6366a8]/80 text-white rounded-br-md"
                    : "bg-[#2e3044] text-[#d0d2dc] border border-white/[0.06] rounded-bl-md"
                }`}
              >
                <p className="text-sm leading-relaxed">{msg.text}</p>
                <div
                  className={`flex items-center justify-end gap-1 mt-1 ${
                    msg.sender === "me" ? "text-white/50" : "text-[#6d7090]"
                  }`}
                >
                  <span className="text-[11px]">{msg.time}</span>
                  {msg.sender === "me" &&
                    (msg.read ? (
                      <CheckCheck className="w-3.5 h-3.5" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    ))}
                </div>
              </div>
            </div>
          ))}

          {/* NDA dosya balonu - sadece ilk konuşmada */}
          {selectedId === 1 && (
            <div className="flex justify-end mb-1.5">
              <div className="max-w-[75%] lg:max-w-[60%] px-4 py-3 rounded-2xl rounded-br-md bg-[#6366a8]/80 text-white">
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/10 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">NDA_CodeBrate_2026.pdf</p>
                    <p className="text-xs text-white/50">148 KB</p>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-1 text-white/50">
                  <Clock className="w-3 h-3" />
                  <span className="text-[11px]">14:36</span>
                  <CheckCheck className="w-3.5 h-3.5 ml-0.5" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Mesaj Giriş Alanı */}
        <div className="px-4 lg:px-6 py-3.5 border-t border-white/[0.07] bg-[#262836] flex-shrink-0">
          <div className="flex items-end gap-2">
            <div className="flex gap-1">
              <button
                className="p-2 rounded-xl hover:bg-white/[0.05] transition-colors"
                title="Dosya ekle"
              >
                <Paperclip className="w-5 h-5 text-[#6d7090]" />
              </button>
              <button
                className="p-2 rounded-xl hover:bg-white/[0.05] transition-colors hidden sm:block"
                title="Resim ekle"
              >
                <Image className="w-5 h-5 text-[#6d7090]" />
              </button>
            </div>
            <div className="flex-1 relative">
              <textarea
                rows={1}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Mesajınızı yazın..."
                className="w-full px-4 py-2.5 rounded-xl border border-white/[0.08] bg-[#2a2c3e] text-[#d0d2dc] placeholder-[#6d7090] text-sm focus:outline-none focus:ring-2 focus:ring-[#7b7fc8]/40 focus:border-transparent resize-none transition-all"
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!newMessage.trim()}
              className="p-2.5 rounded-xl bg-[#6366a8] text-white hover:bg-[#7074b8] transition-all shadow-md shadow-[#6366a8]/20 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
