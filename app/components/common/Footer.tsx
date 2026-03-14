import Link from "next/link";
import { Globe } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#22242f] border-t border-white/[0.06] text-[#6d7090]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7b7fc8] to-[#9b7fb8] flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg text-[#d0d2dc]">CodeBrate</span>
            </div>
            <p className="text-sm leading-relaxed">
              Üniversite öğrencileri için küresel proje partneri bulma
              platformu. Fikirlerinizi güvende tutun, doğru ekibi bulun.
            </p>
          </div>
          <div>
            <h4 className="text-[#c0c2d0] mb-4">Platform</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/projeler"
                  className="hover:text-[#a5a8d8] transition-colors"
                >
                  Projeler
                </Link>
              </li>
              <li>
                <Link
                  href="/yetenekler"
                  className="hover:text-[#a5a8d8] transition-colors"
                >
                  Keşfet
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="hover:text-[#a5a8d8] transition-colors"
                >
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-[#c0c2d0] mb-4">Kaynaklar</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/nasil-calisir"
                  className="hover:text-[#a5a8d8] transition-colors"
                >
                  Nasıl Çalışır?
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-[#a5a8d8] transition-colors">
                  Güvenlik
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#a5a8d8] transition-colors">
                  SSS
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-[#c0c2d0] mb-4">İletişim</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#" className="hover:text-[#a5a8d8] transition-colors">
                  Destek
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#a5a8d8] transition-colors">
                  Geri Bildirim
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#a5a8d8] transition-colors">
                  Kariyer
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/[0.06] mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm">
            &copy; 2026 CodeBrate. Tüm hakları saklıdır.
          </p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="hover:text-[#a5a8d8] transition-colors">
              Gizlilik Politikası
            </a>
            <a href="#" className="hover:text-[#a5a8d8] transition-colors">
              Kullanım Şartları
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
