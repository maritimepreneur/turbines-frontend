import Sidebar from "@/components/Sidebar";
import "../globals.css";
import ProtectedRoute from '@/components/ProtectedRoute';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 ml-0 lg:ml-64 pt-16 lg:pt-0 p-3 sm:p-6 bg-slate-50">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
