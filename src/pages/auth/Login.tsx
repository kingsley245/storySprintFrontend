import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import {
  Eye,
  EyeOff,
  Play,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  BookOpen,
} from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      const { token, user } = response.data;

      if (!token) {
        throw new Error("Authentication token was not returned.");
      }

      const userRole = user?.role
        ? user.role.toLowerCase()
        : "student";

      
      const storage = rememberMe ? localStorage : sessionStorage;

      storage.setItem("token", token);

      if (user) {
        storage.setItem("role", userRole);
        storage.setItem("user", JSON.stringify(user));
      }

      console.log("Backend Login Response:", response.data);

      if (userRole === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/student/dashboard", { replace: true });
      }
    } catch (err: any) {
      console.error("Login error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to sign in. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="min-h-screen flex">

        {/* =====================================================
            LEFT BRAND PANEL — DESKTOP
        ====================================================== */}
        <section className="hidden lg:flex lg:w-[52%] xl:w-[55%] relative overflow-hidden bg-slate-950 text-white">

          {/* Decorative gradients */}
          <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-violet-600/30 blur-3xl" />
          <div className="absolute -bottom-40 -right-20 h-[500px] w-[500px] rounded-full bg-indigo-600/20 blur-3xl" />

          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
              backgroundSize: "42px 42px",
            }}
          />

          <div className="relative z-10 flex w-full flex-col justify-between p-10 xl:p-14">

            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-600 shadow-lg shadow-violet-600/30">
                <Play
                  className="h-5 w-5 fill-current text-white"
                  strokeWidth={2.5}
                />
              </div>

              <div>
                <div className="text-lg font-extrabold tracking-tight">
                  AI STORYSPRINT
                </div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-400">
                  Editing
                </div>
              </div>
            </div>

            {/* Main message */}
            <div className="max-w-xl">

              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-medium text-slate-300 backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5 text-violet-400" />
                Learn. Create. Grow.
              </div>

              <h1 className="text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
                Turn your ideas into
                <span className="block bg-gradient-to-r from-violet-400 to-indigo-300 bg-clip-text text-transparent">
                  powerful stories.
                </span>
              </h1>

              <p className="mt-6 max-w-lg text-base leading-7 text-slate-400 xl:text-lg">
                Access your courses, continue your lessons, download learning
                resources and track your progress from one beautiful learning
                platform.
              </p>

              {/* Feature cards */}
              <div className="mt-10 grid max-w-lg grid-cols-2 gap-3">

                <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur-sm">
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10">
                    <BookOpen className="h-4 w-4 text-violet-300" />
                  </div>

                  <p className="text-sm font-semibold text-white">
                    Learn at your pace
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Access your lessons whenever you are ready.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur-sm">
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
                    <ShieldCheck className="h-4 w-4 text-emerald-300" />
                  </div>

                  <p className="text-sm font-semibold text-white">
                    Secure learning
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Your account and learning progress stay protected.
                  </p>
                </div>

              </div>
            </div>

            {/* Footer */}
            <div className="text-xs text-slate-500">
              © 2026 AI Storysprint Editing. All rights reserved.
            </div>
          </div>
        </section>

        {/* =====================================================
            RIGHT LOGIN PANEL
        ====================================================== */}
        <section className="flex min-h-screen w-full items-center justify-center px-4 py-8 sm:px-6 lg:w-[48%] xl:w-[45%] lg:px-10 xl:px-16">

          <div className="w-full max-w-md">

            {/* Mobile logo */}
            <div className="mb-10 flex items-center justify-center lg:hidden">
              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-600 shadow-lg shadow-violet-600/20">
                  <Play
                    className="h-5 w-5 fill-current text-white"
                    strokeWidth={2.5}
                  />
                </div>

                <div className="leading-none">
                  <div className="text-lg font-extrabold tracking-tight text-slate-900">
                    AI STORYSPRINT
                  </div>

                  <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.3em] text-slate-400">
                    Editing
                  </div>
                </div>

              </div>
            </div>

            {/* Login heading */}
            <div className="mb-8">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50">
                <ShieldCheck className="h-5 w-5 text-violet-600" />
              </div>

              <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Welcome back
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Sign in to continue your learning journey.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div
                role="alert"
                className="mb-5 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3.5 text-sm text-red-700"
              >
                <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-red-500" />

                <p className="leading-5">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-5">

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Email address
                </label>

                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                />
              </div>

              {/* Password */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-slate-700"
                  >
                    Password
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      // Future forgot password flow
                      console.log("Forgot password clicked");
                    }}
                    className="text-xs font-semibold text-violet-600 transition hover:text-violet-700 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                  />

                  <button
                    type="button"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember */}
              <div className="flex items-center">
                <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-500">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                  />

                  <span>Remember me</span>
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition-all duration-200 hover:bg-violet-700 hover:shadow-xl hover:shadow-violet-600/25 focus:outline-none focus:ring-4 focus:ring-violet-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in

                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            {/* Security message */}
            <div className="mt-8 flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />

              <p className="text-xs leading-5 text-slate-500">
                Your connection is secure. Only authorized users can access
                the AI Storysprint Editing platform.
              </p>
            </div>

            {/* Mobile footer */}
            <p className="mt-8 text-center text-xs text-slate-400 lg:hidden">
              © 2026 AI Storysprint Editing. All rights reserved.
            </p>

          </div>
        </section>
      </div>
    </main>
  );
}

