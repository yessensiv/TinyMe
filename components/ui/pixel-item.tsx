import type { SVGProps } from "react";
import type { ItemKind } from "@/config/demo";

// Локальные иллюстрации прототипа; на этапе редактора заменяются PNG-спрайтами.
export function PixelItem({ kind, ...props }: SVGProps<SVGSVGElement> & { kind: ItemKind }) {
  return <svg viewBox="0 0 100 100" aria-hidden="true" shapeRendering="crispEdges" {...props}>
    <path fill="#292f2520" d="M18 83h65v5H18z"/>
    {kind === "plant" && <><path fill="#365c43" d="M48 30h5v39h-5zM29 27h15v7h9v12H37v-7h-8zM55 16h13v19H54v10h-6V27h7zM56 44h18v13H57v8h-7V52h6z"/><path fill="#729663" d="M31 23h12v7h8v8H39v-7h-8zM57 12h13v14H57zM59 41h17v9H59z"/><path fill="#a96e51" d="M36 64h31v8h-4v13H40V72h-4z"/><path fill="#d6a17b" d="M36 64h31v6H36zM41 73h7v10h-7z"/></>}
    {kind === "lamp" && <><path fill="#76644e" d="M47 35h5v46h-5zM36 80h28v5H36z"/><path fill="#caa65f" d="M36 18h28v8h5v11h6v6H25v-6h6V26h5z"/><path fill="#f1dca0" d="M37 18h21v8h5v11H31V26h6z"/><path fill="#fff0c5" d="M39 21h5v12h-5z"/></>}
    {kind === "shelf" && <><path fill="#8a634a" d="M17 36h66v47H17zM22 83h5v5h-5zM74 83h5v5h-5z"/><path fill="#c99f74" d="M17 31h66v7H17zM22 42h55v16H22zM22 64h55v14H22z"/><path fill="#6e8167" d="M28 42h8v16h-8zM57 64h13v14H57z"/><path fill="#e2c58f" d="M38 45h7v13h-7zM29 68h20v10H29z"/><path fill="#b98069" d="M48 42h6v16h-6zM59 47h12v11H59z"/></>}
    {(kind === "armchair" || kind === "sofa") && <><path fill={kind === "sofa" ? "#77718a" : "#61765a"} d="M22 29h56v39H22zM13 48h12v32H13zM75 48h12v32H75zM19 68h63v13H19z"/><path fill={kind === "sofa" ? "#afa6bb" : "#9cad83"} d="M26 33h48v28H26zM23 62h54v10H23zM13 47h12v8H13zM75 47h12v8H75z"/><path fill="#645344" d="M19 81h7v6h-7zM75 81h6v6h-6z"/>{kind === "sofa" ? <path fill="#77718a" d="M49 33h3v39h-3z"/> : <path fill="#e2c99d" d="M37 43h24v17H37z"/>}</>}
    {kind === "sculpture" && <><path fill="#b17b5f" d="M32 33h10v8h18v-8h9v24h-5v14H40V61h-8zM43 69h19v9H43zM35 78h35v7H35z"/><path fill="#d4a080" d="M35 37h7v9h19v-8h5v18h-7v13H43V55h-8z"/><path fill="#5d5146" d="M44 48h4v4h-4zM57 48h4v4h-4z"/></>}
    {kind === "bed" && <><path fill="#967052" d="M20 21h60v64h-7v-7H27v7h-7z"/><path fill="#d3b58c" d="M24 26h52v49H24z"/><path fill="#f6efdb" d="M26 32h48v17H26z"/><path fill="#7e946d" d="M25 48h50v24H25z"/><path fill="#a7b78b" d="M25 48h50v7H25zM29 55h4v17h-4z"/></>}
    {kind === "desk" && <><path fill="#8b6045" d="M20 46h7v39h-7zM72 46h7v39h-7zM18 47h63v8H18z"/><path fill="#ceaa7b" d="M14 38h71v10H14zM54 55h22v17H54z"/><path fill="#a67d55" d="M60 61h9v3h-9z"/></>}
    {kind === "chair" && <><path fill="#8b684b" d="M32 24h7v61h-7zM62 24h7v61h-7zM29 57h44v9H29zM33 66h6v20h-6zM63 66h6v20h-6z"/><path fill="#c3a477" d="M32 24h37v22H32zM29 54h44v8H29z"/><path fill="#d8bd94" d="M36 28h28v5H36z"/></>}
  </svg>;
}
