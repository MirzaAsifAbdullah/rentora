
"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { getDashboardPath } from "@/lib/roles";
import { useRouter } from "next/navigation";


export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);

    try {
      const { data, error } = await authClient.signIn.email({
        email,
        password,
      });

      if (error) {
        toast.error(error.message || "Sign in failed!");
        return;
      }

      let role: unknown = data?.user?.role;

      // Fall back to the session endpoint if the sign-in response
      // does not include the additional role field.
      if (!role) {
        const sessionResult = await authClient.getSession();
        role = sessionResult.data?.user?.role;
      }

      toast.success("Signed in successfully!");

      router.replace(getDashboardPath(role));
      router.refresh();
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);

    try {
      const { error } = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      });

      if (error) {
        toast.error(error.message || "Google sign in failed!");
      }
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080b16] px-4 py-12">
      <div className="absolute -left-40 -top-40 h-[450px] w-[450px] rounded-full bg-purple-600/25 blur-[130px]" />
      <div className="absolute -bottom-40 -right-40 h-[450px] w-[450px] rounded-full bg-blue-600/25 blur-[130px]" />

      <div className="relative z-10 w-full max-w-md">
        <Link href="/" className="mb-8 block text-center text-4xl font-bold text-white">
          Rentora<span className="text-[#80bd50]">.</span>
        </Link>

        <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-7 shadow-2xl backdrop-blur-2xl sm:p-9">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500">
              <LockKeyhole className="h-7 w-7 text-white" />
            </div>

            <h1 className="text-3xl font-bold text-white">Welcome Back!</h1>
            <p className="mt-3 text-sm text-gray-400">
              Sign in to continue with Rentora.
            </p>
          </div>

          <form onSubmit={handleSignIn} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-200">
                Email Address
              </label>

              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />

                <Input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  autoComplete="email"
                  required
                  className="h-12 border-white/10 bg-white/5 pl-11 text-white placeholder:text-gray-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-200">
                Password
              </label>

              <div className="relative">
                <LockKeyhole className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />

                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className="h-12 border-white/10 bg-white/5 pl-11 pr-12 text-white placeholder:text-gray-500"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-purple-400 hover:text-purple-300"
              >
                Forgot Password?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="h-12 w-full bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-base font-semibold text-white hover:opacity-90"
            >
              {loading ? "Signing In..." : "Sign In"}
            </Button>

            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={handleGoogleSignIn}
              className="h-12 w-full border-white/15 bg-white/5 text-white transition-all hover:border-white/30 hover:bg-white/10 hover:text-white"
            >
              Continue with Google
            </Button>
          </form>

          <p className="mt-7 text-center text-sm text-gray-400">
            Do not have an account?{" "}
            <Link
              href="/sign-up"
              className="font-semibold text-purple-400 hover:text-purple-300"
            >
              Sign Up
            </Link>
          </p>
        </div>

        <p className="mt-7 text-center text-xs text-gray-500">
          © 2026 Rentora. All rights reserved.
        </p>
      </div>
    </main>
  );
}
