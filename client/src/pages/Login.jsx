import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import ForgotPasswordModal from "../components/ForgotPasswordModal";
import {
  Loader2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

const schema = (t) =>
  z.object({
    email: z.string().email(t("errors.invalidEmail")),
    password: z.string().min(6, t("errors.minLength", { count: 6 })),
  });

const Login = () => {
  const { t, i18n } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const isRtl = i18n.dir() === "rtl" || document.documentElement.dir === "rtl";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema(t)),
    defaultValues: { email: "", password: "" },
  });

  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);

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
    <div className="min-h-screen grid lg:grid-cols-2 bg-app">
      {/* Brand panel — visible on lg+ */}
      <div className="hidden lg:flex relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 text-white p-12 flex-col">
        {/* Decorative shapes */}
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
            {t("auth.welcomeBack")}
          </h1>
          <p className="text-white/80 text-sm leading-relaxed">
            {t("auth.welcomeMessage")}
          </p>
        </div>

        <div className="relative text-xs text-white/60 flex items-center justify-between">
          <span>© {new Date().getFullYear()} {t("app.name")}</span>
          <span className="text-white/50">{t("app.tagline")}</span>
        </div>
      </div>

      {/* Form panel */}
      <div className="relative flex items-center justify-center p-4 sm:p-6 lg:p-10 min-h-screen lg:min-h-0">
        {/* Subtle background decoration */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04] hidden lg:block"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute top-4 end-4 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg overflow-hidden">
              <img src="/1.jpeg" alt="Logo" className="h-full w-full object-cover" />
            </div>
          </div>
        </div>

        <div className="relative w-full max-w-[26rem]">
          {/* Mobile logo */}
          <Link to="/" className="lg:hidden flex items-center gap-2 mb-6">
            <div className="h-9 w-9 rounded-xl overflow-hidden">
              <img src="/1.jpeg" alt="Logo" className="h-full w-full object-cover" />
            </div>
            <span className="font-display font-semibold">{t("app.name")}</span>
          </Link>

          <div className="mb-7">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-app-heading">
              {t("auth.login")}
            </h2>
            <p className="text-sm text-app-muted mt-1.5">
              {t("auth.welcomeMessage")}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {/* Email field */}
            <div>
              <label htmlFor="email" className="label">
                {t("auth.email")}
              </label>
              <div
                className={`relative flex items-center rounded-xl border bg-app-card transition-all ${
                  errors.email
                    ? "border-rose-400 ring-2 ring-rose-500/20"
                    : emailFocused
                      ? "border-brand-500 ring-2 ring-brand-500/20"
                      : "border-app-border hover:border-ink-300"
                }`}
              >
                <Mail
                  className={`absolute top-1/2 -translate-y-1/2 ${
                    isRtl ? "right-3.5" : "left-3.5"
                  } h-4 w-4 transition-colors ${
                    errors.email
                      ? "text-rose-500"
                      : emailFocused
                        ? "text-brand-500"
                        : "text-app-muted"
                  }`}
                />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder={t("auth.emailPlaceholder") || "name@company.com"}
                  {...register("email", {
                    onFocus: () => setEmailFocused(true),
                    onBlur: () => setEmailFocused(false),
                  })}
                  className={`w-full bg-transparent ${
                    isRtl ? "pr-10 pl-3" : "pl-10 pr-3"
                  } py-2.5 text-sm outline-none placeholder:text-app-muted/60 text-app-heading`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-rose-500 mt-1.5 flex items-center gap-1">
                  <span className="inline-block h-1 w-1 rounded-full bg-rose-500" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="label !mb-0">
                  {t("auth.password")}
                </label>
                <button
                  type="button"
                  onClick={() => setForgotOpen(true)}
                  className="text-xs font-medium text-brand-600 hover:text-brand-700 transition"
                >
                  {t("auth.forgotPassword") || "Forgot?"}
                </button>
              </div>
              <div
                className={`relative flex items-center rounded-xl border bg-app-card transition-all ${
                  errors.password
                    ? "border-rose-400 ring-2 ring-rose-500/20"
                    : passwordFocused
                      ? "border-brand-500 ring-2 ring-brand-500/20"
                      : "border-app-border hover:border-ink-300"
                }`}
              >
                <Lock
                  className={`absolute top-1/2 -translate-y-1/2 ${
                    isRtl ? "right-3.5" : "left-3.5"
                  } h-4 w-4 transition-colors ${
                    errors.password
                      ? "text-rose-500"
                      : passwordFocused
                        ? "text-brand-500"
                        : "text-app-muted"
                  }`}
                />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  {...register("password", {
                    onFocus: () => setPasswordFocused(true),
                    onBlur: () => setPasswordFocused(false),
                  })}
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
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-rose-500 mt-1.5 flex items-center gap-1">
                  <span className="inline-block h-1 w-1 rounded-full bg-rose-500" />
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="btn-primary w-full justify-center mt-2 group relative overflow-hidden"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <span className="flex items-center gap-2">
                  {t("auth.login")}
                  <ArrowRight
                    className={`h-4 w-4 transition-transform group-hover:translate-x-1 ${
                      isRtl ? "rotate-180 group-hover:-translate-x-1" : ""
                    }`}
                  />
                </span>
              )}
            </button>
          </form>
        </div>
      </div>
      <ForgotPasswordModal open={forgotOpen} onClose={() => setForgotOpen(false)} />
    </div>
  );
};

export default Login;
