"use client";
import { useState } from "react";
import { useDemo } from "@/features/demo/demo-provider";
import { PageHeader, SectionHeading, EmptyState, Modal, ProgressBar, Tag } from "@/components/ui/primitives";
import { GoalCard, TaskRow } from "@/features/shared/cards";
import { CreateDialog } from "@/features/shared/create-dialog";
import { Icon } from "@/components/ui/icon";
import type { Goal } from "@/types";
export default function TasksPage() {
 const { skills, tasks, goals }=useDemo();const [create,setCreate]=useState<"task"|"goal"|null>(null);const [filter,setFilter]=useState("all");const [skill,setSkill]=useState("all");const [search,setSearch]=useState("");const [selected,setSelected]=useState<Goal|null>(null);
 const visible=tasks.filter(t=>(filter==="all"||(filter==="done"?t.done:!t.done))&&(skill==="all"||t.skillId===skill)&&t.title.toLowerCase().includes(search.toLowerCase()));
 return <div className="page-enter"><PageHeader eyebrow="ОТ БОЛЬШОЙ ИДЕИ К МАЛЕНЬКОМУ ШАГУ" title="Твои цели и задачи" description="Не нужно успевать всё. Выбери то, что приблизит тебя к важному." action={<div className="flex gap-2"><button className="button secondary" onClick={()=>setCreate("goal")}><Icon name="target" size={17}/>Новая цель</button><button className="button primary" onClick={()=>setCreate("task")}><Icon name="plus" size={17}/>Новая задача</button></div>}/>
 <SectionHeading title="То, к чему ты идёшь"/><div className="goal-grid">{goals.map(g=><GoalCard key={g.id} goal={g} onClick={()=>setSelected(g)}/>)}</div>
 <div className="task-section"><SectionHeading title="Шаги, из которых всё складывается"/><div className="filter-bar wrap"><div className="tabs">{[["all","Все"],["open","Впереди"],["done","Сделано"]].map(([id,label])=><button key={id} className={filter===id?"active":""} onClick={()=>setFilter(id)}>{label}<span>{tasks.filter(t=>id==="all"||(id==="done"?t.done:!t.done)).length}</span></button>)}</div><div className="filter-controls"><label className="search-field"><Icon name="search" size={17}/><input aria-label="Найти задачу" placeholder="Найти задачу" value={search} onChange={e=>setSearch(e.target.value)}/></label><select aria-label="Фильтр по навыку" value={skill} onChange={e=>setSkill(e.target.value)}><option value="all">Все навыки</option>{skills.map(s=><option key={s.id} value={s.id}>{s.title}</option>)}</select></div></div>
 <div className="card task-list"><div className="list-label"><span>ТВОИ ЗАДАЧИ</span><span>{visible.length} шагов</span></div>{visible.length?visible.map(t=><TaskRow task={t} key={t.id}/>):<EmptyState title="Здесь пока нет задач" description="Измени фильтр или добавь свой следующий шаг."/>}<button className="inline-add" onClick={()=>setCreate("task")}><Icon name="plus" size={17}/>Добавить маленький шаг</button></div></div>
 <div className="gentle-note"><Icon name="heart" size={17}/>Пропущенный день ничего не отнимает. Всё, что ты уже сделал, остаётся с тобой.</div>
 {create&&<CreateDialog kind={create} onClose={()=>setCreate(null)}/>}
 {selected&&<Modal title={selected.title} description={selected.description} onClose={()=>setSelected(null)}><div className="flex justify-between my-5"><Tag>{skills.find(s=>s.id===selected.skillId)?.title}</Tag><strong>{selected.done} / {selected.total} шагов</strong></div><ProgressBar value={selected.done/selected.total*100}/><div className="mt-5">{tasks.filter(t=>t.goalId===selected.id).map(t=><TaskRow key={t.id} task={t}/>)}{!tasks.some(t=>t.goalId===selected.id)&&<p className="muted">Добавь первую задачу для этой цели.</p>}</div><button className="button primary w-full mt-5" onClick={()=>{setSelected(null);setCreate("task");}}><Icon name="plus" size={16}/>Добавить задачу</button></Modal>}
 </div>;
}
