
"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    const image = (formData.get("image") as string).trim();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await authClient.signUp.email({
        name,
        email,
        password,
        image: image || undefined,
        callbackURL: "/dashboard",
      });

      if (error) {
        toast.error(error.message || "Account creation failed!");
        return;
      }

      toast.success("Account created successfully!");

      console.log("Registration successful:", data);
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);

    try {
      const { error } = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      });

      if (error) {
        toast.error(error.message || "Google sign up failed!");
      }
    } catch (error) {
      console.error("Google signup error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080b16] px-4 py-10">
      <div className="absolute -left-40 -top-40 h-[450px] w-[450px] rounded-full bg-purple-600/25 blur-[130px]" />
      <div className="absolute -bottom-40 -right-40 h-[450px] w-[450px] rounded-full bg-blue-600/25 blur-[130px]" />
      <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-500/10 blur-[120px]" />

      <div className="relative z-10 w-full max-w-md">
        <Link
          href="/"
          className="mb-7 block text-center text-4xl font-bold text-white"
        >
          Rentora<span className="text-[#80bd50]">.</span>
        </Link>

        <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 shadow-2xl backdrop-blur-2xl sm:p-8">
          <div className="mb-7 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500">
              <UserRound className="h-7 w-7 text-white" />
            </div>

            <h1 className="text-3xl font-bold text-white">
              Create Account
            </h1>
            <p className="mt-2 text-sm text-gray-400">
              Join Rentora and start renting smarter.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-200">
                Full Name
              </label>
              <div className="relative">
                <UserRound className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  autoComplete="name"
                  required
                  className="h-12 border-white/10 bg-white/5 pl-11 text-white placeholder:text-gray-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-200">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  autoComplete="email"
                  required
                  className="h-12 border-white/10 bg-white/5 pl-11 text-white placeholder:text-gray-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-200">
                Profile Image URL
              </label>
              <div className="relative">
                <ImageIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  type="url"
                  name="image"
                  placeholder="https://example.com/profile.jpg"
                  className="h-12 border-white/10 bg-white/5 pl-11 text-white placeholder:text-gray-500"
                />
              </div>
              <p className="text-xs text-gray-500">
                Optional. Paste a link to your profile picture.
              </p>
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
                  placeholder="Create a password"
                  autoComplete="new-password"
                  minLength={8}
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

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-200">
                Confirm Password
              </label>
              <div className="relative">
                <LockKeyhole className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  className="h-12 border-white/10 bg-white/5 pl-11 pr-12 text-white placeholder:text-gray-500"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  aria-label="Toggle confirm password visibility"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || googleLoading}
              className="mt-3 h-12 w-full bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-base font-semibold text-white hover:opacity-90"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </Button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#101525] px-3 text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              disabled={loading || googleLoading}
              onClick={handleGoogleSignUp}
              className="h-12 w-full border-white/15 bg-white/5 text-white transition-all hover:border-white/30 hover:bg-white/10 hover:text-white"
            >
              <svg viewBox="0 0 48 48" className="mr-2 h-5 w-5">
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.76 7.18l7.73 6C44.42 37.94 46.98 31.75 46.98 24.55z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.93 23.93 0 0 0 0 24c0 3.88.93 7.54 2.56 10.78l7.97-6.19z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.15 1.45-4.92 2.3-8.18 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                />
              </svg>
              {googleLoading ? "Redirecting..." : "Continue with Google"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-400">
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="font-semibold text-purple-400 hover:text-purple-300"
            >
              Sign In
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-gray-500">
          © 2026 Rentora. All rights reserved.
        </p>
      </div>
    </main>
  );
}
