"use client";

import CompanyCard from "@/components/CompanyCard";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Company = {
    companyCode: string;
    companyName: string;
    companyLogo: string | null;
    companyUrl: string | null;
    shortNote: string;
    indicativePrice: number;
    minQty: number;
};

type Pagination = {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
};

export default function PreIPOPage() {
    const router = useRouter();

    useEffect(() => {
        async function init() {
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/auth/me`,
                    {
                        credentials: "include",
                    }
                );

                if (res.ok) {
                    router.replace("/dashboard");
                    return;
                }

                await fetchCompanies();
            } finally {
                setCheckingAuth(false);
            }
        }

        init();
    }, [router]);

    const [checkingAuth, setCheckingAuth] = useState(true);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [pagination, setPagination] = useState<Pagination>({
        page: 1,
        limit: 25,
        total: 0,
        totalPages: 1,
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function checkAuth() {
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/auth/me`,
                    {
                        credentials: "include",
                    }
                );

                if (res.ok) {
                    router.replace("/dashboard");
                    return;
                }
            } finally {
                setCheckingAuth(false);
            }
        }

        checkAuth();
    }, [router]);

    async function fetchCompanies(page = 1) {
        try {
            setLoading(true);

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/companies?page=${page}&limit=25`
            );

            const data = await response.json();

            if (!response.ok)
                throw new Error(data.message);

            setCompanies(data.companies);
            setPagination(data.pagination);
        }
        catch (err) {
            console.error(err);
        }
        finally {
            setLoading(false);
        }
    }

    if (checkingAuth) {
        return null;
    } else {
        return (
            <main className="min-h-screen bg-slate-50">
                <section className="mx-auto max-w-7xl px-6 py-12">

                    {/* Heading */}
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-slate-900">
                            Unlisted Shares - Exclusive Pre-IPO Opportunities
                        </h1>

                        <p className="mx-auto mt-5 max-w-5xl text-lg leading-8 text-slate-600">
                            Unlisted shares provide ownership in promising companies before
                            they are listed on stock exchanges. They offer early access to
                            high-potential businesses at the pre-IPO stage. By investing
                            early, investors position themselves for potential value
                            appreciation upon listing.
                        </p>

                        <p className="mt-6 text-xl font-semibold text-slate-700">
                            To buy/sell, please{" "}
                            <Link
                                href="/login"
                                className="font-bold text-orange-600 hover:text-orange-700"
                            >
                                log in
                            </Link>
                        </p>
                    </div>

                    {/* Pagination */}
                    {(
                        <div className="mt-10 flex items-center justify-center gap-4">

                            <button
                                onClick={() => fetchCompanies(pagination.page - 1)}
                                disabled={pagination.page === 1}
                                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"                        >
                                Previous
                            </button>

                            <span className="text-sm font-medium text-slate-700">
                                Page {pagination.page} of {pagination.totalPages}
                            </span>

                            <button
                                onClick={() => fetchCompanies(pagination.page + 1)}
                                disabled={pagination.page === pagination.totalPages}
                                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"                        >
                                Next
                            </button>

                        </div>
                    )}

                    {/* Company List */}
                    <div className="mt-12 space-y-6">
                        {loading ? (
                            <p>Loading...</p>
                        ) : (
                            companies.map((company) => (
                                <CompanyCard
                                    key={company.companyCode}
                                    logo={
                                        `${process.env.NEXT_PUBLIC_API_URL}/uploads/company-logos/${company.companyLogo}`
                                    }
                                    companyCode={company.companyCode}
                                    companyName={company.companyName}
                                    companyUrl={company.companyUrl || "#"}
                                    description={company.shortNote}
                                    indicativePrice={company.indicativePrice}
                                    minQty={company.minQty}
                                />
                            ))
                        )}
                    </div>

                    {/* Pagination */}
                    {(
                        <div className="mt-10 flex items-center justify-center gap-4">

                            <button
                                onClick={() => fetchCompanies(pagination.page - 1)}
                                disabled={pagination.page === 1}
                                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"                        >
                                Previous
                            </button>

                            <span className="text-sm font-medium text-slate-700">
                                Page {pagination.page} of {pagination.totalPages}
                            </span>

                            <button
                                onClick={() => fetchCompanies(pagination.page + 1)}
                                disabled={pagination.page === pagination.totalPages}
                                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"                        >
                                Next
                            </button>

                        </div>
                    )}

                </section>
            </main>
        );
    }
}