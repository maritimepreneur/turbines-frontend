'use client';

import RoleCard from "@/components/RoleCard";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { Briefcase, Wallet, Settings, LogOut, User2, UserCircle2 } from "lucide-react";

export default function Home() {
  const { user, logout } = useAuth();

  return (
    // <ProtectedRoute>
      <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 sm:px-0 relative">

        {/* Welcome Message - Mobile */}
        <div className="sm:hidden mb-6 text-center">
          <p className="text-sm font-semibold text-gray-800">{user?.username}</p>
          <p className="text-xs text-gray-500">{user?.email}</p>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-semibold italic text-black">Turbines</h1>
        <p className="text-black mb-10 text-center">
          Welcome back! Choose your role to continue
        </p>

        {/* Cards */}
        <div
          className="
            flex
            flex-col
            sm:flex-row
            gap-6
            w-full
            max-w-5xl
            justify-center
            items-stretch
          "
        >
          <RoleCard
            title="BizDev"
            color="bg-sky-500"
            textColor="text-sky-500"
            icon={<Briefcase size={20} />}
            href="/bizdev/new-leads"
          />

          <RoleCard
            title="Finance"
            color="bg-green-500"
            textColor="text-green-500"
            icon={<Wallet size={20} />}
            href="/finance/invoice"
          />

          <RoleCard
            title="Operation"
            color="bg-orange-500"
            textColor="text-orange-500"
            icon={<Settings size={20} />}
            href="/operation/quotation"
          />

          <RoleCard
            title="Human Resources"
            color="bg-cyan-500"
            textColor="text-cyan-500"
            icon={<User2 size={20} />}
            href="/hr/attendance"
          />
          <RoleCard
            title="Employee"
            color="bg-yellow-500"
            textColor="text-yellow-500"
            icon={<UserCircle2 size={20} />}
            href="/employee/attendance"
          />
        </div>
      </main>
    // </ProtectedRoute>
  );
}
