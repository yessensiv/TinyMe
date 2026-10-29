import type { Outfit } from "@/types";
import { PixelPerson, defaultOutfit } from "@/features/avatar/avatar";

function Plant({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
 return <g transform={"translate("+x+" "+y+") scale("+scale+")"}><ellipse cx="0" cy="21" rx="16" ry="6" fill="#78644e" opacity=".1"/><path d="M-12 1H12L8 23H-8Z" fill="#d4a17d"/><path d="M-14 0h28v5h-28z" fill="#e5b18c"/><path d="M-2-34h4V2h-4z" fill="#78936a"/><path d="M-2-20h-12v-5h-7v-10h12v5h7zm4-8h9v-7h12v10h-7v7H2zM-2-6h-10v-4h-8v-9h11v5h7zm4-6h11v-5h11v9h-9v5H2z" fill="#8ba47a"/></g>;
}
export function RoomScene({ outfit = defaultOutfit, evening = false, pose = "read", stage = 2, compact = false }: { outfit?: Outfit; evening?: boolean; pose?: string; stage?: number; compact?: boolean }) {
 return <svg viewBox="0 0 720 500" className={"room-scene " + (compact ? "compact" : "")} role="img" aria-label="Уютная изометрическая комната: мини-ты читает среди книг, растений и предметов творчества">
  <ellipse cx="368" cy="424" rx="275" ry="40" fill="#c6bed0" opacity=".13"/>
  <path d="M66 292 353 181l301 111-301 135Z" fill="#d2b995"/>
  <path d="M66 292v16l287 136v-17zm287 135 301-135v16L353 444Z" fill="#bba080"/>
  <path d="m70 295 283-109 296 107-296 128Z" fill="#e1cba9"/>
  <g stroke="#c5ac89" strokeWidth="1.2" opacity=".8">
   {[0,1,2,3,4,5,6,7,8].map(i => <path key={i} d={"M"+(70+i*32)+" "+(295-i*12)+" "+(353+i*33)+" "+(421-i*15)}/>)}
   {[0,1,2,3,4,5,6,7].map(i => <path key={i} d={"M"+(70+i*37)+" "+(295+i*16)+" "+(353+i*37)+" "+(186+i*14)}/>)}
  </g>
  <path d="M66 292V112L353 4v177Z" fill={evening ? "#c9bfd6" : "#e8e3da"}/>
  <path d="M353 4 654 115v177L353 181Z" fill={evening ? "#b5a8c6" : "#dad9cd"}/>
  <path d="m66 112 287-108 301 111" fill="none" stroke="#f9f5ec" strokeWidth="6"/>
  <path d="M66 292 353 181l301 111" fill="none" stroke="#c9bfac" strokeWidth="8"/>
  <path d="M353 9v170" stroke="#c7bfaf" strokeWidth="3"/>
  <path d="m108 125 132-49v107l-132 51Z" fill="#b29d85"/>
  <path d="m116 128 116-43v92l-116 45Z" fill={evening ? "#9199c6" : "#b6d2cf"}/>
  <path d="m116 184 41-38 27 19 26-38 22 15v35l-116 45Z" fill={evening ? "#7e88aa" : "#93b6a3"}/>
  <path d="m116 201 61-40 55 2v14l-116 45Z" fill={evening ? "#737c99" : "#a5c1a5"}/>
  <path d="M173 107v92m-57-25 116-44" stroke="#eee5d5" strokeWidth="6"/>
  <path d="m102 230 136-52 11 6-137 54Z" fill="#f8f2e5"/>
  <path d="m102 121 6-3v118l-6-3z" fill="#d4bda4"/>
  <path d="m242 71 7 3v110l-7 4z" fill="#d4bda4"/>
  <path d="m427 71 103 38v73l-103-38Z" fill="#a89981"/>
  <path d="m434 81 89 32v59l-89-33Z" fill="#f4eddf"/>
  <path d="m447 124 19-12 15 14 11-6 22 31-67-25Z" fill="#a7af90"/>
  <circle cx="492" cy="116" r="9" fill="#e1bf7b"/>
  <path d="m554 117 58 22v9l-58-22Z" fill="#b4a087"/>
  <path d="m562 113 8 3v-21l-8-3zm13 5 7 3V97l-7-3zm12 4 8 3v-17l-8-3z" fill="#a08ba5"/>
  <Plant x={592} y={115} scale={.45}/>
  <path d="m99 254 90-34 58 23-88 35Z" fill="#a78a6f"/>
  <path d="m99 254 60 24v71l-60-28Z" fill="#c4a180"/>
  <path d="m159 278 88-35v65l-88 41Z" fill="#b59271"/>
  <path d="m169 281 68-27v19l-68 29zm0 29 68-30v21l-68 32Z" fill="#796f62"/>
  <path d="m173 282 8-3v16l-8 3zm12-5 9-3v16l-9 4zm13-5 6-2v17l-6 2zm10-4 10-4v17l-10 4zm14-5 9-4v16l-9 4z" fill="#ddd0ae"/>
  <path d="m174 312 7-3v16l-7 3zm12-5 7-3v16l-7 3zm12-5 10-4v16l-10 4z" fill="#a0ad91"/>
  <path d="m218 296 13-6v16l-13 6Z" fill="#b49aaa"/>
  <Plant x={132} y={239} scale={.6}/>
  <path d="m191 233 20-8 17 6-20 8Z" fill="#f1ddab"/><path d="m191 233 17 6v7l-17-6zm17 6 20-8v7l-20 7Z" fill="#a78a77"/>
  <path d="m214 335 127-52 141 57-125 57Z" fill="#c2b6cf"/>
  <path d="m226 336 115-46 128 50-112 50Z" fill="#d9cedf"/>
  <path d="m242 336 99-39 111 43-95 43Z" fill="none" stroke="#efdfdb" strokeWidth="3" strokeDasharray="5 5"/>
  <path d="m437 264 95-37 66 25-95 40Z" fill="#bf9e7c"/>
  <path d="m437 264 66 28v10l-66-29zm66 28 95-40v10l-95 41Z" fill="#a88969"/>
  <path d="m449 277 7 3v56l-7-3zm129-15 7-3v52l-7 3zm-78 40 7-3v57l-7 4Z" fill="#a48768"/>
  <path d="m472 249 45-17 31 12-45 18Z" fill="#d4d0ca"/>
  <path d="m479 246 36-14 25 10-36 15Z" fill="#f7f3eb"/>
  <path d="m495 231-3-38 46 17 3 38Z" fill="#8a8b86"/>
  <path d="m499 226-2-27 36 13 2 27Z" fill={evening ? "#b1b0d8" : "#c4d3c4"}/>
  <path d="m504 212 20 7m-19-1 13 5" stroke="#839a89" strokeWidth="2"/>
  <path d="m557 239 6-37m-16 2 24 9-4-20-13-4Z" fill="#d4b068" stroke="#b7975a" strokeWidth="2"/>
  <path d="m565 239-17 6 14 5 16-7Z" fill="#b79d6a"/>
  <path d="m494 311 29-12 27 11-29 13Z" fill="#b3bd9d"/><path d="M494 311v35l27 12v-35zm27 12 29-13v34l-29 14Z" fill="#9ba987"/>
  <Plant x={610} y={304} scale={1.05}/>
  <path d="m279 226 34-13 21 8-34 14Z" fill="#bfa6a0"/>
  <path d="m279 226 21 9v11l-21-9zm21 9 34-14v11l-34 14Z" fill="#9e8586"/>
  <path d="m286 218 28-10 19 7-29 11Z" fill="#f5e8d3"/><path d="m286 218 18 8v5l-18-8zm18 8 29-11v5l-29 12Z" fill="#d4c2a1"/>
  <g transform="translate(338 232) scale(1.5)"><PixelPerson outfit={outfit} pose={pose} stage={stage}/></g>
  <path d="m252 371 28-12 36 15-29 13Z" fill="#cda17e"/><path d="m252 371 35 16v16l-35-16zm35 16 29-13v15l-29 14Z" fill="#b88b6f"/>
  <path d="m261 365 18-8 26 11-18 8Z" fill="#ece3d4"/>
  <path d="m346 122 8-3 8 3-8 4Z" fill="#b8af9b"/>
  <path d="m689 203 3-8 3 8 8 3-8 3-3 8-3-8-8-3Z" fill="#c7b8d5"/>
  <path d="m44 232 2-6 2 6 6 2-6 2-2 6-2-6-6-2Z" fill="#c4b995"/>
 </svg>;
}
