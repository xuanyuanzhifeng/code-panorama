"use client";

import dynamic from "next/dynamic";

const ClientApp = dynamic(() => import("@/src/App"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-300">
      Loading...
    </div>
  ),
});

export default function ClientAppShell() {
  return <ClientApp />;
}
