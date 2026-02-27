'use client';

import RoleCard from "@/components/RoleCard";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { Briefcase, Wallet, Settings, LogOut, User2, UserCircle2, GraduationCap } from "lucide-react";

export default function Home() {
  const { user, logout } = useAuth();

  return (
    <ProtectedRoute>
      <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 sm:px-0 relative">

        {/* Welcome Message - Mobile */}
        <div className="sm:hidden mb-6 text-center">
          <p className="text-sm font-semibold text-gray-800">{user?.username}</p>
          <p className="text-xs text-gray-500">{user?.email}</p>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-semibold italic text-black">Turbines</h1>
        <p className="text-black mb-10 text-center">
          Welcome <span className="font-semibold">{user?.username}</span> to Turbines
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
            flex-wrap
          "
        >
          {/* BizDev - Visible to Admin & BizDev */}
          {['admin', 'bizdev', 'business development'].includes(user?.role?.toLowerCase() || '') && (
            <RoleCard
              title="BizDev"
              color="bg-sky-500"
              textColor="text-sky-500"
              icon={<Briefcase size={20} />}
              href="/bizdev/new-leads"
            />
          )}

          {/* Finance - Visible to Admin & Finance */}
          {['admin', 'finance'].includes(user?.role?.toLowerCase() || '') && (
            <RoleCard
              title="Finance"
              color="bg-green-500"
              textColor="text-green-500"
              icon={<Wallet size={20} />}
              href="/finance/quotation"
            />
          )}

          {/* Operation - Visible to Admin & Operation */}
          {['admin', 'operation', 'operations'].includes(user?.role?.toLowerCase() || '') && (
            <RoleCard
              title="Operation"
              color="bg-orange-500"
              textColor="text-orange-500"
              icon={<Settings size={20} />}
              href="/operation/quotation"
            />
          )}

          {/* Employee - Visible to Every Authenticated User */}
          <RoleCard
            title="Employee"
            color="bg-yellow-500"
            textColor="text-yellow-500"
            icon={<UserCircle2 size={20} />}
            href="/employee/profile"
          />

          {/* Human Resources - Visible to Admin & HR */}
          {['admin', 'human resources', 'hr'].includes(user?.role?.toLowerCase() || '') && (
            <RoleCard
              title="Human Resources"
              color="bg-cyan-500"
              textColor="text-cyan-500"
              icon={<User2 size={20} />}
              href="/human-resources/attendance"
            />
          )}

          {/* Training Course - Visible to Admin & Training */}
          {['admin', 'training course', 'training', 'trainer'].includes(user?.role?.toLowerCase() || '') && (
            <RoleCard
              title="Training Course"
              color="bg-purple-500"
              textColor="text-purple-500"
              icon={<GraduationCap size={20} />}
              href="/training-course/dashboard"
            />
          )}

        </div>
      </main>
    </ProtectedRoute>
  );
}