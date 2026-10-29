import type { Friend, Goal, Skill, Snapshot, Task } from "@/types";
export const initialSkills: Skill[] = [
 { id: "japanese", title: "Японский", description: "Понимать больше, чем субтитры", icon: "language", color: "peach", xp: 175, target: 300, level: 2, category: "learn" },
 { id: "drawing", title: "Иллюстрация", description: "Находить свой визуальный язык", icon: "pen", color: "lavender", xp: 345, target: 600, level: 3, category: "create" },
 { id: "movement", title: "Движение", description: "Чувствовать себя сильнее", icon: "activity", color: "sage", xp: 85, target: 100, level: 1, category: "move" },
 { id: "reading", title: "Чтение", description: "Открывать другие миры", icon: "book", color: "butter", xp: 420, target: 600, level: 3, category: "learn" },
];
export const initialGoals: Goal[] = [
 { id: "story", title: "Прочитать рассказ на японском", skillId: "japanese", description: "Начать с короткой истории и постепенно читать без словаря.", done: 4, total: 7, date: "15 ноября" },
 { id: "sketchbook", title: "Мой первый скетчбук", skillId: "drawing", description: "Заполнить 20 страниц наблюдениями и маленькими зарисовками.", done: 12, total: 20, date: "30 ноября" },
 { id: "books", title: "Пять книг этой осенью", skillId: "reading", description: "Читать в своём ритме и сохранять мысли, которые хочется запомнить.", done: 3, total: 5, date: "30 ноября" },
];
export const initialTasks: Task[] = [
 { id: "words", title: "Разобрать пять предложений", skillId: "japanese", goalId: "story", xp: 25, done: false, date: "Сегодня" },
 { id: "sketch", title: "Нарисовать предмет на столе", skillId: "drawing", goalId: "sketchbook", xp: 25, done: false, date: "Сегодня" },
 { id: "walk", title: "Выйти на небольшую прогулку", skillId: "movement", xp: 10, done: false, date: "Сегодня" },
 { id: "chapter", title: "Прочитать главу и выписать одну мысль", skillId: "reading", goalId: "books", xp: 25, done: true, date: "Сегодня" },
 { id: "kana", title: "Повторить знакомые знаки хираганы", skillId: "japanese", goalId: "story", xp: 10, done: true, date: "Вчера" },
];
export const friends: Friend[] = [
 { id: "aika", name: "Айка", username: "aika.draws", activity: "Собирает свой первый комикс", color: "#dda479", hair: "#544234", level: 4, skills: ["Иллюстрация", "Английский"], roomOpen: true },
 { id: "timur", name: "Тимур", username: "timur.space", activity: "Пишет музыку по вечерам", color: "#90a998", hair: "#3c3634", level: 3, skills: ["Музыка", "Чтение"], roomOpen: true },
 { id: "sana", name: "Сана", username: "sana.bloom", activity: "Учится замечать прекрасное", color: "#b0a1cc", hair: "#754c36", level: 5, skills: ["Фотография", "Японский"], roomOpen: true },
 { id: "arsen", name: "Арсен", username: "arsen.makes", activity: "Создаёт маленькие приложения", color: "#819ab9", hair: "#302b29", level: 2, skills: ["Разработка", "Бег"], roomOpen: false },
];
export const snapshots: Snapshot[] = [
 { id: "now", title: "Делаю увереннее", date: "29 октября 2026", type: "milestone", level: 3, description: "Иллюстрация, уровень 3. Рука увереннее, идей больше.", theme: "lilac" },
 { id: "book", title: "Третий новый мир", date: "24 октября 2026", type: "milestone", level: 3, description: "Ещё одна прочитанная книга. Ещё одна история внутри.", theme: "cream" },
 { id: "month", title: "Месяц маленьких шагов", date: "1 октября 2026", type: "month", level: 2, description: "Снимок месяца. Четыре направления и свой спокойный ритм.", theme: "sage" },
 { id: "start", title: "С этого всё началось", date: "12 сентября 2026", type: "start", level: 1, description: "Чистый скетчбук, первая цель и немного любопытства.", theme: "cream" },
];
export const categoryLabels = { learn: "Учусь и читаю", create: "Создаю", move: "Двигаюсь", music: "Занимаюсь музыкой", work: "Работаю над проектом" };
