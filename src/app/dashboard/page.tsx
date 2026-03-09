'use client';

import RoleCard from "@/components/RoleCard";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { Briefcase, Wallet, Settings, LogOut, User2, UserCircle2 } from "lucide-react";

export default function Home() {
  const { user, logout } = useAuth();

  return (
    <ProtectedRoute>
      <main className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-0 relative" style={{ backgroundImage: 'url(/dashboard-background.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>

        {/* Welcome Message - Mobile */}
        <div className="sm:hidden mb-6 text-center relative z-10">
          <p className="text-sm font-semibold text-white drop-shadow-lg">{user?.username}</p>
          <p className="text-xs text-gray-200 drop-shadow-md">{user?.email}</p>
        </div>

        {/* Title */}
        <h1 className="text-5xl font-bold italic text-white drop-shadow-lg relative z-10">Turbines</h1>
        <p className="text-white mb-10 text-center drop-shadow-md relative z-10">
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
            <div className="animate-[fadeInUp_0.6s_ease-out_0.1s_both]">
              <RoleCard
                title="BizDev"
                color="bg-sky-500"
                textColor="text-sky-500"
                icon={<Briefcase size={28} />}
                href="/bizdev/new-leads"
              />
            </div>
          )}

          {/* Finance - Visible to Admin & Finance */}
          {['admin', 'finance'].includes(user?.role?.toLowerCase() || '') && (
            <div className="animate-[fadeInUp_0.6s_ease-out_0.2s_both]">
              <RoleCard
                title="Finance"
                color="bg-green-500"
                textColor="text-green-500"
                icon={<Wallet size={28} />}
                href="/finance/quotation"
              />
            </div>
          )}

          {/* Operation - Visible to Admin & Operation */}
          {['admin', 'operation', 'operations'].includes(user?.role?.toLowerCase() || '') && (
            <div className="animate-[fadeInUp_0.6s_ease-out_0.3s_both]">
              <RoleCard
                title="Operation"
                color="bg-orange-500"
                textColor="text-orange-500"
                icon={<Settings size={28} />}
                href="/operation/quotation"
              />
            </div>
          )}

          {/* Employee - Visible to Every Authenticated User */}
          <div className="animate-[fadeInUp_0.6s_ease-out_0.4s_both]">
            <RoleCard
              title="Employee"
              color="bg-yellow-500"
              textColor="text-yellow-500"
              icon={<UserCircle2 size={28} />}
              href="/employee/profile"
            />
          </div>

          {/* Human Resources - Visible to Admin & HR */}
          {['admin', 'human resources', 'hr'].includes(user?.role?.toLowerCase() || '') && (
            <div className="animate-[fadeInUp_0.6s_ease-out_0.5s_both]">
              <RoleCard
                title="Human Resources"
                color="bg-cyan-500"
                textColor="text-cyan-500"
                icon={<User2 size={28} />}
                href="/human-resources/attendance"
              />
            </div>
          )}

        </div>
      </main>
    </ProtectedRoute>
  );
}