import type { Metadata } from "next";
import "@/styles/globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "VenueKit OS — The operating system for indoor playgrounds",
  description:
    "Book open play, parties, memberships, and sign waivers in minutes. A beautifully designed platform for indoor playgrounds and family entertainment venues.",
  openGraph: {
    title: "VenueKit OS",
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
      <body className="bg-cream text-ink antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
