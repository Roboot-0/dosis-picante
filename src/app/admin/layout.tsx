"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  Receipt,
  FlaskConical,
  Leaf,
  DollarSign,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingBag },
  { href: "/admin/inventario", label: "Inventario", icon: Package },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
  { href: "/admin/gastos", label: "Gastos", icon: Receipt },
  { href: "/admin/produccion", label: "Producción", icon: FlaskConical },
  { href: "/admin/ingredientes", label: "Ingredientes", icon: Leaf },
  { href: "/admin/finanzas", label: "Finanzas & P&L", icon: DollarSign },
];

function NavItem({
  item,
  active,
  onClick,
}: {
  item: (typeof NAV)[0];
  active: boolean;
  onClick?: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
        ${
          active
            ? "bg-[#DC2626] text-white"
            : "text-[#A8A29E] hover:bg-[#292524] hover:text-[#FAFAF9]"
        }`}
    >
      <Icon size={18} />
      {item.label}
    </Link>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  }

  // Login page: render sin sidebar
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  function isActive(item: (typeof NAV)[0]) {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  }

  const Sidebar = ({ onClose }: { onClose?: () => void }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-6 border-b border-[#292524]">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <img
              src="/images/logo-transparent.png"
              alt="DOSIS Picante"
              className="h-7 w-auto"
            />
            <p className="text-[#57534E] text-[10px] mt-0.5 ml-0.5">Admin</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-[#57534E] hover:text-[#FAFAF9] lg:hidden">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map((item) => (
          <NavItem
            key={item.href}
            item={item}
            active={isActive(item)}
            onClick={onClose}
          />
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-[#292524]">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                     text-[#A8A29E] hover:bg-[#292524] hover:text-[#FAFAF9] transition-all w-full"
        >
          <LogOut size={18} />
          Cerrar sesión
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#1C1917] flex">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex flex-col w-60 bg-[#1C1917] border-r border-[#292524] fixed h-full z-20">
        <Sidebar />
      </aside>

      {/* Sidebar mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-64 bg-[#1C1917] border-r border-[#292524] z-50">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        {/* Top bar mobile */}
        <header className="lg:hidden flex items-center justify-between px-4 py-4 border-b border-[#292524] bg-[#1C1917] sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-[#A8A29E] hover:text-[#FAFAF9]"
          >
            <Menu size={22} />
          </button>
          <p className="font-bebas text-[#FAFAF9] text-xl tracking-wider">DOSIS</p>
          <div className="w-6" />
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}