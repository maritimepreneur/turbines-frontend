"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { LayoutGrid, TrendingUp, ChevronDown, Wallet, Settings, LogOut, Users } from "lucide-react";

// ===== Sidebar Component =====
export default function Sidebar() {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});

  // Filter menu berdasarkan route/module
  const visibleMenuItems = useMemo(() => {
    if (pathname.startsWith("/bizdev")) {
      return MENU_ITEMS.filter((item) => item.label === "Dashboard" || item.label === "Bisdev");
    }
    if (pathname.startsWith("/finance")) {
      return MENU_ITEMS.filter((item) => item.label === "Dashboard" || item.label === "Finance");
    }
    if (pathname.startsWith("/operation")) {
      return MENU_ITEMS.filter((item) => item.label === "Dashboard" || item.label === "Operation");
    }
    return MENU_ITEMS; // default, misal homepage
  }, [pathname]);

  // Buka otomatis sub-menu sesuai route
  useEffect(() => {
    const newOpenMenus: { [key: string]: boolean } = {};
    visibleMenuItems.forEach((item) => {
      if (item.subMenu) {
        // Cek apakah pathname cocok dengan salah satu submenu
        const isSubmenuActive = item.subMenu.some(sub => pathname.startsWith(sub.href));
        newOpenMenus[item.label] = isSubmenuActive;
      }
    });
    setOpenMenus(newOpenMenus);
  }, [pathname, visibleMenuItems]);

  return (
<aside className="w-64 bg-white border-r border-slate-200 px-6 py-5 flex flex-col">
    {/* Logo */}
    <div className="flex items-center gap-3 mb-10">
      <Image src="/logo_marmud.png" alt="Logo Maritim Muda" width={70} height={40} />
      <h1 className="text-2xl italic font-bold text-slate-900">Turbines</h1>
    </div>

    {/* Menu */}
    <nav className="space-y-1 text-sm text-slate-600 flex-1">
      {visibleMenuItems.map((item) =>
        item.subMenu ? (
          <div key={item.label}>
            <button
              onClick={() =>
                setOpenMenus((prev) => ({
                  ...prev,
                  [item.label]: !prev[item.label],
                }))
              }
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-100 transition"
            >
              <div className="flex items-center gap-3 font-medium">
                {item.icon}
                {item.label}
              </div>
              <ChevronDown
                size={16}
                className={`transition-transform duration-200 ${
                  openMenus[item.label] ? "rotate-180" : ""
                }`}
              />
            </button>

            <div
              className={`ml-8 mt-1 space-y-1 overflow-hidden transition-all duration-300
                ${openMenus[item.label] ? "max-h-screen opacity-100" : "max-h-0 opacity-0"}
              `}
            >
              {item.subMenu.map((sub) => (
                <MenuLink
                  key={sub.href}
                  href={sub.href}
                  label={sub.label}
                  active={pathname === sub.href}
                  sub
                />
              ))}
            </div>
          </div>
        ) : (
          <MenuLink
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            active={pathname === item.href}
          />
        )
      )}
    </nav>

    {/* ===== USER SECTION ===== */}
    <UserSection />
  </aside>
);
}

// ===== Menu Link Component =====
function MenuLink({
  href,
  label,
  icon,
  active,
  sub,
}: {
  href: string;
  label: string;
  icon?: React.ReactNode;
  active: boolean;
  sub?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition
        ${sub ? "text-sm" : ""}
        ${active ? "bg-sky-100 text-sky-600 font-semibold" : "hover:bg-slate-100"}
      `}
    >
      {icon}
      {label}
    </Link>
  );
}

// ===== Menu Items =====
const MENU_ITEMS = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <LayoutGrid size={18} />,
  },
  {
    label: "Bisdev",
    href: "/bizdev/new-leads",
    icon: <TrendingUp size={18} />,
    subMenu: [
      { label: "New Leads", href: "/bizdev/new-leads" },
      { label: "Pipelines", href: "/bizdev/pipelines" },
      { label: "Partner List", href: "/bizdev/partner-list" },
      { label: "Contact List", href: "/bizdev/contact-list" },
      { label: "Projects", href: "/bizdev/projects" },
      { label: "Proposals", href: "/bizdev/proposals" },
      { label: "Approvals", href: "/bizdev/approvals" },
      { label: "Agreements", href: "/bizdev/agreements" },
    ],
  },
  {
    label: "Finance",
    href: "/finance/invoices",
    icon: <Wallet size={18} />,
    subMenu: [
      { label: "Invoices", href: "/finance/invoices" },
      { label: "Reports", href: "/finance/reports" },
    ],
  },
  {
    label: "Operation",
    href: "/operation/projects",
    icon: <Settings size={18} />,
    subMenu: [
      { label: "Projects", href: "/operation/projects" },
      { label: "Teams", href: "/operation/teams" },
    ],
  },
];

function UserSection() {
  const [open, setOpen] = useState(false);

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
          John Doe
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute bottom-14 left-0 w-full bg-white border rounded-xl shadow-lg p-3 text-sm z-50">
          {/* User Info */}
          <div className="pb-2 border-b">
            <p className="font-semibold text-slate-800">John Doe</p>
            <p className="text-xs text-slate-500">Admin</p>
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
            <Link href="/login" className="text-blue-500 font-medium">
              <button
              className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-red-600 hover:bg-red-50 transition"
            >
              <LogOut size={16} />
              Logout
            </button>    
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}


