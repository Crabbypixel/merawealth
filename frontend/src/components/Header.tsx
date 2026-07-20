"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const navLinks = [
    { name: "Home", href: "/" },
    { name: "Pre-IPO", href: "/pre-ipo" },
    { name: "FDR", href: "/fdr" },
    { name: "Bonds", href: "/bonds" },
    { name: "Mutual Funds", href: "/mutual-funds" },
];

export default function Header() {
    const pathname = usePathname();

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [dashboardHref, setDashboardHref] = useState("/dashboard");
    const [menuOpen, setMenuOpen] = useState(false);

    async function checkAuth() {
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/auth/me`,
                {
                    credentials: "include",
                }
            );

            if (res.ok) {
                const user = await res.json();

                setIsLoggedIn(true);
                setDashboardHref(
                    user.role === "ADMIN" ? "/admin" : "/dashboard"
                );
            } else {
                setIsLoggedIn(false);
            }
        } catch {
            setIsLoggedIn(false);
        } finally {
            setCheckingAuth(false);
        }
    }

    useEffect(() => {
        checkAuth();
    }, [pathname]);


    return (
        <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
            <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">

                {/* Logo */}
                <Link href="/" className="flex items-center">
                    <img
                        src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/public/merawealth_logo.png`}
                        alt="MeraWealth"
                        className="h-12 w-auto"
                    />
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden items-center gap-8 lg:flex">
                    {navLinks.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="text-sm font-medium text-slate-700 transition hover:text-blue-600"
                        >
                            {item.name}
                        </Link>
                    ))}
                </nav>

                {/* Desktop Auth */}
                <div className="hidden items-center gap-3 lg:flex">
                    {!checkingAuth &&
                        (isLoggedIn ? (
                            <Link
                                href={dashboardHref}
                                className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="rounded-lg border border-slate-300 px-5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                                >
                                    Login
                                </Link>

                                <Link
                                    href="/register"
                                    className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                                >
                                    Sign Up
                                </Link>
                            </>
                        ))}
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="rounded-md p-2 text-slate-700 lg:hidden"
                >
                    {menuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {menuOpen && (
                <div className="border-t border-slate-200 bg-white lg:hidden">
                    <div className="flex flex-col px-6 py-4">

                        {navLinks.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setMenuOpen(false)}
                                className="py-3 text-base font-medium text-slate-700 hover:text-blue-600"
                            >
                                {item.name}
                            </Link>
                        ))}

                        <div className="mt-4 border-t border-slate-200 pt-4">
                            {!checkingAuth &&
                                (isLoggedIn ? (
                                    <Link
                                        href={dashboardHref}
                                        onClick={() => setMenuOpen(false)}
                                        className="block rounded-lg bg-blue-600 px-5 py-3 text-center font-medium text-white hover:bg-blue-700"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        <Link
                                            href="/login"
                                            onClick={() => setMenuOpen(false)}
                                            className="rounded-lg border border-slate-300 px-5 py-3 text-center font-medium text-slate-700 hover:bg-slate-100"
                                        >
                                            Login
                                        </Link>

                                        <Link
                                            href="/register"
                                            onClick={() => setMenuOpen(false)}
                                            className="rounded-lg bg-blue-600 px-5 py-3 text-center font-medium text-white hover:bg-blue-700"
                                        >
                                            Sign Up
                                        </Link>
                                    </div>
                                ))}
                        </div>

                    </div>
                </div>
            )}
        </header>
    );
}