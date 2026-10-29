import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { DemoProvider } from "@/features/demo/demo-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "TinyMe — маленькие шаги, видимый рост", template: "%s · TinyMe" },
  description: "Твоё личное пространство. Развивай навыки, достигай целей и наблюдай, как растёт твоя мини-версия.",
};
export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="ru"><body><DemoProvider><AppShell>{children}</AppShell></DemoProvider></body></html>;
}
