"use client";
import { useEffect, useId, useRef, type ReactNode } from "react";
import Link from "next/link";
import { Icon } from "./icon";
export function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
 return <div className="page-heading"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="page-description">{description}</p></div>{action && <div className="heading-action">{action}</div>}</div>;
}
export function SectionHeading({ title, action, href }: { title: string; action?: string; href?: string }) {
 return <div className="section-heading"><h2>{title}</h2>{action && href && <Link className="text-link" href={href}>{action}<Icon name="arrow" size={16}/></Link>}</div>;
}
export function ProgressBar({ value, color = "lavender" }: { value: number; color?: string }) {
 return <div className={"progress-track " + color} role="progressbar" aria-label="Прогресс" aria-valuenow={Math.round(Math.min(100,Math.max(0,value)))} aria-valuemin={0} aria-valuemax={100}><span style={{ width: Math.min(100,Math.max(0,value)) + "%" }} /></div>;
}
export function EmptyState({ title = "Здесь пока тихо", description = "Попробуй другой фильтр или добавь что-нибудь своё.", action }: { title?: string; description?: string; action?: ReactNode }) {
 return <div className="empty-state"><span className="empty-icon"><Icon name="leaf" size={30}/></span><h3>{title}</h3><p>{description}</p>{action}</div>;
}
export function Modal({ title, description, children, onClose }: { title: string; description?: string; children: ReactNode; onClose: () => void }) {
 const ref = useRef<HTMLDialogElement>(null); const titleId = useId();
 useEffect(() => { const dialog = ref.current; const previous = document.activeElement as HTMLElement | null; dialog?.showModal(); return () => { dialog?.close(); previous?.focus(); }; }, []);
 return <dialog ref={ref} className="modal" aria-labelledby={titleId} onCancel={onClose} onClick={e => { if(e.target === e.currentTarget) { const box=e.currentTarget.getBoundingClientRect(); if(e.clientX<box.left||e.clientX>box.right||e.clientY<box.top||e.clientY>box.bottom) onClose(); } }}>
  <div className="modal-heading"><span className="icon-tile lavender"><Icon name="sparkles"/></span><button className="icon-button" onClick={onClose} aria-label="Закрыть окно"><Icon name="close"/></button></div>
  <h2 id={titleId}>{title}</h2>{description && <p className="muted">{description}</p>}<div className="modal-content">{children}</div>
 </dialog>;
}
export function Tag({ children, color = "" }: { children: ReactNode; color?: string }) { return <span className={"tag " + color}>{children}</span>; }
