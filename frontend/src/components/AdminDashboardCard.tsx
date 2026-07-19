"use client"

import { apiFetch } from "@/utils/apiFetch";
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

type UserStatus = "PENDING" | "ACTIVE" | "REJECTED" | "INACTIVE";

const USER_STATUSES: ("ALL" | UserStatus)[] = [
    "ALL",
    "PENDING",
    "ACTIVE",
    "REJECTED",
    "INACTIVE",
];

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

    panNumber: string;
    dematClientId: string;
    dematDpId: string;

    bankAccountNo: string;
    ifscCode: string;
    bankName: string;

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

interface Transaction {
    id: number;
    quantity: number;
    type: "BUY" | "SELL";
    status: string;
    priceAtOrder: string;
    totalAmount: string;
    createdAt: string;
    user: {
        name: string;
        phoneNumber: string,
        email: string;
    };
    company: { companyName: string; };
}

export default function AdminCard() {
    const [admin, setAdmin] = useState<Admin | null>(null);        // State to hold user data
    const [loading, setLoading] = useState(true);               // State for loading status, true while fetching user data, false once fetched
    const [error, setError] = useState("");                     // State for error messages
    const [role, setRole] = useState("unknown");
    //const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
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
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [page, setPage] = useState(1);
    const limit = 10;
    const [pagination, setPagination] = useState({
        page: 1,
        totalPages: 1,
        total: 0
    });
    const [processingId, setProcessingId] = useState<number | null>(null);
    //const [refreshing, setRefreshing] = useState(false);
    const [refreshingUsers, setRefreshingUsers] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState("ALL");
    const [companyPagination, setCompanyPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
    });
    const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);
    const [showUserModal, setShowUserModal] = useState(false);
    const [savingUser, setSavingUser] = useState(false);

    const [users, setUsers] = useState<PendingUser[]>([]);

    const [userPagination, setUserPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
    });

    const [selectedUserStatus, setSelectedUserStatus] = useState<"ALL" | UserStatus>("ALL");

    const router = useRouter();                                 // Navigation hook to programmatically navigate between pages

    useEffect(() => {
        fetchAdmin();
        fetchCompanies();
        fetchTransactions();
    }, [router]);

    useEffect(() => {
        fetchTransactions(selectedStatus);
    }, [selectedStatus]);

    useEffect(() => {
        fetchUsers(1, selectedUserStatus);
    }, [selectedUserStatus]);

    // Centralized route and notification mapper
    function handleError(err: any, fallbackMessage: string) {
        if (err.message === "session_ended") {
            const redirectReason = err.reason || "expired";
            router.push(`/session-ended?reason=${redirectReason}`);
            return;
        }
        console.error(err);
        alert(err.message || fallbackMessage);
    }

    async function fetchUser(id: number) {
        try {
            const data = await apiFetch(`/admin/users/${id}`);

            setSelectedUser(data.user);
            setShowUserModal(true);
        } catch (err) {
            handleError(err, "Unable to fetch user.");
        }
    }

    async function saveUser() {
        if (!selectedUser) return;

        try {
            setSavingUser(true);

            const {
                name,
                email,
                phoneNumber,
                panNumber,
                dematClientId,
                dematDpId,
                bankAccountNo,
                ifscCode,
                bankName,
            } = selectedUser;

            await apiFetch(`/admin/users/${selectedUser.id}`, {
                method: "PATCH",
                bodyData: {
                    name,
                    email,
                    phoneNumber,
                    panNumber,
                    dematClientId,
                    dematDpId,
                    bankAccountNo,
                    ifscCode,
                    bankName,
                },
            });

            await fetchUsers();

            alert("User updated successfully.");
        } finally {
            setSavingUser(false);
        }
    }

    async function fetchUsers(page = 1, status = selectedUserStatus) {
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: userPagination.limit.toString(),
            });

            if (status !== "ALL") {
                params.append("status", status);
            }

            const data = await apiFetch(
                `/admin/users?${params.toString()}`
            );

            setUsers(data.users);
            setUserPagination(data.pagination);
        } catch (err) {
            handleError(err, "Unable to fetch users.");
        }
    }

    async function fetchTransactions(status = selectedStatus, currentPage = page) {
        try {
            //setRefreshing(true);

            const params = new URLSearchParams();

            if (status !== "ALL") {
                params.append("status", status);
            }

            params.append("page", currentPage.toString());
            params.append("limit", limit.toString());

            const data = await apiFetch(
                `/admin/transactions?${params.toString()}`
            );

            setTransactions(data.transactions);
            setPagination(data.pagination);
        } finally {
            //setRefreshing(false);
        }
    }

    const handleStatusChange = (status: string) => {
        setSelectedStatus(status);
        setPage(1);
        fetchTransactions(status, 1);
    };

    const userStatuses = USER_STATUSES;

    async function fetchAdmin() {
        try {
            setRefreshingUsers(true);
            const data = await apiFetch("/auth/me");

            if (data.role !== "ADMIN") {
                router.replace("/dashboard");
                return;
            }

            setAdmin(data.user);
            setRole(data.role);
        } catch (err) {
            handleError(err, "Unable to connect to server.");
        } finally {
            setLoading(false);
            setRefreshingUsers(false);
        }
    }

    async function fetchCompanies(page: number = 1) {
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: "5"
            });

            const data = await apiFetch(`/admin/companies?${params.toString()}`);

            setCompanies(data.companies);
            setCompanyPagination(data.pagination);
        } catch (err) {
            handleError(err, "Failed to fetch companies.");
        }
    }

    async function createCompany() {
        try {
            await apiFetch("/admin/companies", {
                method: "POST",
                bodyData: {
                    ...newCompany,
                    indicativePrice: Number(newCompany.indicativePrice),
                    minQty: Number(newCompany.minQty)
                }
            });

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
        } catch (err) {
            handleError(err, "Unable to create company.");
        }
    }

    async function updateUserStatus(id: number, status: "ACTIVE" | "REJECTED") {
        const action = status === "ACTIVE" ? "APPROVE" : "REJECT";

        const confirmed = window.confirm(`Are you sure you want to ${action} this user?`);

        if (!confirmed)
            return;

        try {
            setProcessingId(id);

            await apiFetch(`/admin/users/${id}/status`, {
                method: "PATCH",
                bodyData: { status }
            });

            setShowUserModal(false);
            setSelectedUser(null);

            await fetchUsers();

            alert(`User ${status === "ACTIVE" ? "APPROVED" : "REJECTED"} successfully.`);
        } catch (err) {
            handleError(err, "Network error. Failed to update user status.");
        } finally {
            setProcessingId(null);
        }
    }

    async function updateCompanyStatus(companyCode: string, status: "ACTIVE" | "INACTIVE") {
        try {
            await apiFetch(`/admin/companies/${companyCode}/status`, {
                method: "PATCH",
                bodyData: { status }
            });
            fetchCompanies(companyPagination.page);
        } catch (err) {
            handleError(err, "Unable to update company status.");
        }
    }

    async function handleLogout() {
        try {
            await apiFetch("/auth/logout", { method: "POST" });
            router.push("/session-ended?reason=logout");
        } catch (err) {
            console.error("Logout failed:", err);
            // Optional: fallback to force client redirection anyway
            router.push("/session-ended?reason=logout");
        }
    }

    async function updateTransactionStatus(id: number, status: Transaction["status"]) {
        const confirmed = window.confirm(`Are you sure you want to mark this transaction as ${status.replaceAll("_", " ")}?`);
        if (!confirmed) return;

        try {
            setProcessingId(id);
            await apiFetch(`/admin/transactions/${id}`, {
                method: "PATCH",
                bodyData: { status }
            });
            fetchTransactions();
        } catch (err) {
            handleError(err, "Network error. Unable to update transaction status.");
        } finally {
            setProcessingId(null);
        }
    }

    function renderAction(transaction: Transaction) {
        switch (transaction.status) {
            case "PENDING":
                return (
                    <button
                        disabled={processingId === transaction.id}
                        className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-gray-400"
                        onClick={() => updateTransactionStatus(transaction.id, "UNDER_PROCESS")}
                    >
                        {processingId === transaction.id
                            ? "Processing..."
                            : "Start Processing"}
                    </button>
                );

            case "UNDER_PROCESS":
                return (
                    <div className="flex justify-center gap-2">
                        <button
                            disabled={processingId === transaction.id}
                            className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:bg-gray-400"
                            onClick={() => updateTransactionStatus(transaction.id, "REJECTED")}
                        >
                            {processingId === transaction.id ? "Processing..." : "Reject"}
                        </button>

                        <button
                            disabled={processingId === transaction.id}
                            className="rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:bg-gray-400"
                            onClick={() => updateTransactionStatus(transaction.id, "COMPLETED")}
                        >
                            {processingId === transaction.id ? "Processing..." : "Approve"}
                        </button>
                    </div>
                );

            case "COMPLETED":
                return (
                    <div className="flex justify-center gap-2">
                        <button
                            disabled
                            className="px-3 py-1 rounded text-white font-medium bg-green-500 cursor-not-allowed"
                        >
                            Completed
                        </button>
                    </div>
                );

            case "REJECTED":
                return (
                    <div className="flex justify-center gap-2">
                        <button
                            disabled
                            className="px-3 py-1 rounded text-white font-medium bg-red-500 cursor-not-allowed"
                        >
                            Rejected
                        </button>
                    </div>
                );

            case "CANCELLED":
                return (
                    <div className="flex justify-center gap-2">
                        <button
                            disabled
                            className="px-3 py-1 rounded text-white font-medium bg-gray-400 cursor-not-allowed"
                        >
                            Cancelled by Client
                        </button>
                    </div>
                );
        }
    }

    function formatDate(date: string) {
        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    }

    function getStatusBadge(status: string) {
        switch (status) {
            case "PENDING":
                return "inline-block rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700";

            case "UNDER_PROCESS":
                return "inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700";

            case "COMPLETED":
                return "inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700";

            case "REJECTED":
                return "inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700";

            case "CANCELLED":
                return "inline-block rounded-full bg-gray-200 px-3 py-1 text-xs font-semibold text-gray-700";

            default:
                return "inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700";
        }
    }

    function getUserStatusBadge(status: string) {
        switch (status) {
            case "PENDING":
                return "inline-block rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700";

            case "ACTIVE":
                return "inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700";

            case "REJECTED":
                return "inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700";

            case "INACTVE":
                return "inline-block rounded-full bg-gray-200 px-3 py-1 text-xs font-semibold text-gray-700";

            default:
                return "inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700";
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
            <main className="mx-auto max-w-7xl px-6 py-8">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold tracking-tight">
                        Admin Dashboard
                    </h2>

                    <p className="mt-2 text-slate-500">
                        Manage users, transactions and companies.
                    </p>
                </div>

                <div className="space-y-8">
                    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-2xl font-bold">
                                User Management
                            </h2>

                            <div className="flex items-center gap-3">
                                <button
                                    disabled={userPagination.page === 1}
                                    onClick={() =>
                                        fetchUsers(
                                            userPagination.page - 1,
                                            selectedUserStatus
                                        )
                                    }
                                    className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    ← Previous
                                </button>

                                <span className="text-sm font-medium text-slate-600">
                                    Page {userPagination.page} of {userPagination.totalPages}
                                </span>

                                <button
                                    disabled={
                                        userPagination.page === userPagination.totalPages
                                    }
                                    onClick={() =>
                                        fetchUsers(
                                            userPagination.page + 1,
                                            selectedUserStatus
                                        )
                                    }
                                    className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Next →
                                </button>

                                <button
                                    onClick={() =>
                                        fetchUsers(
                                            userPagination.page,
                                            selectedUserStatus
                                        )
                                    }
                                    disabled={refreshingUsers}
                                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-slate-400"
                                >
                                    Refresh
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-2 mb-4">
                            {userStatuses.map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setSelectedUserStatus(status)}
                                    className={`rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-wider transition ${selectedUserStatus === status
                                        ? "bg-blue-600 text-white"
                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                        }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>

                        {users.length === 0 ? (
                            <p className="text-sm text-slate-500">
                                No users.
                            </p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-semibold text-slate-600">
                                                Name
                                            </th>

                                            <th className="px-4 py-3 text-left font-semibold text-slate-600">
                                                Contact
                                            </th>

                                            <th className="px-4 py-3 text-center font-semibold text-slate-600">
                                                Status
                                            </th>

                                            <th className="px-4 py-3 text-center font-semibold text-slate-600">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {users.map((user) => (
                                            <tr
                                                key={user.id}
                                                className="border-t border-slate-200 transition-colors hover:bg-slate-50"
                                            >
                                                <td className="px-4 py-4">
                                                    <p className="font-semibold text-slate-900">
                                                        {user.name}
                                                    </p>
                                                </td>

                                                <td className="px-4 py-4">
                                                    <p className="text-sm text-slate-700">
                                                        {user.email}
                                                    </p>

                                                    <p className="text-xs text-slate-500">
                                                        {user.phoneNumber}
                                                    </p>
                                                </td>

                                                <td className="px-4 py-4 text-center">
                                                    <span className={getUserStatusBadge(user.status)}>
                                                        {user.status}
                                                    </span>
                                                </td>

                                                <td className="px-4 py-4">
                                                    <div className="flex justify-center gap-3">
                                                        <button
                                                            onClick={() => fetchUser(user.id)}
                                                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                                                        >
                                                            View & Verify
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>

                    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-2xl font-bold">
                                Transactions
                            </h2>

                            <div className="flex items-center gap-3">
                                <button
                                    disabled={pagination.page === 1}
                                    onClick={() =>
                                        fetchTransactions(selectedStatus, pagination.page - 1)
                                    }
                                    className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    ← Previous
                                </button>

                                <span className="text-sm font-medium text-slate-600">
                                    Page {pagination.page} of {pagination.totalPages}
                                </span>

                                <button
                                    disabled={
                                        pagination.page === pagination.totalPages
                                    }
                                    onClick={() =>
                                        fetchTransactions(selectedStatus, pagination.page + 1)
                                    }
                                    className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Next →
                                </button>

                                <button
                                    onClick={() => fetchTransactions(selectedStatus, pagination.page)}
                                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-slate-400"
                                >
                                    Refresh
                                </button>
                            </div>
                        </div>

                        <div className="mb-5 flex flex-wrap gap-2">
                            {[
                                "ALL",
                                "PENDING",
                                "UNDER_PROCESS",
                                "COMPLETED",
                                "REJECTED",
                                "CANCELLED",
                            ].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => handleStatusChange(status)}
                                    className={`rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-wider transition-colors ${selectedStatus === status
                                        ? "bg-blue-600 text-white"
                                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                        }`}
                                >
                                    {status.replaceAll("_", " ")}
                                </button>
                            ))}
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold text-slate-600">Client</th>
                                        <th className="px-4 py-3 font-semibold text-slate-600">Company</th>
                                        <th className="px-4 py-3 font-semibold text-slate-600">Type</th>
                                        <th className="px-4 py-3 font-semibold text-slate-600">Qty</th>
                                        <th className="px-4 py-3 font-semibold text-slate-600">Price</th>
                                        <th className="px-4 py-3 font-semibold text-slate-600">Total</th>
                                        <th className="px-4 py-3 font-semibold text-slate-600">Status</th>
                                        <th className="px-4 py-3 font-semibold text-slate-600">Created</th>
                                        <th className="px-4 py-2 text-center">Action</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {transactions.map((transaction) => (
                                        <tr
                                            key={transaction.id}
                                            className="border-t border-slate-200 hover:bg-slate-200 transition-colors"
                                        >
                                            <td className="px-4 py-3">
                                                <p className="font-semibold">
                                                    {transaction.user.name}
                                                </p>

                                                <p className="text-xs text-slate-500">
                                                    {transaction.user.email}
                                                </p>

                                                <p className="text-xs text-slate-500">
                                                    {transaction.user.phoneNumber}
                                                </p>
                                            </td>

                                            <td className="px-4 py-2">
                                                {transaction.company.companyName}
                                            </td>

                                            <td className="px-4 py-2">
                                                {transaction.type === 'BUY' ? (
                                                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                                                        BUY
                                                    </span>
                                                ) : (
                                                    <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                                                        SELL
                                                    </span>
                                                )}
                                            </td>


                                            <td className="px-4 py-2">
                                                {transaction.quantity.toLocaleString("en-IN")}
                                            </td>

                                            <td className="px-4 py-2">
                                                ₹{Number(transaction.priceAtOrder).toLocaleString("en-IN")}
                                            </td>

                                            <td className="px-4 py-2">
                                                ₹{Number(transaction.totalAmount).toLocaleString("en-IN")}
                                            </td>

                                            <td className="px-4 py-2">
                                                <span className={getStatusBadge(transaction.status)}>
                                                    {transaction.status.replaceAll("_", " ")}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2">
                                                {formatDate(transaction.createdAt)}
                                            </td>

                                            <td className="px-4 py-2 text-center">
                                                {renderAction(transaction)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Page navigation */}
                            <div className="mt-6 flex items-center justify-between">
                                <p className="text-sm text-slate-600">
                                    Page {pagination.page} of {pagination.totalPages}
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                        <div className="mb-5 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-slate-900">
                                Company Management
                            </h3>

                            <div className="flex items-center gap-3">
                                <button
                                    disabled={companyPagination.page === 1}
                                    onClick={() =>
                                        fetchCompanies(companyPagination.page - 1)
                                    }
                                    className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    ← Previous
                                </button>

                                <span className="text-sm font-medium text-slate-600">
                                    Page {companyPagination.page} of {companyPagination.totalPages}
                                </span>

                                <button
                                    disabled={
                                        companyPagination.page === companyPagination.totalPages
                                    }
                                    onClick={() =>
                                        fetchCompanies(companyPagination.page + 1)
                                    }
                                    className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Next →
                                </button>
                            </div>
                        </div>

                        {
                            companies.length === 0 ? (
                                <p className="text-sm text-slate-500">
                                    No companies added.
                                </p>
                            ) : (
                                <div className="overflow-x-auto">

                                    <table className="w-full border-collapse">

                                        <thead className="bg-slate-50">
                                            <tr className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
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
                                                            ₹{company.indicativePrice.toLocaleString("en-IN")}
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

                    </section>

                    {/* Add Company Section */}
                    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                        <div className="pt-2">

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

                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={createCompany}
                                    className="rounded-lg bg-blue-600 px-6 py-2.5 font-medium text-white hover:bg-blue-700"
                                >
                                    Add Company
                                </button>
                            </div>

                        </div>
                    </section>
                </div>
            </main>

            {showUserModal && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
                    <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-8 shadow-xl">

                        <div className="mb-8 flex items-center justify-between">
                            <h2 className="text-2xl font-bold">
                                Verify User
                            </h2>

                            <button
                                onClick={() => {
                                    setShowUserModal(false);
                                    setSelectedUser(null);
                                }}
                                className="text-3xl text-slate-500 hover:text-black"
                            >
                                ×
                            </button>
                        </div>

                        {/* Personal Information */}

                        <div className="mb-8">
                            <h3 className="mb-4 text-lg font-semibold">
                                Personal Information
                            </h3>

                            <div className="grid grid-cols-2 gap-4">

                                <input
                                    value={selectedUser.name}
                                    placeholder="Enter Name"
                                    onChange={(e) =>
                                        setSelectedUser({
                                            ...selectedUser,
                                            name: e.target.value,
                                        })
                                    }
                                    className="rounded border p-2"
                                />

                                <input
                                    value={selectedUser.phoneNumber}
                                    placeholder="Enter Phone"
                                    onChange={(e) =>
                                        setSelectedUser({
                                            ...selectedUser,
                                            phoneNumber: e.target.value,
                                        })
                                    }
                                    className="rounded border p-2"
                                />

                                <input
                                    value={selectedUser.email}
                                    placeholder="Enter Email"
                                    onChange={(e) =>
                                        setSelectedUser({
                                            ...selectedUser,
                                            email: e.target.value,
                                        })
                                    }
                                    className="col-span-2 rounded border p-2"
                                />

                            </div>
                        </div>

                        {/* KYC */}

                        <div className="mb-8">
                            <h3 className="mb-4 text-lg font-semibold">
                                KYC Details
                            </h3>

                            <div className="grid grid-cols-2 gap-4">

                                <input
                                    value={selectedUser.panNumber ?? ""}
                                    placeholder="Enter PAN"
                                    onChange={(e) =>
                                        setSelectedUser({
                                            ...selectedUser,
                                            panNumber: e.target.value.toUpperCase(),
                                        })
                                    }
                                    className="rounded border p-2"
                                />

                                <input
                                    value={selectedUser.dematClientId ?? ""}
                                    placeholder="Enter Demat Client ID"
                                    onChange={(e) =>
                                        setSelectedUser({
                                            ...selectedUser,
                                            dematClientId: e.target.value.toUpperCase(),
                                        })
                                    }
                                    className="rounded border p-2"
                                />

                                <input
                                    value={selectedUser.dematDpId ?? ""}
                                    placeholder="Enter Demat DP ID"
                                    onChange={(e) =>
                                        setSelectedUser({
                                            ...selectedUser,
                                            dematDpId: e.target.value.toUpperCase(),
                                        })
                                    }
                                    className="col-span-2 rounded border p-2"
                                />

                            </div>
                        </div>

                        {/* Bank */}

                        <div className="mb-8">
                            <h3 className="mb-4 text-lg font-semibold">
                                Bank Details
                            </h3>

                            <div className="grid grid-cols-3 gap-4">

                                <input
                                    value={selectedUser.bankAccountNo ?? ""}
                                    placeholder="Enter Bank Account Number"
                                    onChange={(e) =>
                                        setSelectedUser({
                                            ...selectedUser,
                                            bankAccountNo: e.target.value,
                                        })
                                    }
                                    className="rounded border p-2"
                                />

                                <input
                                    value={selectedUser.ifscCode ?? ""}
                                    placeholder="Enter IFSC"
                                    onChange={(e) =>
                                        setSelectedUser({
                                            ...selectedUser,
                                            ifscCode: e.target.value.toUpperCase(),
                                        })
                                    }
                                    className="rounded border p-2"
                                />

                                <input
                                    value={selectedUser.bankName ?? ""}
                                    placeholder="Enter Bank Number"
                                    onChange={(e) =>
                                        setSelectedUser({
                                            ...selectedUser,
                                            bankName: e.target.value,
                                        })
                                    }
                                    className="rounded border p-2"
                                />

                            </div>
                        </div>

                        <div className="flex justify-between">

                            <button
                                onClick={saveUser}
                                disabled={savingUser}
                                className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
                            >
                                {savingUser ? "Saving..." : "Save Changes"}
                            </button>

                            <div className="flex gap-3">

                                <button
                                    onClick={() =>
                                        updateUserStatus(selectedUser.id, "ACTIVE")
                                    }
                                    className="rounded-lg bg-green-600 px-6 py-2 text-white hover:bg-green-700"
                                >
                                    Approve
                                </button>

                                <button
                                    onClick={() =>
                                        updateUserStatus(selectedUser.id, "REJECTED")
                                    }
                                    className="rounded-lg bg-red-600 px-6 py-2 text-white hover:bg-red-700"
                                >
                                    Reject
                                </button>

                            </div>

                        </div>

                    </div>
                </div>
            )}

        </div>
    );
}