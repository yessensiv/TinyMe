"use client";
import { createContext, useContext, useState, type ReactNode } from "react";
import { initialGoals, initialSkills, initialTasks } from "@/data/mock";
import type { Goal, Outfit, Skill, Task } from "@/types";
type DemoState = {
 skills: Skill[]; goals: Goal[]; tasks: Task[]; outfit: Outfit; name: string;
 setName: (value: string) => void; setOutfit: (value: Outfit) => void;
 addSkill: (skill: Skill) => void; addGoal: (goal: Goal) => void; addTask: (task: Task) => void;
 toggleTask: (id: string) => void; notify: (message: string) => void; toast: string;
};
const DemoContext = createContext<DemoState | null>(null);
export function DemoProvider({ children }: { children: ReactNode }) {
 const [skills, setSkills] = useState(initialSkills);
 const [goals, setGoals] = useState(initialGoals);
 const [tasks, setTasks] = useState(initialTasks);
 const [outfit, setOutfit] = useState<Outfit>({ shirt: "#a99bc8", hair: "#554338", skin: "#e6b58c", accessory: "none" });
 const [name, setName] = useState("Нурдаулет");
 const [toast, setToast] = useState("");
 function notify(message: string) { setToast(message); }
 return <DemoContext.Provider value={{ skills, goals, tasks, outfit, setOutfit, name, setName, toast, notify,
  addSkill: skill => { setSkills(s => [...s, skill]); notify("Навык добавлен в демо-пространство"); },
  addGoal: goal => { setGoals(s => [...s, goal]); notify("Новая цель появилась в твоём пространстве"); },
  addTask: task => { setTasks(s => [...s, task]); notify("Задача добавлена"); },
  toggleTask: id => setTasks(s => s.map(t => t.id === id ? { ...t, done: !t.done } : t)),
 }}>{children}</DemoContext.Provider>;
}
export function useDemo() { const value = useContext(DemoContext); if (!value) throw new Error("DemoProvider is required"); return value; }
