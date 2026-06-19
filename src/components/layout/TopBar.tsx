import { useState } from "react";
import { useLocation } from "react-router-dom";
import {
  ChevronRight,
  RotateCcw,
  Bell,
  Search,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

const breadcrumbMap: Record<string, string> = {
  dashboard: "门店看板",
  cases: "病例抽查",
  quality: "质控反馈",
};

const dateOptions = [
  { label: "今日", value: "today" },
  { label: "本周", value: "week" },
  { label: "本月", value: "month" },
  { label: "本季度", value: "quarter" },
  { label: "本年", value: "year" },
];

export default function TopBar() {
  const location = useLocation();
  const [dateOpen, setDateOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("本月");

  const pathSegments = location.pathname
    .split("/")
    .filter((seg) => seg.length > 0);

  const breadcrumbs = pathSegments.map((seg) => ({
    key: seg,
    label: breadcrumbMap[seg] || seg,
  }));

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
      <nav className="flex items-center text-sm">
        <span className="text-slate-500">首页</span>
        {breadcrumbs.map((crumb, index) => (
          <div key={crumb.key} className="flex items-center">
            <ChevronRight className="w-4 h-4 mx-2 text-slate-400" />
            <span
              className={cn(
                index === breadcrumbs.length - 1
                  ? "text-primary-900 font-medium"
                  : "text-slate-500"
              )}
            >
              {crumb.label}
            </span>
          </div>
        ))}
      </nav>

      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            onClick={() => setDateOpen(!dateOpen)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Calendar className="w-4 h-4 text-slate-500" />
            <span>{selectedDate}</span>
            <ChevronRight
              className={cn(
                "w-4 h-4 text-slate-400 transition-transform",
                dateOpen && "rotate-90"
              )}
            />
          </button>
          {dateOpen && (
            <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-slate-200 rounded-lg shadow-lg z-50 py-1">
              {dateOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setSelectedDate(option.label);
                    setDateOpen(false);
                  }}
                  className={cn(
                    "w-full text-left px-4 py-2 text-sm hover:bg-slate-50",
                    selectedDate === option.label
                      ? "text-primary-700 bg-primary-50"
                      : "text-slate-700"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <button className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 transition-colors">
          <RotateCcw className="w-5 h-5" />
        </button>

        <button className="relative w-9 h-9 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-danger-500 rounded-full" />
        </button>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="搜索..."
            className="w-56 pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
          />
        </div>
      </div>
    </header>
  );
}
