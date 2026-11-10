import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "goodmiles. | Professional car care, right where you park",
  description: "Premium automotive care for apartment living.",
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
