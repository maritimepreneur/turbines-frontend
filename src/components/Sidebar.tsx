"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
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
  Calendar,
  Clock,
  ChevronDown,
  ChevronRight,
  Calendar1,
  CalendarCheck,
  TextQuote,
  ShoppingCart,
  NotebookTabs,
  Menu,
  X,
  Store,
  GraduationCap,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const searchParams = useSearchParams();
  const moduleFromQuery = searchParams.get("module");

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobileOpen) {
      const scrollY = window.scrollY;
      document.body.classList.add("body-no-scroll");
      document.body.style.top = `-${scrollY}px`;
    } else {
      const scrollY = document.body.style.top;
      document.body.classList.remove("body-no-scroll");
      document.body.style.top = "";
      window.scrollTo(0, parseInt(scrollY || "0") * -1);
    }
    return () => {
      document.body.classList.remove("body-no-scroll");
      document.body.style.top = "";
    };
  }, [isMobileOpen]);

  const currentActiveModule = useMemo(() => {
    if (moduleFromQuery) return moduleFromQuery;
    if (pathname.startsWith("/bizdev")) return "bizdev";
    if (pathname.startsWith("/finance")) return "finance";
    if (pathname.startsWith("/operation")) return "operation";
    if (pathname.startsWith("/employee") || pathname === "/user-profile")
      return "employee";
    if (pathname.startsWith("/human-resources")) return "human-resources";
    return null;
  }, [pathname, moduleFromQuery]);

  const visibleMenuItems = useMemo(() => {
    if (currentActiveModule) {
      return MENU_ITEMS.filter(
        (item) =>
          item.module === "common" || item.module === currentActiveModule,
      );
    }
    if (pathname.startsWith("/training-course")) {
      return MENU_ITEMS.filter(
        (item) => item.module === "common" || item.module === "training-course",
      );
    }
    return MENU_ITEMS;
  }, [currentActiveModule]);

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-2 rounded-lg hover:bg-slate-100 transition text-slate-600"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image
            src="/logo_horizontal.jpeg"
            alt="Logo"
            width={32}
            height={20}
          />
          <h1 className="text-lg italic font-bold text-slate-900">Turbines</h1>
        </Link>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          sidebar-fixed fixed left-0 top-0 h-screen z-50 w-64 bg-white border-r border-slate-200 px-6 py-5 flex flex-col overflow-hidden
          transition-transform duration-300 ease-in-out
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between gap-3 mb-2 shrink-0">
          <Link href="/dashboard" className="flex items-center gap-3">
            <Image
              src="/logo_horizontal.jpeg"
              alt="Logo"
              width={180}
              height={200}
            />
            {/* <h1 className="text-2xl italic font-bold text-slate-900">Turbines</h1> */}
          </Link>
          {/* Close button (mobile only) */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 transition text-slate-500"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Menu */}
        <nav className="space-y-1 text-sm text-slate-600 flex-1 overflow-y-auto min-h-0">
          {visibleMenuItems.map((item) => (
            <MenuLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              active={
                pathname === item.href || pathname.startsWith(item.href + "/")
              }
              subMenu={item.subMenu}
              pathname={pathname}
            />
          ))}
        </nav>

        <UserSection />
      </aside>
    </>
  );
}

