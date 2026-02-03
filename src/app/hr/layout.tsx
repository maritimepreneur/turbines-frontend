import Sidebar from "@/components/Sidebar";
import "../globals.css";

export default function HRLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 bg-slate-50">{children}</main>
    </div>
  );
}