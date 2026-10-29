"use client";
import { useState } from "react";
import Link from "next/link";
import { useDemo } from "@/features/demo/demo-provider";
import { RoomScene } from "@/features/room/room-scene";
import { Icon } from "@/components/ui/icon";
import { PageHeader, SectionHeading, ProgressBar, Tag } from "@/components/ui/primitives";
import { SkillCard, TaskRow } from "@/features/shared/cards";
import { CreateDialog } from "@/features/shared/create-dialog";
import { Avatar } from "@/features/avatar/avatar";
import { friends } from "@/data/mock";

export default function Home() {
 const { skills, tasks, goals, outfit, name } = useDemo(); const [create, setCreate] = useState(false);
 const currentGoal = goals[0]; const visibleTasks = tasks.filter(t => t.date === "Сегодня").slice(0,3);
 return <div className="page-enter">
  <PageHeader eyebrow="ЧЕТВЕРГ, 29 ОКТЯБРЯ" title={"Хороший день для маленького шага, " + name + "."} description="Пока ты учишься и пробуешь, твой маленький мир растёт вместе с тобой." action={<button className="button primary" onClick={() => setCreate(true)}><Icon name="plus" size={17}/>Добавить задачу</button>}/>
  <div className="home-top-grid">
   <section className="world-card"><div className="world-card-heading"><Tag color="white"><span className="live-dot"/>ТВОЙ МАЛЕНЬКИЙ МИР</Tag><span className="world-level"><Icon name="sparkles" size={14}/>Ученик · уровень 3</span></div>
    <div className="world-orbit orbit-one"/><div className="world-orbit orbit-two"/>
    <span className="scene-caption"><span className="caption-dot"/>Сейчас мини-ты читает</span>
    <RoomScene outfit={outfit}/>
    <div className="world-card-bottom"><div><span className="small-label">ПРОГРЕСС ВИДЕН В ДЕТАЛЯХ</span><p>Больше уверенности.<br/><strong>Больше тебя.</strong></p></div><Link className="button light" href="/room">Войти в комнату<Icon name="arrow" size={16}/></Link></div>
   </section>
   <aside className="home-side-stack">
    <section className="card focus-card"><div className="flex items-center justify-between"><span className="eyebrow">СЕЙЧАС В ФОКУСЕ</span><span className="icon-tile small peach"><Icon name="target" size={18}/></span></div><h2>{currentGoal.title}</h2><p>Не весь путь сразу.<br/>Только следующий шаг.</p><div className="focus-progress"><span>{currentGoal.done} из {currentGoal.total} шагов</span><strong>{Math.round(currentGoal.done/currentGoal.total*100)}%</strong></div><ProgressBar value={currentGoal.done/currentGoal.total*100} color="peach"/><Link href="/tasks" className="text-link">Посмотреть цель<Icon name="arrow" size={16}/></Link></section>
    <Link href="/progress" className="growth-note"><div className="growth-mini"><Avatar outfit={outfit} pose="draw" stage={2}/><span className="growth-spark">✦</span></div><div><span className="small-label">МАЛЕНЬКАЯ ПОБЕДА</span><h3>Увереннее с каждым штрихом</h3><p>Иллюстрация выросла до уровня 3</p><span className="text-link">Заглянуть в альбом<Icon name="arrow" size={14}/></span></div></Link>
   </aside>
  </div>
  <section className="home-skills"><SectionHeading title="Твои направления" action="Все навыки" href="/skills"/><div className="skill-grid">{skills.slice(0,4).map(skill => <SkillCard key={skill.id} skill={skill}/>)}</div></section>
  <div className="home-bottom-grid"><section className="card today-card"><SectionHeading title="Маленькие шаги на сегодня" action="Все задачи" href="/tasks"/>{visibleTasks.map(t => <TaskRow key={t.id} task={t}/>)}<button className="inline-add" onClick={() => setCreate(true)}><Icon name="plus" size={16}/>Добавить свой шаг</button></section>
   <section className="card friends-preview"><SectionHeading title="В соседних мирах" action="Все друзья" href="/friends"/><p className="muted">Рядом тоже кто-то делает маленькие шаги.</p>{friends.slice(0,2).map(f => <Link className="friend-mini-row" href={"/friends/"+f.id} key={f.id}><span className="friend-mini-avatar" style={{ background: f.color + "28" }}><Avatar outfit={{...outfit,shirt:f.color,hair:f.hair}}/></span><span><strong>{f.name}</strong><small>{f.activity}</small></span><Icon name="chevron" size={15}/></Link>)}</section></div>
  <div className="gentle-note"><Icon name="leaf" size={17}/><span>Можно двигаться медленно. Твои достижения остаются с тобой.</span></div>
  {create && <CreateDialog kind="task" onClose={() => setCreate(false)}/>}
 </div>;
}
