import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { usePlatformBranding } from "@/hooks/use-platform-branding";
import { ArrowRight, Globe, ShieldCheck, QrCode, Leaf, UsersThree, MagnifyingGlass, List, X } from "@phosphor-icons/react";

const NAV_LINKS = [
  { href: "#beneficios", label: "Por que rastrear?" },
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#contato", label: "Contato" },
];

/**
 * Página principal da QualOrigem (/).
 * Focada nos benefícios da rastreabilidade e na descoberta da origem.
 */
const RootPlaceholder = () => {
  const [searchParams] = useSearchParams();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const loteCode = searchParams.get("lote");

  usePlatformBranding();

  const primaryColor = "#5b9c06";
  const textColor = "#555555";

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-[#5b9c06]/20 selection:text-[#5b9c06]">
      <style dangerouslySetInnerHTML={{ __html: `
        html { scroll-behavior: smooth; }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 12s linear infinite;
        }
      ` }} />
      {/* Header / Navbar */}
      <header className="w-full border-b border-slate-100 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-12 py-4 sm:py-6 flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <img src="/logo-qualorigem.jpg" alt="QualOrigem" className="h-9 sm:h-10 w-auto object-contain" />
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-500">
            {NAV_LINKS.map(({ href, label }) => (
              <a key={href} href={href} className="hover:text-[#5b9c06] transition-colors">{label}</a>
            ))}
          </nav>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="md:hidden min-h-[44px] min-w-[44px] text-slate-600"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Abrir menu"
          >
            <List className="h-6 w-6" weight="bold" />
          </Button>
        </div>
      </header>

      {/* Mobile menu drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[60] flex">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} aria-hidden="true" />
          <div className="relative w-full max-w-xs flex flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-300 ml-auto">
            <div className="flex items-center justify-between h-16 px-4 border-b border-slate-100">
              <span className="text-sm font-bold text-slate-700">Menu</span>
              <Button variant="ghost" size="icon" className="min-h-[44px] min-w-[44px] text-slate-600" onClick={() => setMobileMenuOpen(false)} aria-label="Fechar menu">
                <X className="h-6 w-6" />
              </Button>
            </div>
            <nav className="flex flex-col p-4 gap-1">
              {NAV_LINKS.map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-3 px-4 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-[#5b9c06] transition-colors"
                >
                  {label}
                </a>
              ))}
            </nav>
          </div>
        </div>
      )}

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-12 sm:py-20 px-4 sm:px-12 overflow-hidden">
          {/* Blobs decorativos */}
          <div className="absolute top-[-10%] right-[-5%] w-[280px] h-[280px] sm:w-[400px] sm:h-[400px] lg:w-[500px] lg:h-[500px] rounded-full blur-[120px] opacity-10 pointer-events-none bg-[#5b9c06]" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[240px] h-[240px] sm:w-[300px] sm:h-[300px] lg:w-[400px] lg:h-[400px] rounded-full blur-[100px] opacity-5 pointer-events-none bg-[#555555]" />

          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 items-center relative z-10">
            <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-left-4 duration-700">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5b9c06]/10 text-[#5b9c06] text-xs font-black uppercase tracking-widest">
                <Leaf size={16} weight="bold" /> Transparência do campo à mesa
              </div>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.1] tracking-tight">
                A história por trás de cada <span style={{ color: primaryColor }}>produto</span>.
              </h1>
              <p className="text-lg sm:text-xl text-slate-500 leading-relaxed max-w-xl">
                Descubra a origem, conheça os produtores e acompanhe a jornada de tudo o que você consome. Valorizamos quem produz com respeito à terra e à tradição.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button asChild size="lg" className="h-14 px-8 rounded-2xl font-black text-white bg-[#5b9c06] hover:bg-[#4a8005] shadow-xl shadow-[#5b9c06]/30 transition-all hover:scale-[1.02] active:scale-[0.98]">
                  <a href="#como-funciona">Descobrir origem <ArrowRight size={20} weight="bold" className="ml-2" /></a>
                </Button>
                <Button variant="outline" size="lg" className="h-14 px-8 rounded-2xl font-bold border-slate-200 text-slate-600 hover:bg-slate-50 transition-all">
                  Nossa missão
                </Button>
              </div>
            </div>

            <div className="relative animate-in fade-in zoom-in-95 duration-1000 delay-200 min-w-0 overflow-hidden">
              {/* Mockup de Resultado de Rastreio (Ilustrativo) */}
              <div className="relative bg-white rounded-[2rem] sm:rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden p-4">
                <div className="bg-slate-50 rounded-[1.5rem] sm:rounded-[2.5rem] p-4 sm:p-8 flex flex-col space-y-6 border border-slate-100">
                  {/* Status Bar Mockup */}
                  <div className="flex justify-between items-center px-2">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-slate-200" />
                      <div className="w-2 h-2 rounded-full bg-slate-200" />
                      <div className="w-2 h-2 rounded-full bg-slate-200" />
                    </div>
                    <div className="w-8 h-1.5 rounded-full bg-slate-200" />
                  </div>

                  {/* Product Info Mockup */}
                  <div className="space-y-6 pt-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-slate-100 shrink-0">
                        <Leaf size={32} className="text-[#5b9c06]" weight="duotone" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-black text-[#5b9c06] uppercase tracking-widest">Origem Verificada</p>
                        <h4 className="text-lg font-black text-slate-900 truncate">Café Especial Reserva</h4>
                      </div>
                    </div>

                    <div className="space-y-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                      <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                        <span className="text-xs font-bold text-slate-400">Lote</span>
                        <span className="text-xs font-mono font-black text-slate-700">#MC-2024-08</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                        <span className="text-xs font-bold text-slate-400">Produtor</span>
                        <span className="text-xs font-black text-slate-700">Fazenda Boa Vista</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-400">Localização</span>
                        <span className="text-xs font-black text-slate-700">Serra da Mantiqueira, MG</span>
                      </div>
                    </div>

                    {/* Visual de Mapa/Gráfico Simbolizado */}
                    <div className="h-24 w-full bg-slate-200/50 rounded-2xl overflow-hidden relative group">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Globe size={32} className="text-slate-300 animate-spin-slow" weight="thin" />
                      </div>
                      <div className="absolute bottom-3 left-3 right-3 h-1.5 bg-white/50 rounded-full overflow-hidden">
                        <div className="h-full bg-[#5b9c06] w-2/3 rounded-full" />
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-2 py-2">
                      <ShieldCheck size={20} className="text-[#5b9c06]" weight="fill" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Autenticidade Garantida</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Elementos flutuantes decorativos */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-[#5b9c06]/10 rounded-full blur-2xl animate-pulse" />
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-[#555555]/10 rounded-full blur-3xl" />
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="beneficios" className="py-16 sm:py-24 bg-slate-50/50 scroll-mt-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-12 text-center space-y-12 sm:space-y-16">
            <div className="max-w-2xl mx-auto space-y-4">
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Por que a origem importa?</h2>
              <p className="text-slate-500 font-medium text-lg">Saber de onde vem o que você consome muda a sua relação com o produto.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                { 
                  icon: ShieldCheck, 
                  title: "Confiança Real", 
                  desc: "Elimine dúvidas. Tenha a garantia de que o produto é autêntico e segue padrões rigorosos de produção.",
                  color: "#5b9c06"
                },
                { 
                  icon: UsersThree, 
                  title: "Valorização Local", 
                  desc: "Conheça as famílias e comunidades por trás da produção. Apoie quem mantém viva a cultura do campo.",
                  color: "#555555"
                },
                { 
                  icon: Globe, 
                  title: "Sustentabilidade", 
                  desc: "Acompanhe o compromisso ambiental. Produtos rastreados mostram respeito à terra e ao futuro.",
                  color: "#5b9c06"
                }
              ].map((item, i) => (
                <div key={i} className="bg-white p-6 sm:p-10 rounded-2xl sm:rounded-[2.5rem] border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.03)] hover:shadow-xl transition-all duration-500 group hover:-translate-y-2 text-left">
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
                    style={{ backgroundColor: `${item.color}10` }}
                  >
                    <item.icon size={32} style={{ color: item.color }} weight="duotone" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-4">{item.title}</h3>
                  <p className="text-slate-500 leading-relaxed font-medium">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section id="como-funciona" className="py-16 sm:py-24 px-4 sm:px-12 bg-white overflow-hidden scroll-mt-24">
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 space-y-8">
              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Simples como apontar a câmera.
              </h2>
              <div className="space-y-6">
                {[
                  { step: "01", title: "Encontre o QR Code", desc: "Procure pelo selo QualOrigem na embalagem do seu produto." },
                  { step: "02", title: "Escaneie ou Digite", desc: "Use a câmera do celular ou digite o código aqui no site." },
                  { step: "03", title: "Conheça a história", desc: "Veja fotos, localização, certificados e o relato do produtor." }
                ].map((s, i) => (
                  <div key={i} className="flex gap-6 items-start">
                    <span className="text-4xl font-black text-slate-100 tabular-nums">{s.step}</span>
                    <div className="space-y-1">
                      <h4 className="text-xl font-bold text-slate-800">{s.title}</h4>
                      <p className="text-slate-500 font-medium">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1 relative">
              <div className="w-full aspect-video bg-slate-100 rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-[#5b9c06]/20 to-transparent mix-blend-multiply" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-white shadow-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 cursor-pointer">
                    <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-[#5b9c06] border-b-[10px] border-b-transparent ml-1" />
                  </div>
                </div>
                <img 
                  src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=1000" 
                  alt="Campo" 
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Badge flutuante */}
              <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-3xl shadow-2xl border border-slate-100 animate-bounce duration-[3000ms]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#5b9c06]/10 flex items-center justify-center">
                    <ShieldCheck size={24} className="text-[#5b9c06]" weight="fill" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Garantia</p>
                    <p className="font-bold text-slate-800">Origem 100% Verificada</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer id="contato" className="bg-white border-t border-slate-100 py-12 sm:py-16 px-4 sm:px-12 scroll-mt-24">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex flex-col items-center md:items-start gap-6">
              <img src="/logo-qualorigem.jpg" alt="QualOrigem" className="h-10 w-auto" />
              <p className="text-slate-500 font-medium max-w-xs text-center md:text-left">
                Promovendo a transparência e valorizando quem produz com qualidade.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
              <div className="space-y-4">
                <h5 className="font-black text-slate-900 text-sm uppercase tracking-widest">Navegação</h5>
                <ul className="space-y-2 text-sm font-bold text-slate-400">
                  <li><a href="#beneficios" className="hover:text-[#5b9c06] transition-colors">Benefícios</a></li>
                  <li><a href="#como-funciona" className="hover:text-[#5b9c06] transition-colors">Como funciona</a></li>
                </ul>
              </div>
              <div className="space-y-4">
                <h5 className="font-black text-slate-900 text-sm uppercase tracking-widest">Legal</h5>
                <ul className="space-y-2 text-sm font-bold text-slate-400">
                  <li><a href="#" className="hover:text-[#5b9c06] transition-colors">Privacidade</a></li>
                  <li><a href="#" className="hover:text-[#5b9c06] transition-colors">Termos</a></li>
                </ul>
              </div>
              <div className="space-y-4 hidden sm:block">
                <h5 className="font-black text-slate-900 text-sm uppercase tracking-widest">Contato</h5>
                <ul className="space-y-2 text-sm font-bold text-slate-400">
                  <li><a href="mailto:contato@qualorigem.com.br" className="hover:text-[#5b9c06] transition-colors">E-mail</a></li>
                  <li><a href="#" className="hover:text-[#5b9c06] transition-colors">Suporte</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="pt-12 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-slate-400 font-medium">&copy; 2026 QualOrigem. Todos os direitos reservados.</p>
            <div className="flex gap-6">
              {/* Redes sociais poderiam ir aqui */}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default RootPlaceholder;
