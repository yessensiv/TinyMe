"use client";
import { useState } from "react";
import { PageHeader, Modal, Tag, ProgressBar, EmptyState } from "@/components/ui/primitives";
import { SkillCard } from "@/features/shared/cards";
import { CreateDialog } from "@/features/shared/create-dialog";
import { useDemo } from "@/features/demo/demo-provider";
import { Avatar } from "@/features/avatar/avatar";
import { Icon } from "@/components/ui/icon";
import { categoryLabels } from "@/data/mock";
import type { Skill } from "@/types";
export default function SkillsPage() {
 const { skills, outfit } = useDemo(); const [create,setCreate] = useState(false); const [selected,setSelected] = useState<Skill|null>(null); const [filter,setFilter] = useState("all");
 const visible=skills.filter(s=>filter==="all"||s.category===filter);
 return <div className="page-enter"><PageHeader eyebrow="ИНТЕРЕС ПРЕВРАЩАЕТСЯ В УМЕНИЕ" title="То, в чём ты растёшь" description="Здесь нет правильных увлечений. Есть только то, что интересно тебе." action={<button className="button primary" onClick={()=>setCreate(true)}><Icon name="plus" size={17}/>Новый навык</button>}/>
 <div className="soft-banner"><span className="icon-tile sage"><Icon name="leaf" size={24}/></span><div><strong>Каждое направление — немного больше тебя</strong><p>Мини-ты осваивает занятия вместе с тобой. Его мастерство растёт отдельно в каждом навыке.</p></div><span className="banner-decoration">✳</span></div>
 <div className="filter-bar"><div className="tabs"><button className={filter==="all"?"active":""} onClick={()=>setFilter("all")}>Все навыки <span>{skills.length}</span></button><button className={filter==="learn"?"active":""} onClick={()=>setFilter("learn")}>Изучаю</button><button className={filter==="create"?"active":""} onClick={()=>setFilter("create")}>Создаю</button><button className={filter==="move"?"active":""} onClick={()=>setFilter("move")}>Двигаюсь</button></div><span className="subtle-count">Твой личный набор интересов</span></div>
 <div className="skill-grid expanded">{visible.map(s=><SkillCard key={s.id} skill={s} onClick={()=>setSelected(s)}/>)}<button className="add-card" onClick={()=>setCreate(true)}><span><Icon name="plus" size={25}/></span><strong>А что ещё тебе интересно?</strong><p>Добавь своё направление</p></button></div>
 {!visible.length&&<EmptyState title="Новое направление ждёт тебя" description="Добавь первый навык в этой категории."/>}
 <div className="section-heading mt-10"><h2>Как меняется мини-ты</h2><span className="muted">Уверенность приходит с практикой</span></div><div className="mastery-grid">{[{name:"Первые шаги",pose:"idle",level:"Уровни 1–2",desc:"Пробует, присматривается, начинает."},{name:"Всё увереннее",pose:"draw",level:"Уровни 3–5",desc:"Действует смелее, находит свой ритм."},{name:"Свободное мастерство",pose:"draw",level:"Уровень 6+",desc:"Умеет больше и делает это по-своему."}].map((m,i)=><div className="card mastery-card" key={m.name}><span className="mastery-step">0{i+1}</span><Avatar outfit={outfit} pose={m.pose} stage={i+1}/><Tag>{m.level}</Tag><h3>{m.name}</h3><p>{m.desc}</p></div>)}</div>
 {create&&<CreateDialog kind="skill" onClose={()=>setCreate(false)}/>}
 {selected&&<Modal title={selected.title} description={selected.description} onClose={()=>setSelected(null)}><div className={"skill-detail-scene "+selected.color}><Avatar outfit={outfit} pose={selected.category==="move"?"move":selected.category==="create"?"draw":"read"} stage={selected.level}/></div><div className="flex items-center justify-between my-5"><Tag color={selected.color}>Уровень {selected.level}</Tag><strong>{selected.xp} XP</strong></div><ProgressBar value={selected.xp/selected.target*100} color={selected.color}/><p className="muted mt-4">До следующего уровня: {selected.target-selected.xp} XP</p><div className="info-box"><Icon name="sparkles"/><p>В комнате мини-ты: <strong>{categoryLabels[selected.category].toLowerCase()}</strong>. Новые вехи открывают более уверенные действия.</p></div><button className="button primary w-full mt-5" onClick={()=>setSelected(null)}>Продолжать в своём темпе</button></Modal>}
 </div>;
}
