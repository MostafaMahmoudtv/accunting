import { useState, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import {
  Loader2,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import api from "../services/api";

const schema = (t) =>
  z
    .object({
      password: z.string().min(6, t("errors.minLength", { count: 6 })),
      confirmPassword: z.string(),
    })
    .refine((d) => d.password === d.confirmPassword, {
      path: ["confirmPassword"],
      message: t("errors.passwordsDoNotMatch") || "Passwords do not match",
    });

const ResetPassword = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const isRtl = i18n.dir() === "rtl" || document.documentElement.dir === "rtl";

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState("");

  const tokenMissing = useMemo(() => !token, [token]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema(t)),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = async (values) => {
    if (tokenMissing) return;
    setServerError("");
    try {
      await api.post("/auth/reset-password", {
        token,
        password: values.password,
      });
      setDone(true);
      toast.success(t("auth.resetSuccess"));
    } catch (err) {
      const msg = err.response?.data?.message || t("auth.resetInvalidToken");
      setServerError(msg);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-app">
      {/* Brand panel */}
      <div className="hidden lg:flex relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 text-white p-12 flex-col">
        <div className="absolute -top-24 -end-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 -start-24 h-96 w-96 rounded-full bg-brand-400/30 blur-3xl" />
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.08]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-xl overflow-hidden shrink-0 ring-2 ring-white/20">
            <img src="/1.jpeg" alt="Logo" className="h-full w-full object-cover" />
          </div>
          <div>
            <div className="font-display font-semibold tracking-tight">{t("app.name")}</div>
            <div className="text-xs text-white/70">{t("app.tagline")}</div>
          </div>
        </div>

        <div className="relative flex-1 flex flex-col justify-center max-w-md py-12">
          <div className="inline-flex items-center gap-2 self-start rounded-full bg-white/10 backdrop-blur border border-white/15 px-3 py-1 text-xs font-medium mb-5">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>{t("auth.secureLogin") || "Secure sign-in"}</span>
          </div>
          <h1 className="text-4xl xl:text-5xl font-bold leading-[1.1] mb-4 font-display">
            {t("auth.resetTitle")}
          </h1>
          <p className="text-white/80 text-sm leading-relaxed">
            {t("auth.resetSubtitle")}
          </p>
        </div>

        <div className="relative text-xs text-white/60 flex items-center justify-between">
          <span>© {new Date().getFullYear()} {t("app.name")}</span>
          <span className="text-white/50">{t("app.tagline")}</span>
        </div>
      </div>

      {/* Form panel */}
      <div className="relative flex items-center justify-center p-4 sm:p-6 lg:p-10 min-h-screen lg:min-h-0">
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04] hidden lg:block"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative w-full max-w-[26rem]">
          <div className="mb-7">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-app-heading">
              {t("auth.resetTitle")}
            </h2>
            <p className="text-sm text-app-muted mt-1.5">
              {t("auth.resetSubtitle")}
            </p>
          </div>

          {tokenMissing ? (
            <div className="card p-5 border-rose-200 bg-rose-50/60">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-rose-700">
                    {t("auth.resetMissingToken")}
                  </div>
                  <p className="text-xs text-rose-600/80 mt-1">
                    {t("auth.forgotSubtitle")}
                  </p>
                </div>
              </div>
              <Link
                to="/login"
                className="mt-4 btn-primary w-full justify-center"
              >
                {t("auth.login")}
              </Link>
            </div>
          ) : done ? (
            <div className="card p-5 border-emerald-200 bg-emerald-50/60">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-emerald-700">
                    {t("auth.resetSuccess")}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate("/login", { replace: true })}
                className="mt-4 btn-primary w-full justify-center"
              >
                {t("auth.login")}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div>
                <label htmlFor="password" className="label">
                  {t("users.newPassword") || t("auth.password")}
                </label>
                <div
                  className={`relative flex items-center rounded-xl border bg-app-card transition-all ${
                    errors.password
                      ? "border-rose-400 ring-2 ring-rose-500/20"
                      : "border-app-border hover:border-ink-300 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20"
                  }`}
                >
                  <Lock
                    className={`absolute top-1/2 -translate-y-1/2 ${
                      isRtl ? "right-3.5" : "left-3.5"
                    } h-4 w-4 ${errors.password ? "text-rose-500" : "text-app-muted"}`}
                  />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    {...register("password")}
                    className={`w-full bg-transparent ${
                      isRtl ? "pr-10 pl-10" : "pl-10 pr-10"
                    } py-2.5 text-sm outline-none placeholder:text-app-muted/60 text-app-heading`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className={`absolute top-1/2 -translate-y-1/2 ${
                      isRtl ? "left-2" : "right-2"
                    } p-1.5 rounded-md text-app-muted hover:text-app-heading hover:bg-app-muted transition`}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-rose-500 mt-1.5 flex items-center gap-1">
                    <span className="inline-block h-1 w-1 rounded-full bg-rose-500" />
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="label">
                  {t("users.confirmPassword") || t("auth.password")}
                </label>
                <div
                  className={`relative flex items-center rounded-xl border bg-app-card transition-all ${
                    errors.confirmPassword
                      ? "border-rose-400 ring-2 ring-rose-500/20"
                      : "border-app-border hover:border-ink-300 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20"
                  }`}
                >
                  <Lock
                    className={`absolute top-1/2 -translate-y-1/2 ${
                      isRtl ? "right-3.5" : "left-3.5"
                    } h-4 w-4 ${errors.confirmPassword ? "text-rose-500" : "text-app-muted"}`}
                  />
                  <input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    {...register("confirmPassword")}
                    className={`w-full bg-transparent ${
                      isRtl ? "pr-10 pl-10" : "pl-10 pr-10"
                    } py-2.5 text-sm outline-none placeholder:text-app-muted/60 text-app-heading`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((s) => !s)}
                    tabIndex={-1}
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                    className={`absolute top-1/2 -translate-y-1/2 ${
                      isRtl ? "left-2" : "right-2"
                    } p-1.5 rounded-md text-app-muted hover:text-app-heading hover:bg-app-muted transition`}
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-rose-500 mt-1.5 flex items-center gap-1">
                    <span className="inline-block h-1 w-1 rounded-full bg-rose-500" />
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {serverError && (
                <p className="text-xs text-rose-500 flex items-center gap-1">
                  <span className="inline-block h-1 w-1 rounded-full bg-rose-500" />
                  {serverError}
                </p>
              )}

              <button
                type="submit"
                className="btn-primary w-full justify-center group"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <span className="flex items-center gap-2">
                    {t("auth.resetSubmit")}
                    <ArrowRight
                      className={`h-4 w-4 transition-transform group-hover:translate-x-1 ${
                        isRtl ? "rotate-180 group-hover:-translate-x-1" : ""
                      }`}
                    />
                  </span>
                )}
              </button>

              <div className="text-center pt-1">
                <Link to="/login" className="text-xs text-brand-600 hover:text-brand-700">
                  {t("auth.login")}
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
