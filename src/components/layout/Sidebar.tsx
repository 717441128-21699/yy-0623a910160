import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FileSearch,
  ShieldAlert,
  Smile,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    to: "/dashboard",
    label: "门店看板",
    icon: LayoutDashboard,
  },
  {
    to: "/cases",
    label: "病例抽查",
    icon: FileSearch,
  },
  {
    to: "/quality",
    label: "质控反馈",
    icon: ShieldAlert,
  },
];

export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-primary-900 flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-secondary-500 flex items-center justify-center">
            <Smile className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-semibold text-lg">正畸质控平台</span>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 relative",
                    isActive
                      ? "bg-primary-700 text-white"
                      : "text-slate-300 hover:bg-primary-800/50 hover:text-white"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-secondary-500 rounded-r" />
                    )}
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary-400 to-secondary-600 flex items-center justify-center text-white font-semibold">
            张
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">张主任</p>
            <p className="text-slate-400 text-xs truncate">正畸质控负责人</p>
            <p className="text-slate-500 text-xs truncate mt-0.5">
              美奥口腔·总院
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
