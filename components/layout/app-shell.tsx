"use client";
import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { Avatar } from "@/features/avatar/avatar";
import { useDemo } from "@/features/demo/demo-provider";
const nav = [
 { href: "/", icon: "home", label: "Моё пространство" },
 { href: "/room", icon: "room", label: "Комната" },
 { href: "/skills", icon: "sparkles", label: "Навыки" },
 { href: "/tasks", icon: "target", label: "Цели и задачи" },
 { href: "/wardrobe", icon: "shirt", label: "Кастомизация" },
 { href: "/progress", icon: "album", label: "Альбом роста" },
 { href: "/graph", icon: "graph", label: "Граф достижений" },
 { href: "/friends", icon: "friends", label: "Друзья" },
];
export function AppShell({ children }: { children: ReactNode }) {
 const path = usePathname(); const [mobile, setMobile] = useState(false); const [notes, setNotes] = useState(false);
 const { outfit, name, toast, notify } = useDemo();
 useEffect(() => { if (!toast) return; const timer = setTimeout(() => notify(""), 4500); return () => clearTimeout(timer); }, [toast, notify]);
 const current = nav.find(n => n.href === path || (n.href !== "/" && path.startsWith(n.href)))?.label || "Настройки";
 return <div className="app-shell">
  <a href="#main-content" className="skip-link">К содержимому</a>
  {mobile && <button className="mobile-backdrop" aria-label="Закрыть навигацию" onClick={() => setMobile(false)}/>}
  <aside className={"sidebar " + (mobile ? "is-open" : "")}>
   <Link href="/" className="brand" onClick={() => setMobile(false)}><span className="brand-symbol"><span/><span/><span/></span>TinyMe<span className="brand-dot">.</span></Link>
   <p className="brand-caption">Маленькие шаги. Видимый рост.</p>
   <p className="nav-caption">ТВОЙ МАЛЕНЬКИЙ МИР</p>
   <nav aria-label="Основная навигация">{nav.map(n => <Link key={n.href} href={n.href} className={"nav-link " + (n.href === "/" ? path === "/" ? "active" : "" : path.startsWith(n.href) ? "active" : "")} aria-current={n.href === path ? "page" : undefined} onClick={() => setMobile(false)}><Icon name={n.icon} size={19}/><span>{n.label}</span>{n.href === "/friends" && <span className="nav-count">4</span>}</Link>)}</nav>
   <div className="sidebar-bottom"><div className="sidebar-note"><span className="tiny-star">✳</span><p>Ты растёшь.<br/><strong>Даже маленькими шагами.</strong></p></div>
    <Link href="/settings" className={"nav-link " + (path === "/settings" ? "active" : "")} onClick={() => setMobile(false)}><Icon name="settings" size={19}/>Настройки</Link>
    <Link href="/settings" className="profile-link" onClick={() => setMobile(false)}><span className="profile-avatar"><Avatar outfit={outfit}/></span><span><strong>{name}</strong><small>Твоё пространство</small></span><Icon name="chevron" size={15}/></Link>
   </div>
  </aside>
  <div className="workspace">
   <header className="topbar"><div className="flex items-center gap-3"><button className="icon-button mobile-menu" aria-label="Открыть навигацию" aria-expanded={mobile} onClick={() => setMobile(!mobile)}><Icon name="menu"/></button><span className="breadcrumb">Мой мир <span>/</span> <strong>{current}</strong></span></div>
    <div className="topbar-actions"><span className="demo-pill"><span/>Демо-пространство</span><div className="notification-wrap"><button className={"icon-button notification-button " + (notes ? "selected" : "")} onClick={() => setNotes(!notes)} aria-label="Уведомления" aria-expanded={notes}><Icon name="bell"/><i/></button>{notes && <div className="notification-popover"><strong>Твои маленькие победы</strong><p><Icon name="sparkles" size={16}/> Открыта новая ступень иллюстрации</p><p><Icon name="friends" size={16}/> Айка ждёт тебя в своей комнате</p><small>Примеры уведомлений для макета</small></div>}</div><Link href="/wardrobe" aria-label="Настроить персонажа" className="top-avatar"><Avatar outfit={outfit}/></Link></div>
   </header>
   <main id="main-content" className="main-content" tabIndex={-1}>{children}</main>
   <footer className="app-footer"><span>TinyMe © 2026</span><span>В своём темпе. В своём мире.<span className="footer-sprout">✳</span></span></footer>
  </div>
  {toast && <div className="toast" role="status"><Icon name="check" size={18}/><span>{toast}</span><button onClick={() => notify("")} aria-label="Закрыть уведомление"><Icon name="close" size={15}/></button></div>}
 </div>;
}
