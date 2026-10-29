import Link from "next/link";
import { Icon } from "@/components/ui/icon";
export default function NotFound() { return <div className="empty-state not-found"><span className="empty-icon"><Icon name="leaf" size={38}/></span><p className="eyebrow">НЕМНОГО СБИЛИСЬ С ПУТИ</p><h1>Здесь пока тихо</h1><p>Такой страницы или комнаты нет. Твой мир ждёт тебя на главной.</p><Link href="/" className="button primary mt-5">Вернуться к себе<Icon name="arrow" size={16}/></Link></div>; }
