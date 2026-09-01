import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";

const schema = (t) =>
  z.object({
    email: z.string().email(t("errors.invalidEmail")),
    password: z.string().min(6, t("errors.minLength", { count: 6 })),
  });

const DEMO_ACCOUNTS = [
  { email: "admin@demo.io", role: "super_admin" },
  { email: "manager@demo.io", role: "manager" },
  { email: "accountant1@demo.io", role: "accountant" },
];

const Login = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema(t)),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values) => {
    try {
      await login(values.email, values.password);
      toast.success(t("auth.welcomeBack"));
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || t("auth.invalidCredentials"));
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-ink-50 dark:bg-ink-900">
      <div className="hidden lg:flex relative bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 text-white p-12 flex-col">
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center font-bold">
            L
          </div>
          <div>
            <div className="font-display font-semibold">{t("app.name")}</div>
            <div className="text-xs opacity-80">{t("app.tagline")}</div>
          </div>
        </div>
        <div className="flex-1 flex flex-col justify-center max-w-md">
          <h1 className="text-4xl font-bold leading-tight mb-3 font-display">
            {t("auth.welcomeBack")}
          </h1>
          <p className="text-white/80 text-sm leading-relaxed">
            {t("auth.welcomeMessage")}
          </p>
          <div className="mt-10 grid grid-cols-3 gap-3 text-xs">
            {["Clients", "Tasks", "Workflows", "Payments", "Reports"].map(
              (label, idx) => (
                <div
                  key={label}
                  className="rounded-xl bg-white/10 backdrop-blur border border-white/10 px-3 py-2.5"
                >
                  <div className="text-white/60">{`0${idx + 1}`}</div>
                  <div className="font-medium">{label}</div>
                </div>
              ),
            )}
          </div>
        </div>
        <div className="text-xs text-white/60">
          © {new Date().getFullYear()} {t("app.name")}
        </div>
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, white 0%, transparent 30%)",
          }}
        />
      </div>

      <div className="flex items-center justify-center p-4 sm:p-6 lg:p-10 min-h-screen lg:min-h-0">
        <div className="w-full max-w-sm">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <Link to="/" className="lg:hidden flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold">
                L
              </div>
              <span className="font-display font-semibold">
                {t("app.name")}
              </span>
            </Link>
            <div className="flex items-center gap-1 ms-auto"></div>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold mb-1">{t("auth.login")}</h2>
          <p className="text-xs sm:text-sm text-ink-500 mb-5 sm:mb-6">
            {t("auth.welcomeMessage")}
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">{t("auth.email")}</label>
              <input
                className="input"
                type="email"
                autoComplete="email"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-rose-500 mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div>
              <label className="label">{t("auth.password")}</label>
              <input
                className="input"
                type="password"
                autoComplete="current-password"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-xs text-rose-500 mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>
            <button
              className="btn-primary w-full justify-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              {t("auth.login")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
