import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  Users,
  ListTodo,
  GitBranch,
  Receipt,
  TrendingUp,
  TrendingDown,
  Wallet,
  UserCog,
  FileBarChart2,
  Activity,
  Settings,
  LogOut,
  X,
  FileText,
  Shield,
} from "lucide-react";
import clsx from "clsx";
import { useAuth } from "../context/AuthContext";

const item = (key, to, Icon) => ({ key, to, Icon });

const baseItems = [
  item("dashboard", "/", LayoutDashboard),
  item("clients", "/clients", Users),
  item("tasks", "/tasks", ListTodo),
  item("workflows", "/workflows", GitBranch),
  item("payments", "/payments", Receipt),
  item("revenue", "/revenue", TrendingUp),
  item("expenses", "/expenses", TrendingDown),
  item("salaries", "/salaries", Wallet),
  item("employees", "/employees", UserCog),
  item("users", "/users", Shield),
  item("reports", "/reports", FileBarChart2),
  item("activity", "/activity", Activity),
];

const Sidebar = ({ open, onClose }) => {
  const { t } = useTranslation();
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const [isRtl, setIsRtl] = useState(
    () => document.documentElement.dir === "rtl",
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsRtl(document.documentElement.dir === "rtl");
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["dir"],
    });
    return () => observer.disconnect();
  }, []);

  const items = baseItems.filter(({ key }) => {
    // Admin-only sections — customer service / accountants are redirected to dashboard.
    if (key === "users") return hasRole("super_admin", "manager");
    if (key === "employees") return hasRole("super_admin", "manager");
    if (key === "salaries") return hasRole("super_admin", "manager");
    if (key === "workflows") return hasRole("super_admin", "manager");
    if (key === "clients") return hasRole("super_admin", "manager");
    // Financial screens — customer service has none of these. Accountants can
    // see revenue/expenses/payments but not reports or activity.
    if (key === "revenue")
      return hasRole("super_admin", "manager", "accountant");
    if (key === "expenses")
      return hasRole("super_admin", "manager", "accountant");
    if (key === "payments")
      return hasRole("super_admin", "manager", "accountant");
    if (key === "reports") return hasRole("super_admin", "manager");
    if (key === "activity") return hasRole("super_admin", "manager");
    return true;
  });

  return (
    <>
      <div
        className={clsx(
          "fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity duration-200",
          open ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={clsx(
          "fixed lg:sticky top-0 bottom-0 lg:bottom-auto inset-y-0 start-0 z-40",
          "w-[85vw] max-w-[18rem] sm:w-72 sm:max-w-none lg:w-64",
          "bg-app-sidebar border-e border-app-border",
          "flex flex-col transition-transform duration-200 ease-out",
          "h-screen lg:h-screen",
          open
            ? "translate-x-0 shadow-2xl"
            : isRtl
              ? "translate-x-full lg:translate-x-0"
              : "-translate-x-full lg:translate-x-0",
        )}
        aria-label="Main navigation"
      >
        <div className="h-16 flex items-center justify-between px-4 sm:px-5 border-b border-app-border shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-9 w-9 rounded-xl overflow-hidden shrink-0">
              <img
                src="/1.jpeg"
                alt="Logo"
                className="h-full w-full object-cover"
              />
              
            </div>
            <div className="min-w-0">
              <div className="font-display font-semibold text-sm leading-tight truncate text-app-heading">
                {t("app.name")}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-app-muted truncate">
                {t("app.tagline")}
              </div>
            </div>
          </div>
          <button
            className="lg:hidden p-1.5 -me-1.5 rounded-lg hover:bg-app-muted-surface shrink-0 touch-manipulation text-app-heading"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto overscroll-contain px-2.5 sm:px-3 py-3 sm:py-4 space-y-0.5">
          {items.map(({ key, to, Icon }) => (
            <NavLink
              key={key}
              to={to}
              end={to === "/"}
              onClick={onClose}
              className={({ isActive }) =>
                clsx("sidebar-link", isActive && "active")
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{t(`nav.${key}`)}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-app-border p-2.5 sm:p-3 space-y-2 shrink-0">
          {user && (
            <button
              type="button"
              className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-app-muted-surface cursor-pointer text-start"
              onClick={() => {
                navigate("/profile");
                onClose?.();
              }}
            >
              <div className="h-9 w-9 rounded-full bg-brand-100 text-brand-700 font-semibold flex items-center justify-center text-sm shrink-0">
                {user.name
                  ?.split(" ")
                  .map((p) => p[0])
                  .slice(0, 2)
                  .join("")}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium truncate text-app-heading">
                  {user.name}
                </div>
                <div className="text-xs text-app-muted truncate">
                  {t(`employees.roles.${user.role}`)}
                </div>
              </div>
            </button>
          )}
          <button
            className="w-full btn-ghost justify-start"
            onClick={async () => {
              await logout();
              navigate("/login");
            }}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span>{t("common.logout")}</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
