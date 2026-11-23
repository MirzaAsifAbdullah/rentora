
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  LayoutDashboard,
  LogOut,
  Menu,
  UserRound,
  X,
} from "lucide-react";

import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { authClient } from "@/lib/auth-client";
import { getDashboardPath, getProfilePath } from "@/lib/roles";

// Navbar links
const navLinks = [
  { name: "Home", href: "/" },
  { name: "All Equipment", href: "/equipment" },
  { name: "About Us", href: "/about" },
  { name: "Contact Us", href: "/contact" },
];

// User account links generated from the signed-in user's role
function getAccountLinks(role: unknown) {
  return [
    { name: "Profile", href: getProfilePath(role), icon: UserRound },
    { name: "Dashboard", href: getDashboardPath(role), icon: LayoutDashboard },
  ];
}

// User Avatar Component
function UserAvatar({
  name,
  image,
  size = "md",
}: {
  name?: string | null;
  image?: string | null;
  size?: "md" | "lg";
}) {
  const [failed, setFailed] = useState(false);

  const initials =
    name
      ?.trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "U";

  const dimension =
    size === "lg"
      ? "h-11 w-11 text-sm"
      : "h-10 w-10 text-sm";

  if (image && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={image}
        alt={name ? `${name}'s avatar` : "User avatar"}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className={`${dimension} shrink-0 rounded-full object-cover ring-2 ring-white/20`}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={`${dimension} flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#80bd50] to-emerald-700 font-semibold text-white ring-2 ring-white/20`}
    >
      {initials}
    </span>
  );
}

