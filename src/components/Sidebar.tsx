"use client";

import Image from "next/image"; 
import Link from "next/link"; 
import { usePathname } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext"; 
import { useState, useEffect, useMemo } from "react";
import {
  LayoutGrid,
  TrendingUp,
  Briefcase,
  Handshake,
  Users,
  UserCircle,
  FolderKanban,
  FileText,
  CheckCircle,
  Wallet,
  BarChart3,
  Settings,
  UsersRound,
  LogOut,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
export default function Sidebar() {
  const pathname = usePathname();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  const toggleMenu = (menuKey: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuKey) 
        ? prev.filter(key => key !== menuKey)
        : [...prev, menuKey]
    );
  };

  const visibleMenuItems = useMemo(() => {
    if (pathname.startsWith("/bizdev")) {
      return MENU_ITEMS.filter(
        (item) => item.module === "common" || item.module === "bizdev"
      );
    }
    if (pathname.startsWith("/finance")) {
      return MENU_ITEMS.filter(
        (item) => item.module === "common" || item.module === "finance"
      );
    }
    if (pathname.startsWith("/operation")) {
      return MENU_ITEMS.filter(
        (item) => item.module === "common" || item.module === "operation"
      );
    }
    if (pathname.startsWith("/hr")) {
      return MENU_ITEMS.filter(
        (item) => item.module === "common" || item.module === "hr"
      );
    }
    return MENU_ITEMS;
  }, [pathname]);

  return (
    <aside className="w-64 bg-white border-r border-slate-200 px-6 py-5 flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-10">
        <Image src="/logo_marmud.png" alt="Logo" width={70} height={40} />
        <h1 className="text-2xl italic font-bold text-slate-900">Turbines</h1>
      </div>

      {/* Menu */}
      <nav className="space-y-1 text-sm text-slate-600 flex-1">
        {visibleMenuItems.map((item) => {
          if (item.children) {
            const isExpanded = expandedMenus.includes(item.key!);
            const hasActiveChild = item.children.some(child => pathname === child.href);
            return (
              <div key={item.key}>
                <button
                  onClick={() => toggleMenu(item.key!)}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg transition
                    ${hasActiveChild ? "bg-blue-100 text-blue-600 font-semibold" : "hover:bg-slate-100"}
                  `}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    {item.label}
                  </div>
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
                {isExpanded && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <MenuLink
                        key={child.href}
                        href={child.href}
                        label={child.label}
                        active={pathname === child.href}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          }
          return (
            <MenuLink
              key={item.href}
              href={item.href!}
              label={item.label}
              icon={item.icon}
              active={pathname === item.href}
            />
          );
        })}
      </nav>

      <UserSection />
    </aside>
  );
}
function MenuLink({
  href,
  label,
  icon,
  active,
}: {
  href: string;
  label: string;
  icon?: React.ReactNode;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition
        ${active ? "bg-blue-100 text-blue-600 font-semibold" : "hover:bg-slate-100"}
      `}
    >
      {icon}
      {label}
    </Link>
  );
}

const MENU_ITEMS = [
  // COMMON
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <LayoutGrid size={18} />,
    module: "common",
  },

  // BIZDEV
  { label: "New Leads", href: "/bizdev/new-leads", icon: <TrendingUp size={18} />, module: "bizdev" },
  { label: "Pipelines", href: "/bizdev/pipelines",icon: <FolderKanban size={18} />, module: "bizdev" },
  { label: "Partner List", href: "/bizdev/partner-list",icon: <Handshake size={18} />, module: "bizdev" },
  { label: "Contact List", href: "/bizdev/contact-list",icon: <Users size={18} />, module: "bizdev" },
  { label: "Projects", href: "/bizdev/projects",icon: <Briefcase size={18} />, module: "bizdev" },
  { label: "Proposals", href: "/bizdev/proposals",icon: <FileText size={18} />, module: "bizdev" },
  { label: "Approvals", href: "/bizdev/approvals",icon: <CheckCircle size={18} />, module: "bizdev" },
  { label: "Agreements", href: "/bizdev/agreements",icon: <FileText size={18} />, module: "bizdev" },

  // FINANCE
  { label: "Invoices", href: "/finance/invoices", icon: <Wallet size={18} />, module: "finance" },
  { label: "Reports", href: "/finance/reports", module: "finance" },

  // HR
  { 
    label: "Attendance", 
    icon: <UsersRound size={18} />, 
    module: "hr",
    key: "attendance",
    children: [
      { label: "Recent Activity", href: "/hr/attendance/recent-activity" },
      { label: "Summary", href: "/hr/attendance/summary" },
      { label: "Absent", href: "/hr/attendance/absent" },
    ]
  },
];

function UserSection() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <div className="relative border-t pt-4 mt-4">
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 transition"
      >
        <Image
          src="/"
          alt="User Avatar"
          width={40}
          height={40}
          className="rounded-full border"
        />

        <span className="text-sm font-medium text-slate-800">
          <p className="text-sm font-semibold text-gray-800">{user?.username}</p>
          <p className="text-xs text-gray-500">{user?.role}</p>
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute bottom-14 left-0 w-full bg-white border rounded-xl shadow-lg p-3 text-sm z-50">
          {/* User Info */}
          <div className="pb-2 border-b">
            <p className="text-sm font-semibold text-gray-800">{user?.username}</p>
            <p className="text-xs text-gray-500">{user?.role}</p>
          </div>

          {/* Actions */}
          <div className="mt-2 space-y-1">
            <Link
              href="/user-profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-slate-100 transition"
            >
              <Users size={16} className="text-black"/>
              <span className="text-black">User Profile</span>
            </Link>
            <button
              onClick={logout}
              className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-red-600 hover:bg-red-50 transition"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>    
          </div>
        </div>
      )}
    </div>
  );
}



