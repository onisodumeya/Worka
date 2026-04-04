import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Worka — Nigerian Job Board",
  description: "Find the best jobs and talent in Nigeria",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <main className="">{children}</main>
      </body>
    </html>
  );
}
