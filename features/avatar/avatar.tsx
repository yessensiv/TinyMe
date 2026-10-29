import type { Outfit } from "@/types";
export const defaultOutfit: Outfit = { shirt: "#a99bc8", hair: "#554338", skin: "#e6b58c", accessory: "none" };
export function PixelPerson({ outfit = defaultOutfit, pose = "idle", stage = 1 }: { outfit?: Outfit; pose?: string; stage?: number }) {
 const { shirt, hair, skin, accessory } = outfit;
 return <g shapeRendering="crispEdges">
  <ellipse cx="16" cy="58" rx="14" ry="3" fill="#42382f" opacity=".12"/>
  <path d="M8 39h17v13H8z" fill="#555365"/><path d="M8 50h7v7H6v-4h2zm10 0h7v3h3v4H18z" fill="#48403e"/>
  <path d="M7 24h19v18H7z" fill={shirt}/><path d="M10 24h12v3H10z" fill="#fff" opacity=".26"/>
  <path d="M4 28h4v12H4zm22 0h4v12h-4z" fill={skin}/>
  <path d="M7 5h18v18H7zM4 9h3v11H4zm21 0h3v11h-3zM10 23h12v4H10z" fill={skin}/>
  <path d="M7 3h18v5H7zM4 7h6v8H4zm18 0h6v8h-6zM10 7h12v3H10z" fill={hair}/>
  <path d="M10 15h3v3h-3zm10 0h3v3h-3z" fill="#3f3430"/>
  <path d="M9 19h4v2H9zm12 0h4v2h-4z" fill="#d88e83" opacity=".7"/>
  <path d={stage > 1 ? "M14 21h6v2h-6z" : "M15 21h4v1h-4z"} fill="#a26055"/>
  {accessory === "glasses" && <path d="M8 14h7v5H8zm10 0h7v5h-7zm-3 1h3" fill="none" stroke="#48434b" strokeWidth="1.5"/>}
  {accessory === "headphones" && <path d="M4 15V5h24v10M3 13h4v9H3zm23 0h4v9h-4z" fill="none" stroke="#75628e" strokeWidth="3"/>}
  {pose === "read" && <><path d="m5 34 11 3 12-3v12l-12 2-11-3z" fill="#7e9475"/><path d="m7 35 9 2 10-2v8l-10 2-9-2z" fill="#f7efdc"/><path d="M16 38v8" stroke="#baad91"/><path d="M3 34h5v5H3zm23 0h5v5h-5z" fill={skin}/></>}
  {pose === "draw" && <><path d="M2 38h26v8H2z" fill="#ede4cb"/><path d="m16 39 9-11 2 2-9 11z" fill="#cc9461"/><path d="m22 29 3-3 2 2-3 3z" fill="#5a4b43"/></>}
  {pose === "move" && <><path d="M0 33h31v3H0zM0 29h4v11H0zm28 0h4v11h-4z" fill="#6a6a76"/><path d="M4 32h5v5H4zm19 0h5v5h-5z" fill={skin}/></>}
  {stage > 1 && <path d="M34 8h2V5h2v3h2v2h-2v3h-2v-3h-2z" fill="#b8a464"/>}
 </g>;
}
export function Avatar({ outfit = defaultOutfit, pose = "idle", stage = 1, className = "" }: { outfit?: Outfit; pose?: string; stage?: number; className?: string }) {
 return <svg className={"pixel-avatar " + className} viewBox="-5 0 50 64" role="img" aria-label={"Пиксельный персонаж, " + (pose === "read" ? "читает" : pose === "draw" ? "рисует" : pose === "move" ? "тренируется" : "отдыхает")}><PixelPerson outfit={outfit} pose={pose} stage={stage}/></svg>;
}