function MenuLink({
  href,
  label,
  icon,
  active,
  subMenu,
  pathname,
}: {
  href: string;
  label: string;
  icon?: React.ReactNode;
  active: boolean;
  subMenu?: { label: string; href: string }[];
  pathname: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  // Check if any submenu item is active
  const hasActiveSubMenu = subMenu
    ? subMenu.some((sub) => pathname === sub.href)
    : false;

  // Check if current path matches invoice pages
  const isInvoicePage =
    label === "Invoices" &&
    (pathname === "/finance/invoice" ||
      pathname === "/finance/pre-invoice" ||
      pathname === "/finance/canceled");

  const isParentActive = active || hasActiveSubMenu || isInvoicePage;

  // Auto-open submenu if any submenu item is active
  useEffect(() => {
    if (hasActiveSubMenu) {
      setIsOpen(true);
    }
  }, [hasActiveSubMenu]);

  // If has submenu, render as expandable
  if (subMenu && subMenu.length > 0) {
    return (
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg transition
            ${isParentActive ? "bg-sky-100 text-sky-600 font-semibold" : "hover:bg-slate-100"}
          `}
        >
          <div className="flex items-center gap-3">
            {icon}
            {label}
          </div>
          {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>

        {/* Submenu */}
        {isOpen && (
          <div className="ml-6 mt-1 space-y-1">
            {subMenu.map((sub) => (
              <Link
                key={sub.href}
                href={sub.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition text-sm
                  ${
                    pathname === sub.href
                      ? "bg-sky-50 text-sky-600 font-medium"
                      : "text-slate-600 hover:bg-slate-50"
                  }
                `}
              >
                {sub.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Regular menu item without submenu
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition
        ${isParentActive ? "bg-sky-100 text-sky-600 font-semibold" : "hover:bg-slate-100"}
      `}
    >
      {icon}
      {label}
    </Link>
  );
}

const MENU_ITEMS = [
  // BIZDEV
  {
    label: "New Leads",
    href: "/bizdev/new-leads",
    icon: <TrendingUp size={18} />,
    module: "bizdev",
  },
  {
    label: "Pipelines",
    href: "/bizdev/pipelines",
    icon: <FolderKanban size={18} />,
    module: "bizdev",
  },
  {
    label: "Affiliation List",
    href: "/bizdev/partner-list",
    icon: <Handshake size={18} />,
    module: "bizdev",
  },

  {
    label: "Contact List",
    href: "/bizdev/contact-list",
    icon: <Users size={18} />,
    module: "bizdev",
  },
  {
    label: "Projects",
    href: "/bizdev/projects",
    icon: <Briefcase size={18} />,
    module: "bizdev",
  },
  {
    label: "Proposals",
    href: "/bizdev/proposals",
    icon: <FileText size={18} />,
    module: "bizdev",
  },
  {
    label: "Approvals",
    href: "/bizdev/approvals",
    icon: <CheckCircle size={18} />,
    module: "bizdev",
  },
  {
    label: "Agreements",
    href: "/bizdev/agreements",
    icon: <FileText size={18} />,
    module: "bizdev",
  },
  {
    label: "Documents",
    href: "/bizdev/documents",
    icon: <FileText size={18} />,
    module: "bizdev",
  },

  // FINANCE
  {
    label: "Quotation",
    href: "/finance/quotation",
    icon: <TextQuote size={18} />,
    module: "finance",
  },
  {
    label: "Purchase",
    href: "/finance/purchase",
    icon: <ShoppingCart size={18} />,
    module: "finance",
  },
  {
    label: "Invoice",
    href: "/finance/invoice",
    icon: <NotebookTabs size={18} />,
    module: "finance",
  },
  {
    label: "Reports",
    href: "/finance/reports",
    icon: <BarChart3 size={18} />,
    module: "finance",
  },
  {
    label: "Documents",
    href: "/finance/documents",
    icon: <FileText size={18} />,
    module: "finance",
  },

  // OPERATION
  {
    label: "Projects",
    href: "/operation/projects",
    icon: <Settings size={18} />,
    module: "operation",
  },
  {
    label: "Teams",
    href: "/operation/teams",
    icon: <UsersRound size={18} />,
    module: "operation",
  },
  {
    label: "Documents",
    href: "/operation/documents",
    icon: <FileText size={18} />,
    module: "operation",
  },

  // Employee Management
  {
    label: "Profile",
    href: "/employee/profile",
    icon: <UserCircle size={18} />,
    module: "employee",
  },
  {
    label: "Calendar",
    href: "/employee/calendar",
    icon: <Calendar size={18} />,
    module: "employee",
  },
  {
    label: "Attendance",
    href: "/employee/attendance/clock-in",
    icon: <Clock size={18} />,
    subMenu: [
      { label: "Clock In", href: "/employee/attendance/clock-in" },
      { label: "Clock Out", href: "/employee/attendance/clock-out" },
    ],
    module: "employee",
  },

  // Human Resources
  {
    label: "Attendance",
    href: "/human-resources/attendance",
    icon: <CalendarCheck size={18} />,
    module: "human-resources",
  },
  {
    label: "Employee List",
    href: "/human-resources/employee-list",
    icon: <UserCircle size={18} />,
    module: "human-resources",
  },

  // Training Course
  {
    label: "Form Data",
    href: "/training-course/form-data",
    icon: <FileText size={18} />,
    module: "training-course",
  },
  {
    label: "Data",
    href: "/training-course/form-data",
    icon: <CalendarCheck size={18} />,
    module: "training course",
  },
  {
    label: "Interview",
    href: "/training-course/interview",
    icon: <Users size={18} />,
    module: "training-course",
  },
  {
    label: "Registration",
    href: "/training-course/registration",
    icon: <FileText size={18} />,
    subMenu: [
      {
        label: "All",
        href: "training-course/form-data/all",
      },
      { label: "Foundation", href: "training-course/form-data/foundation" },
      {
        label: "Specialization",
        href: "training-course/form-data/specialization",
      },
      {
        label: "Foundation and Specialization",
        href: "training-course/form-data/foundation-specialization",
      },
      { label: "Executive", href: "training-course/form-data/executive" },
    ],
    module: "training-course",
  },
  {
    label: "Scholarships",
    href: "/training-course/scholarships",
    icon: <FileText size={18} />,
    module: "training-course",
  },
  {
    label: "Gform",
    href: "/training-course/gform",
    icon: <FileText size={18} />,
    module: "training-course",
  },

  {
    label: "Scholarships Type",
    href: "/training-course/scholarships-type",
    icon: <UsersRound size={18} />,
    module: "training-course",
  },
];

function UserSection() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const profileHref = useMemo(() => {
    const currentModule = pathname.startsWith("/bizdev")
      ? "bizdev"
      : pathname.startsWith("/finance")
        ? "finance"
        : pathname.startsWith("/operation")
          ? "operation"
          : pathname.startsWith("/employee")
            ? "employee"
            : pathname.startsWith("/human-resources")
              ? "human-resources"
              : "";
    return currentModule
      ? `/user-profile?module=${currentModule}`
      : "/user-profile";
  }, [pathname]);

  return (
    <div className="relative border-t pt-4 mt-4 shrink-0">
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 transition"
      >
        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border-2 border-slate-200">
          <Image
            src="/avatar-placeholder.png"
            alt="User Avatar"
            width={40}
            height={40}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="text-left flex-1">
          <p className="text-sm font-semibold text-gray-800">
            {user?.username}
          </p>
          <p className="text-xs text-gray-500">{user?.role}</p>
        </div>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute bottom-14 left-0 w-full bg-white border rounded-xl shadow-lg p-3 text-sm z-50">
          {/* User Info */}
          <div className="pb-2 border-b">
            <p className="text-sm font-semibold text-gray-800">
              {user?.username}
            </p>
            <p className="text-xs text-gray-500">{user?.role}</p>
          </div>

          {/* Actions */}
          <div className="mt-2 space-y-1">
            <Link
              href={profileHref}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-slate-100 transition"
            >
              <UserCircle size={16} className="text-black" />
              <span className="text-black">User Profile</span>
            </Link>
            <button
              onClick={logout}
              className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-red-600 hover:bg-red-50 transition"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}