import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Playground OS — The Best Place for Kids to Play, Celebrate, and Explore",
  description:
    "Book open play, parties, memberships, and sign waivers in minutes. A beautifully designed platform for indoor playgrounds and family entertainment venues.",
  openGraph: {
    title: "Playground OS",
    description: "Book open play, parties, memberships, and waivers in minutes.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-cream text-ink antialiased">{children}</body>
    </html>
  );
}