// Main Navbar Component
export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const router = useRouter();

  // Get Better Auth session
  const { data: session, isPending } = authClient.useSession();

  const user = session?.user;
  const isLoggedIn = Boolean(user);
  const accountLinks = getAccountLinks(user?.role);

  // Sign Out Function
  const handleSignOut = async () => {
    if (signingOut) return;

    setSigningOut(true);

    try {
      const { error } = await authClient.signOut();

      if (error) {
        toast.error(error.message || "Sign out failed. Please try again.");
        return;
      }

      toast.success("Signed out successfully!");

      setIsOpen(false);

      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Sign out error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <header className="absolute top-0 left-0 z-50 w-full border-b border-white/15 bg-black/40 backdrop-blur-sm">

      <nav className="mx-auto flex h-20 max-w-[1600px] items-center justify-between px-5 md:px-10 lg:px-16">

        {/* Logo */}
        <Link
          href="/"
          className="text-3xl font-bold tracking-tight text-white md:text-4xl"
        >
          Rentora<span className="text-[#80bd50]">.</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-[15px] font-semibold text-white transition-colors duration-300 hover:text-[#80bd50]"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Desktop Authentication */}
        <div className="hidden items-center gap-3 lg:flex">

          {isPending ? (
            <span className="h-10 w-10 animate-pulse rounded-full bg-white/10" />
          ) : isLoggedIn && user ? (
            <>
              <span className="max-w-44 truncate text-sm text-gray-300">
                Welcome{" "}
                <span className="font-semibold text-white">
                  {user.name}
                </span>
              </span>

              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger
                  aria-label="Open account menu"
                  className="rounded-full outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-[#80bd50] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                >
                  <UserAvatar
                    name={user.name}
                    image={user.image}
                  />
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  sideOffset={10}
                  className="w-64 rounded-xl border border-white/10 bg-[#0b0f1c] p-1.5 text-white shadow-2xl ring-0"
                >
                  {/* User Information */}
                  <div className="flex items-center gap-3 px-2 py-2">
                    <UserAvatar
                      name={user.name}
                      image={user.image}
                      size="lg"
                    />

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">
                        Welcome, {user.name}
                      </p>

                      <p className="truncate text-xs text-gray-400">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <DropdownMenuSeparator className="bg-white/10" />

                  {/* Account Links */}
                  {accountLinks.map((link) => {
                    const Icon = link.icon;

                    return (
                      <DropdownMenuItem
                        key={link.name}
                        render={<Link href={link.href} />}
                        className="gap-2.5 rounded-lg px-2.5 py-2 text-sm text-gray-200 focus:bg-white/10 focus:text-white focus:**:text-white"
                      >
                        <Icon className="h-4 w-4" />
                        {link.name}
                      </DropdownMenuItem>
                    );
                  })}

                  <DropdownMenuSeparator className="bg-white/10" />

                  {/* Logout */}
                  <DropdownMenuItem
                    variant="destructive"
                    disabled={signingOut}
                    onClick={handleSignOut}
                    className="gap-2.5 rounded-lg px-2.5 py-2 text-sm text-red-400 data-[variant=destructive]:text-red-400 data-[variant=destructive]:focus:bg-red-500/10 data-[variant=destructive]:focus:text-red-300 focus:**:text-red-300"
                  >
                    <LogOut className="h-4 w-4" />
                    {signingOut ? "Logging out..." : "Log out"}
                  </DropdownMenuItem>

                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              {/* Sign In */}
              <Link
                href="/sign-in"
                className="inline-flex h-11 items-center justify-center rounded-md border border-white/70 bg-transparent px-6 text-sm font-medium text-white transition-colors hover:bg-white hover:text-black"
              >
                Sign In
              </Link>

              {/* Register */}
              <Link
                href="/sign-up"
                className="inline-flex h-11 items-center justify-center rounded-md bg-[#80bd50] px-6 text-sm font-medium text-white transition-colors hover:bg-[#6da640]"
              >
                Register
              </Link>
            </>
          )}

        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="text-white lg:hidden"
          aria-label="Toggle navigation menu"
          aria-expanded={isOpen}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

      </nav>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="border-t border-white/10 bg-black/95 px-6 py-6 lg:hidden">

          <div className="flex flex-col gap-5">

            {/* Mobile Nav Links */}
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-base font-medium text-white transition-colors hover:text-[#80bd50]"
              >
                {link.name}
              </Link>
            ))}

            {/* Mobile Authentication */}
            <div className="flex flex-col gap-3 border-t border-white/15 pt-5">

              {isPending ? (
                <div className="h-16 w-full animate-pulse rounded-xl bg-white/10" />
              ) : isLoggedIn && user ? (
                <>
                  {/* Mobile User Information */}
                  <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
                    <UserAvatar
                      name={user.name}
                      image={user.image}
                    />

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">
                        Welcome, {user.name}
                      </p>

                      <p className="truncate text-xs text-gray-400">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  {/* Mobile Account Links */}
                  {accountLinks.map((link) => {
                    const Icon = link.icon;

                    return (
                      <Link
                        key={link.name}
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-base font-medium text-white transition-colors hover:bg-white/10 hover:text-[#80bd50]"
                      >
                        <Icon className="h-4 w-4" />
                        {link.name}
                      </Link>
                    );
                  })}

                  {/* Mobile Logout */}
                  <button
                    type="button"
                    onClick={handleSignOut}
                    disabled={signingOut}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-base font-medium text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50"
                  >
                    <LogOut className="h-4 w-4" />
                    {signingOut ? "Logging out..." : "Log out"}
                  </button>
                </>
              ) : (
                <>
                  {/* Mobile Sign In */}
                  <Link
                    href="/sign-in"
                    onClick={() => setIsOpen(false)}
                    className="flex h-10 items-center justify-center rounded-md border border-white/70 bg-transparent text-sm font-medium text-white transition-colors hover:bg-white hover:text-black"
                  >
                    Sign In
                  </Link>

                  {/* Mobile Register */}
                  <Link
                    href="/sign-up"
                    onClick={() => setIsOpen(false)}
                    className="flex h-10 items-center justify-center rounded-md bg-[#80bd50] text-sm font-medium text-white transition-colors hover:bg-[#6da640]"
                  >
                    Register
                  </Link>
                </>
              )}

            </div>
          </div>
        </div>
      )}

    </header>
  );
}
