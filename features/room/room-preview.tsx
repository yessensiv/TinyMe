import { PixelItem } from "@/components/ui/pixel-item";
export function RoomPreview() {
  return <svg viewBox="0 0 640 470" role="img" aria-label="Иллюстрация уютной комнаты: кровать, стол, стул и растение у окна" className="mx-auto w-full max-w-2xl" shapeRendering="crispEdges">
    <ellipse cx="320" cy="402" rx="240" ry="27" fill="#dddcd0"/>
    <path d="M80 188 320 75 560 188v122L320 430 80 310Z" fill="#a79579"/><path d="M80 188 320 75v135L80 326Z" fill="#d6decb"/><path d="m320 75 240 113v138L320 210Z" fill="#becbb5"/>
    <path d="M80 326 320 210 560 326 320 442Z" fill="#d7b78c"/><path d="M80 326 320 442v10L80 336Z" fill="#aa8560"/><path d="m320 442 240-116v10L320 452Z" fill="#947150"/>
    <g stroke="#bd976c" strokeWidth="2" opacity=".7">{[1,2,3,4,5,6,7].map(i => <path key={i} d={`M${80 + i * 30} ${326 - i * 14.5}l240 116`}/>)}{[1,2,3,4,5,6,7].map(i => <path key={i} d={`M${80 + i * 30} ${326 + i * 14.5}l240 -116`}/>)}</g>
    <path d="m80 315 240-116 240 116v11L320 210 80 326Z" fill="#f1ebd8"/>
    <path d="m132 178 96-46v82l-96 46Z" fill="#8a9a7a"/><path d="m139 181 82-39v67l-82 39Z" fill="#e8efe4"/><path d="m146 185 68-32v50l-68 32Z" fill="#afced0"/><path d="m148 220 19-23 14 3 16-27 17 5v25l-66 31Z" fill="#92b399"/><path d="m178 167 6-3v65l-6 3Zm-39 43 82-39v5l-82 39Z" fill="#f7f2df"/><path d="m129 257 102-49v9l-102 49Z" fill="#f8f1da"/>
    <path d="m402 145 49 24v45l-49-24Z" fill="#8e795b"/><path d="m408 154 37 18v32l-37-18Z" fill="#eee5cb"/><path d="m419 177 8-7 12 24-20-10Z" fill="#8c9f77"/>
    <PixelItem kind="bed" x="137" y="217" width="150" height="150"/><PixelItem kind="desk" x="344" y="233" width="130" height="130"/><PixelItem kind="plant" x="460" y="218" width="83" height="116"/><PixelItem kind="chair" x="327" y="287" width="95" height="95"/>
  </svg>;
}
