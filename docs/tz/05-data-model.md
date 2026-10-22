## 5. Модель данных

### 5.1. Принцип хранения

**Достижение хранится один раз.** Комната, граф и статистика используют ссылки на него или вычисляемые представления.

Предмет интерьера не является отдельной копией достижения. Графовый узел также не хранит дублирующий бизнес-объект.

### 5.2. Сущности

| Сущность | Основные поля |
|---|---|
| `Profile` | `id`, `displayName`, `createdAt`, `timezone`, `locale` |
| `Skill` | `id`, `title`, `color`, `icon`, `createdAt`, `archivedAt?`, `isCustom` |
| `Goal` | `id`, `title`, `description?`, `skillId`, `status`, `dueDate?`, `createdAt`, `completedAt?`, `archivedAt?` |
| `Task` | `id`, `goalId?`, `skillId`, `title`, `description?`, `difficulty`, `type`, `status`, `dueDate?`, `createdAt`, `completedAt?` |
| `Achievement` | `id`, `kind`, `title`, `skillId`, `date`, `xp`, `item?`, `links`, `taskId?`, `goalId?`, `durationMinutes?`, `levelReached?`, `rulesVersion` |
| `AvatarState` | `skinColor`, `hairColor`, `hairId`, `outfitId`, `accessoryId?` |
| `AvatarChange` | `id`, `date`, `state` |
| `Unlock` | `id`, `assetId`, `sourceAchievementId`, `unlockedAt` |
| `RoomPlacement` | `slotId`, `achievementId` |
| `Preferences` | `roomTheme`, `graphTheme`, `motionPreference`, `onboardingCompleted` |
| `AppState` | `schemaVersion`, `revision`, `profile`, коллекции сущностей, `preferences` |

`kind` достижения:

- `task_completion` — результат реального действия;
- `level_milestone` — наградная веха.

```ts
type Achievement = {
  id: string;
  kind: "task_completion" | "level_milestone";
  title: string;
  skillId: string;
  date: string; // ISO 8601, UTC
  xp: number;
  item?: {
    catalogId: string;
    stage: number;
  };
  links: string[]; // ID связанных достижений
  taskId?: string;
  goalId?: string;
  durationMinutes?: number;
  levelReached?: number;
  rulesVersion: number;
};
```

### 5.3. Правила целостности

- ID генерируются независимо от названий.
- У завершённой задачи — не более одного достижения выполнения.
- У вехи уникальна пара `skillId + levelReached`.
- XP вехи равен нулю: она не начисляет повторно XP породивших её действий.
- Суммарный XP навыка вычисляется по достижениям выполнения.
- Уровни и статистика являются производными данными.
- Связь не может вести на отсутствующее достижение или на самого себя.
- Направление связи задаёт её смысл; на графе связь может отображаться без стрелки.
- Календарный срок задачи хранится как `YYYY-MM-DD`; моменты событий — в UTC.

### 5.4. Исправление ошибок

Предлагаемое правило MVP:

- До окончательного подтверждения выполнение можно отменить.
- После сохранения достижение остаётся в истории.
- Название и заметку можно уточнить.
- XP, навык и время события не редактируются задним числом.

Полноценное исправление с пересчётом XP требует отдельного согласования: оно затрагивает требование о неоткатываемом прогрессе.
