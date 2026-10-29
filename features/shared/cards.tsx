"use client";
import Link from "next/link";
import type { Goal, Skill, Task } from "@/types";
import { Icon } from "@/components/ui/icon";
import { ProgressBar, Tag } from "@/components/ui/primitives";
import { useDemo } from "@/features/demo/demo-provider";

export function SkillCard({ skill, onClick }: { skill: Skill; onClick?: () => void }) {
 const start = 50 * skill.level * (skill.level - 1);
 const progress = (skill.xp - start) / (skill.target - start) * 100;
 const content = <><div className="skill-card-top"><span className={"icon-tile " + skill.color}><Icon name={skill.icon} size={22}/></span><span className="level-pill">Уровень {skill.level}</span></div><h3>{skill.title}</h3><p>{skill.description}</p><ProgressBar value={progress} color={skill.color}/><div className="skill-card-bottom"><span>{skill.xp} <span className="muted">/ {skill.target} XP</span></span><span>{skill.level < 3 ? "Начинаю" : "Увереннее"}<Icon name="arrow" size={14}/></span></div></>;
 return onClick ? <button className="skill-card card text-left" onClick={onClick}>{content}</button> : <Link href="/skills" className="skill-card card">{content}</Link>;
}
export function TaskRow({ task }: { task: Task }) {
 const { skills, toggleTask } = useDemo(); const skill = skills.find(s => s.id === task.skillId);
 return <div className={"task-row " + (task.done ? "done" : "")}><button className="task-checkbox" aria-label={(task.done ? "Вернуть задачу: " : "Отметить выполненной: ") + task.title} aria-pressed={task.done} onClick={() => toggleTask(task.id)}>{task.done && <Icon name="check" size={14}/>}</button><div className="task-copy"><strong>{task.title}</strong><span><i className={"color-dot " + (skill?.color || "lavender")}/>{skill?.title || "Мой навык"}</span></div><span className={"xp-label " + (task.done ? "muted" : "")}>{task.done ? <Icon name="check" size={15}/> : "+" + task.xp + " XP"}</span></div>;
}
export function GoalCard({ goal, onClick }: { goal: Goal; onClick?: () => void }) {
 const { skills } = useDemo(); const skill = skills.find(s => s.id === goal.skillId);
 return <button className="goal-card card text-left" onClick={onClick}><div className="flex items-center justify-between"><Tag color={skill?.color}><Icon name={skill?.icon || "target"} size={13}/>{skill?.title}</Tag><Icon name="arrow" size={17}/></div><h3>{goal.title}</h3><p>{goal.description}</p><ProgressBar value={goal.done / goal.total * 100} color={skill?.color}/><div className="goal-card-bottom"><span>{goal.done} из {goal.total} шагов</span><span><Icon name="calendar" size={13}/>{goal.date}</span></div></button>;
}
