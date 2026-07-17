"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface Admin {
    name: string;
    email: string;
    phoneNumber: string;
}

interface PendingUser {
    id: number;
    name: string;
    email: string;
    phoneNumber: string;
    status: string;
}

interface Company {
    companyCode: string;
    companyName: string;
    companyLogo: string | null;
    companyUrl: string | null;
    shortNote: string | null;
    indicativePrice: number;
    minQty: number;
    isActive: "ACTIVE" | "INACTIVE";

}

export default function AdminCard() {
    const [admin, setAdmin] = useState<Admin | null>(null);        // State to hold user data
    const [loading, setLoading] = useState(true);               // State for loading status, true while fetching user data, false once fetched
    const [error, setError] = useState("");                     // State for error messages
    const [role, setRole] = useState("unknown");
    const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [newCompany, setNewCompany] = useState({
        companyCode: "",
        companyName: "",
        companyLogo: "",
        companyUrl: "",
        shortNote: "",
        indicativePrice: "",
        minQty: ""
    });

    const router = useRouter();                                 // Navigation hook to programmatically navigate between pages

    useEffect(() => {
        fetchAdmin();
        fetchCompanies();
    }, [router]);

    async function fetchAdmin() {
        try {
            // Get admin details
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/auth/me`,
                {
                    credentials: "include",     // Include cookies to maintain session
                }
            );

            if (response.ok) {
                const data = await response.json();

                if (data.role !== "ADMIN") {
                    router.replace("/dashboard");
                    return;
                }

                // Display admin details
                setAdmin(data.user);
                setRole(data.role);

                const pendingClientDetails = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/admin/pending-users`,
                    {
                        credentials: "include"
                    }
                );

                const pendingData = await pendingClientDetails.json();

                setPendingUsers(pendingData.users);

            } else {
                router.push("/session-ended?reason=expired");
            }
        }
        catch {
            setError("Unable to connect to server.");
        }
        finally {
            setLoading(false);
        }
    }

    async function fetchCompanies() {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/admin/companies`,
                {
                    credentials: "include",
                }
            );

            if (!response.ok) {
                return;
            }

            const data = await response.json();
            setCompanies(data.companies);
        }
        catch (err) {
            console.error(err);
        }
    }

    async function createCompany() {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/admin/companies`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        ...newCompany,
                        indicativePrice: Number(newCompany.indicativePrice),
                        minQty: Number(newCompany.minQty)
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.message);
                return;
            }

            setNewCompany({
                companyCode: "",
                companyName: "",
                companyLogo: "",
                companyUrl: "",
                shortNote: "",
                indicativePrice: "",
                minQty: "",
            });

            fetchCompanies();
        }
        catch {
            alert("Unable to create company.");
        }
    }

    async function updateUserStatus(id: number, status: "ACTIVE" | "REJECTED") {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/admin/users/${id}/status`,
            {
                method: "PATCH",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status })
            }
        );

        if (response.ok) {
            setPendingUsers(prev => prev.filter(user => user.id !== id));
        }
    }

    async function updateCompanyStatus(companyCode: string, status: "ACTIVE" | "INACTIVE") {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/admin/companies/${companyCode}/status`,
                {
                    method: "PATCH",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ status }),
                }
            );

            if (!response.ok) {
                const data = await response.json();
                alert(data.message);
                return;
            }

            fetchCompanies();
        } catch {
            alert("Unable to fetch company status.");
        }
    }

    // Handle logout
    async function handleLogout() {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/logout`,
            {
                method: "POST",
                credentials: "include",
            }
        );

        if (response.ok) {
            router.push("/session-ended?reason=logout");
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-lg text-gray-600">Loading...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-red-600">{error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900">
            {/* Top Navigation Bar */}
            <header className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-4 shadow-sm">
                <h1 className="text-2xl font-bold tracking-tight text-blue-700">
                    MeraWealth Admin
                </h1>

                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <h2 className="text-lg font-semibold text-slate-900">
                            {admin?.name}
                        </h2>

                        <p className="text-sm text-slate-500">
                            {admin?.email}
                        </p>

                        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                            {role}
                        </p>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
                    >
                        Logout
                    </button>
                </div>
            </header>

            {/* Dashboard Body */}
            <main className="p-8">
                <h2 className="mb-6 text-3xl font-bold tracking-tight text-slate-900">
                    Admin Dashboard
                </h2>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="mb-4 text-lg font-semibold text-slate-900">
                            Pending User Approvals
                        </h3>

                        {
                            pendingUsers.length === 0 ? (
                                <p className="text-sm text-slate-500">
                                    No pending users.
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {
                                        pendingUsers.map((user) => (
                                            <div key={user.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                                                <div className="space-y-2 text-sm">
                                                    <p>
                                                        <span className="font-medium text-slate-600">
                                                            Name:
                                                        </span>{" "}
                                                        <span className="text-slate-900">
                                                            {user.name}
                                                        </span>
                                                    </p>

                                                    <p>
                                                        <span className="font-medium text-slate-600">
                                                            Email:
                                                        </span>{" "}
                                                        <span className="text-slate-900">
                                                            {user.email}
                                                        </span>
                                                    </p>

                                                    <p>
                                                        <span className="font-medium text-slate-600">
                                                            Phone:
                                                        </span>{" "}
                                                        <span className="text-slate-900">
                                                            {user.phoneNumber}
                                                        </span>
                                                    </p>

                                                    <p>
                                                        <span className="font-medium text-slate-600">
                                                            Status:
                                                        </span>{" "}
                                                        <span className="font-semibold text-amber-600">
                                                            {user.status}
                                                        </span>
                                                    </p>
                                                </div>

                                                <div className="mt-4 flex gap-2">
                                                    <button className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-green-700"
                                                        onClick={() => updateUserStatus(user.id, "ACTIVE")}>
                                                        Approve
                                                    </button>

                                                    <button className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-700"
                                                        onClick={() => updateUserStatus(user.id, "REJECTED")}>
                                                        Reject
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            )}
                    </section>

                    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="mb-2 text-lg font-semibold text-slate-900">
                            Pending Transactions
                        </h3>

                        <p className="text-sm text-slate-500">
                            Feature coming soon.
                        </p>
                    </section>

                    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:col-span-2">

                        <h3 className="mb-4 text-lg font-semibold text-slate-900">
                            Company Management
                        </h3>

                        {
                            companies.length === 0 ? (
                                <p className="text-sm text-slate-500">
                                    No companies added.
                                </p>
                            ) : (
                                <div className="overflow-x-auto">

                                    <table className="w-full table-fixed border-collapse">

                                        <thead>
                                            <tr className="border-b">
                                                <th className="w-24 py-3 text-left">Code</th>
                                                <th className="w-[40%] py-3 text-left">Company</th>
                                                <th className="w-32 py-3 text-right">Price</th>
                                                <th className="w-24 py-3 text-center">Min Qty</th>
                                                <th className="w-32 py-3 text-center">Status</th>
                                                <th className="w-40 py-3 text-center">Actions</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {
                                                companies.map(company => (
                                                    <tr
                                                        key={company.companyCode}
                                                        className="border-b border-slate-200"
                                                    >
                                                        <td className="py-3">
                                                            {company.companyCode}
                                                        </td>

                                                        <td className="py-3 font-medium">
                                                            {company.companyName}
                                                        </td>

                                                        <td className="py-3 text-right">
                                                            ₹{company.indicativePrice}
                                                        </td>

                                                        <td className="py-3 text-center">
                                                            {company.minQty}
                                                        </td>

                                                        <td className="py-3 text-center">
                                                            <span
                                                                className={
                                                                    company.isActive === "ACTIVE"
                                                                        ? "inline-block w-24 rounded-full bg-green-100 px-3 py-1 text-center text-xs font-semibold text-green-700"
                                                                        : "inline-block w-24 rounded-full bg-red-100 px-3 py-1 text-center text-xs font-semibold text-red-700"
                                                                }
                                                            >
                                                                {company.isActive}
                                                            </span>
                                                        </td>

                                                        <td className="py-3 text-center">
                                                            <button
                                                                onClick={() =>
                                                                    updateCompanyStatus(
                                                                        company.companyCode,
                                                                        company.isActive === "ACTIVE"
                                                                            ? "INACTIVE"
                                                                            : "ACTIVE"
                                                                    )
                                                                }
                                                                className={
                                                                    company.isActive === "ACTIVE"
                                                                        ? "w-28 rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
                                                                        : "w-28 rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
                                                                }
                                                            >
                                                                {company.isActive === "ACTIVE"
                                                                    ? "Deactivate"
                                                                    : "Activate"}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            }
                                        </tbody>

                                    </table>

                                </div>
                            )
                        }

                        {/* Add Company Section */}
                        <div className="my-8 border-t border-slate-200 pt-6">

                            <div className="mb-6">
                                <h3 className="text-xl font-semibold text-slate-900">
                                    Add New Company
                                </h3>

                                <p className="mt-1 text-sm text-slate-500">
                                    Fill in the details below to register a new company.
                                </p>
                            </div>

                            <div className="mb-6 grid grid-cols-2 gap-4">

                                <input
                                    placeholder="Company Code"
                                    value={newCompany.companyCode}
                                    onChange={(e) =>
                                        setNewCompany({
                                            ...newCompany,
                                            companyCode: e.target.value,
                                        })
                                    }
                                    className="rounded border p-2"
                                />

                                <input
                                    placeholder="Company Name"
                                    value={newCompany.companyName}
                                    onChange={(e) =>
                                        setNewCompany({
                                            ...newCompany,
                                            companyName: e.target.value,
                                        })
                                    }
                                    className="rounded border p-2"
                                />

                                <input
                                    placeholder="Logo Path"
                                    value={newCompany.companyLogo}
                                    onChange={(e) =>
                                        setNewCompany({
                                            ...newCompany,
                                            companyLogo: e.target.value,
                                        })
                                    }
                                    className="rounded border p-2"
                                />

                                <input
                                    placeholder="Company URL"
                                    value={newCompany.companyUrl}
                                    onChange={(e) =>
                                        setNewCompany({
                                            ...newCompany,
                                            companyUrl: e.target.value,
                                        })
                                    }
                                    className="rounded border p-2"
                                />

                                <input
                                    placeholder="Indicative Price"
                                    type="number"
                                    value={newCompany.indicativePrice}
                                    onChange={(e) =>
                                        setNewCompany({
                                            ...newCompany,
                                            indicativePrice: e.target.value,
                                        })
                                    }
                                    className="rounded border p-2"
                                />

                                <input
                                    placeholder="Minimum Quantity"
                                    type="number"
                                    value={newCompany.minQty}
                                    onChange={(e) =>
                                        setNewCompany({
                                            ...newCompany,
                                            minQty: e.target.value,
                                        })
                                    }
                                    className="rounded border p-2"
                                />

                            </div>

                            <textarea
                                placeholder="Short Note"
                                value={newCompany.shortNote}
                                onChange={(e) =>
                                    setNewCompany({
                                        ...newCompany,
                                        shortNote: e.target.value,
                                    })
                                }
                                className="mb-4 w-full rounded border p-2"
                            />

                            <button
                                onClick={createCompany}
                                className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
                            >
                                Add Company
                            </button>

                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}