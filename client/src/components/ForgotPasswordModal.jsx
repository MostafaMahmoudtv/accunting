import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { X, Mail, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import api from "../services/api";

const schema = (t) =>
  z.object({
    email: z.string().email(t("errors.invalidEmail")),
  });

const ForgotPasswordModal = ({ open, onClose }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl" || document.documentElement.dir === "rtl";
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema(t)),
    defaultValues: { email: "" },
  });

  useEffect(() => {
    if (!open) {
      // Reset state when the modal closes.
      const t = setTimeout(() => {
        setSent(false);
        setServerError("");
        reset();
      }, 200);
      return () => clearTimeout(t);
    }
  }, [open, reset]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const onSubmit = async (values) => {
    setServerError("");
    try {
      await api.post("/auth/forgot-password", {
        email: values.email,
        locale: i18n.language,
      });
      setSent(true);
    } catch (err) {
      setServerError(
        err.response?.data?.message || t("common.somethingWentWrong") || "Something went wrong",
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="forgot-title"
    >
      <div
        className="relative w-full max-w-md card p-6 sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className={`absolute top-3 ${isRtl ? "left-3" : "right-3"} p-1.5 rounded-lg text-app-muted hover:bg-app-muted-surface hover:text-app-heading`}
        >
          <X className="h-4 w-4" />
        </button>

        {sent ? (
          <div className="text-center py-2">
            <div className="mx-auto h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 id="forgot-title" className="text-lg font-semibold text-app-heading mb-1">
              {t("auth.checkYourInbox")}
            </h3>
            <p className="text-sm text-app-muted mb-5">
              {t("auth.forgotSuccess")}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="btn-primary w-full justify-center"
            >
              {t("common.close") || t("common.cancel") || "Close"}
            </button>
          </div>
        ) : (
          <>
            <h3 id="forgot-title" className="text-lg font-semibold text-app-heading mb-1">
              {t("auth.forgotTitle")}
            </h3>
            <p className="text-sm text-app-muted mb-5">
              {t("auth.forgotSubtitle")}
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div>
                <label htmlFor="forgot-email" className="label">
                  {t("auth.email")}
                </label>
                <div
                  className={`relative flex items-center rounded-xl border bg-app-card transition-all ${
                    errors.email
                      ? "border-rose-400 ring-2 ring-rose-500/20"
                      : "border-app-border hover:border-ink-300 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20"
                  }`}
                >
                  <Mail
                    className={`absolute top-1/2 -translate-y-1/2 ${
                      isRtl ? "right-3.5" : "left-3.5"
                    } h-4 w-4 ${errors.email ? "text-rose-500" : "text-app-muted"}`}
                  />
                  <input
                    id="forgot-email"
                    type="email"
                    autoComplete="email"
                    placeholder={t("auth.emailPlaceholder") || "name@company.com"}
                    {...register("email")}
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
                {serverError && (
                  <p className="text-xs text-rose-500 mt-1.5 flex items-center gap-1">
                    <span className="inline-block h-1 w-1 rounded-full bg-rose-500" />
                    {serverError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="btn-primary w-full justify-center group"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <span className="flex items-center gap-2">
                    {t("auth.forgotSubmit")}
                    <ArrowRight
                      className={`h-4 w-4 transition-transform group-hover:translate-x-1 ${
                        isRtl ? "rotate-180 group-hover:-translate-x-1" : ""
                      }`}
                    />
                  </span>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
