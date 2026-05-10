import type { Metadata } from "next";
import { Prompt } from "next/font/google";
import { headers } from "next/headers";
import { Providers } from "@/components/Providers";
import "./globals.css";

const prompt = Prompt({
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-prompt",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ARCHD Attendance",
  description: "ระบบบันทึกการเข้าเรียนสำหรับนักศึกษา",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const h = await headers();
  const locale = h.get("x-locale") ?? "th";
  const htmlLang = locale === "en" ? "en" : "th";

  return (
    <html lang={htmlLang} suppressHydrationWarning>
      <body className={`${prompt.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
