import type { Metadata } from "next";
import { SessionProvider } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Darevel Suite - Your Productivity Hub",
  description: "Access all your productivity tools in one place",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
