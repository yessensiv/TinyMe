export type SkillCategory = "learn" | "create" | "move" | "music" | "work";
export type Skill = { id: string; title: string; description: string; icon: string; color: string; xp: number; target: number; level: number; category: SkillCategory };
export type Goal = { id: string; title: string; skillId: string; description: string; done: number; total: number; date: string };
export type Task = { id: string; title: string; skillId: string; goalId?: string; xp: number; done: boolean; date: string };
export type Friend = { id: string; name: string; username: string; activity: string; color: string; hair: string; level: number; skills: string[]; roomOpen: boolean };
export type Snapshot = { id: string; title: string; date: string; type: "start" | "milestone" | "month"; level: number; description: string; theme: string };
export type Outfit = { shirt: string; hair: string; skin: string; accessory: string };
