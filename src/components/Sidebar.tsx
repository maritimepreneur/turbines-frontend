"use client";

import Image from "next/image"
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutGrid,
  TrendingUp,
  ChevronDown,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  // buka otomatis kalau di route bizdev
  const [openBizdev, setOpenBizdev] = useState(false);

  useEffect(() => {
    if (pathname.startsWith("/bizdev")) {
      setOpenBizdev(true);
    }
  }, [pathname]);

  return (
    <aside className="w-64 bg-white border-r border-slate-200 px-6 py-5">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-10">
        <div className=" rounded bg-sky-500/10 flex items-center justify-center">
          <Image
                    src="/logo_marmud.png"       // ganti dengan path logo kamu
                    alt="Logo Maritim Muda"
                    width={70}           // sesuaikan ukuran
                    height={40}           // sesuaikan ukuran
                  />
        </div>
        <div>
          <h1 className="text-2xl italic font-bold font- text-slate-900">Turbines</h1>
          
        </div>
      </div>

      {/* Menu */}
      <nav className="space-y-1 text-sm text-slate-600">
        <MenuLink
          href="/dashboard"
          icon={<LayoutGrid size={18} />}
          label="Dashboard"
          active={pathname === "/dashboard"}
        />

        {/* ===== BISDEV TOGGLE ===== */}
        <div>
          <button
            onClick={() => setOpenBizdev(!openBizdev)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-100 transition"
          >
            <div className="flex items-center gap-3 font-medium">
              <TrendingUp size={18} />
              Bisdev
            </div>

            <ChevronDown
              size={16}
              className={`transition-transform duration-200 ${
                openBizdev ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Sub Menu */}
          <div
            className={`ml-8 mt-1 space-y-1 overflow-hidden transition-all duration-300
              ${openBizdev ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}
            `}
          >
            <MenuLink
              href="/bizdev/new-leads"
              label="New Leads"
              active={pathname === "/bizdev/new-leads"}
              sub
            />
            <MenuLink
              href="/bizdev/pipelines"
              label="Pipelines"
              active={pathname === "/bizdev/pipelines"}
              sub
            />
            <MenuLink
              href="/bizdev/partner-list"
              label="Partner List"
              active={pathname === "/bizdev/partner-list"}
              sub
            />
          </div>
        </div>
      </nav>
    </aside>
  );
}

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
        ${
          active
            ? "bg-sky-100 text-sky-600 font-semibold"
            : "hover:bg-slate-100"
        }
      `}
    >
      {icon}
      {label}
    </Link>
  );
}
