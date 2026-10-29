"use client";
import { useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/icon";
import { useDemo } from "@/features/demo/demo-provider";
import { categoryLabels } from "@/data/mock";
import type { SkillCategory } from "@/types";

export function CreateDialog({ kind, onClose }: { kind: "skill" | "goal" | "task"; onClose: () => void }) {
 const { skills, goals, addSkill, addGoal, addTask } = useDemo();
 const [title, setTitle] = useState(""); const [description, setDescription] = useState("");
 const [skillId, setSkillId] = useState(skills[0]?.id || ""); const [goalId, setGoalId] = useState("");
 const [category, setCategory] = useState<SkillCategory>("learn"); const [difficulty, setDifficulty] = useState("25");
 const [color, setColor] = useState("lavender");
 const labels = { skill: ["Новый навык", "Любое направление, которое тебе интересно."], goal: ["Новая цель", "К чему ты хочешь прийти маленькими шагами?"], task: ["Маленький шаг", "Добавь конкретное действие, с которого можно начать."] };
 function submit(e: FormEvent<HTMLFormElement>) {
  e.preventDefault(); const trimmed = title.trim(); if (!trimmed) return;
  const id = crypto.randomUUID();
  if (kind === "skill") addSkill({ id, title: trimmed, description: description.trim() || "Моё новое направление", icon: category === "music" ? "music" : category === "move" ? "activity" : category === "create" ? "pen" : category === "work" ? "target" : "book", color, xp: 0, target: 100, level: 1, category });
  if (kind === "goal") addGoal({ id, title: trimmed, description: description.trim() || "Каждый шаг приближает к результату.", skillId, done: 0, total: 1, date: "В своём темпе" });
  if (kind === "task") { const goal = goals.find(g => g.id === goalId); addTask({ id, title: trimmed, skillId: goal?.skillId || skillId, goalId: goalId || undefined, xp: Number(difficulty), done: false, date: "Сегодня" }); }
  onClose();
 }
 return <Modal title={labels[kind][0]} description={labels[kind][1]} onClose={onClose}><form onSubmit={submit} className="form-stack">
  <label>Название<input autoFocus required maxLength={90} value={title} onChange={e => setTitle(e.target.value)} placeholder={kind === "skill" ? "Например, керамика" : kind === "goal" ? "Например, сыграть любимую мелодию" : "Например, позаниматься 15 минут"}/></label>
  {kind !== "task" && <label>Описание <span className="muted">· необязательно</span><textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Что делает это важным для тебя?"/></label>}
  {kind === "skill" ? <><label>Чем будет заниматься мини-ты?<select value={category} onChange={e => setCategory(e.target.value as SkillCategory)}>{Object.entries(categoryLabels).map(([id,label]) => <option key={id} value={id}>{label}</option>)}</select></label><fieldset className="color-field"><legend>Цвет навыка</legend>{["lavender","sage","peach","butter"].map(c => <button type="button" key={c} className={"color-option " + c + (color === c ? " selected" : "")} aria-label={c === "sage" ? "Шалфейный" : c === "peach" ? "Персиковый" : c === "butter" ? "Кремовый" : "Сиреневый"} aria-pressed={color === c} onClick={() => setColor(c)}>{color === c && <Icon name="check" size={15}/>}</button>)}</fieldset></> : <>
  <label>Навык<select required value={skillId} disabled={!!goalId} onChange={e => setSkillId(e.target.value)}>{skills.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}</select></label>
  {kind === "task" && <><label>Цель<select value={goalId} onChange={e => { setGoalId(e.target.value); const goal = goals.find(g => g.id === e.target.value); if(goal) setSkillId(goal.skillId); }}><option value="">Отдельная задача</option>{goals.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}</select></label><label>Сложность<select value={difficulty} onChange={e => setDifficulty(e.target.value)}><option value="10">Небольшой шаг · 10 XP</option><option value="25">Средняя задача · 25 XP</option><option value="50">Большое усилие · 50 XP</option></select></label></>}
  </>}
  <p className="form-note"><Icon name="info" size={15}/>Это UI-прототип. Изменения доступны до обновления страницы.</p>
  <div className="modal-actions"><button type="button" className="button secondary" onClick={onClose}>Отмена</button><button type="submit" className="button primary"><Icon name="plus" size={16}/>Добавить</button></div>
 </form></Modal>;
}
