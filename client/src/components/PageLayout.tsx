import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export default function PageLayout({ children }: Props) {
  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-pink-50 pt-32">
      {children}
    </main>
  );
}