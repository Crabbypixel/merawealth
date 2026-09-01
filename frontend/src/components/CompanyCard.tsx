"use client";

import Link from "next/link";

type CompanyCardProps = {
    logo: string;
    companyCode: string;
    companyName: string;
    companyUrl: string;
    description: string;
    indicativePrice: number;
    minQty: number;
};

export default function CompanyCard({
    logo,
    companyCode,
    companyName,
    companyUrl,
    description,
    indicativePrice,
    minQty,
}: CompanyCardProps) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
            <div className="flex gap-6">

                <img
                    src={logo}
                    alt={companyName}
                    className="h-20 w-20 rounded-lg object-contain"
                />

                <div className="flex-1">

                    <h2 className="text-3xl font-bold text-slate-900">
                        {companyName}
                    </h2>

                    <p className="mt-3 text-slate-600">
                        {description}
                    </p>

                    <div className="mt-5 flex gap-10">

                        <div>
                            <p className="text-sm text-slate-500">
                                Indicative Price
                            </p>

                            <p className="text-xl font-bold text-blue-600">
                                ₹{indicativePrice.toLocaleString()}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-slate-500">
                                Minimum Quantity
                            </p>

                            <p className="text-xl font-bold text-slate-800">
                                {minQty} Shares
                            </p>
                        </div>

                    </div>

                    <Link
                        href={companyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-2 text-white transition hover:bg-blue-700"
                    >
                        Visit Site
                    </Link>

                </div>

            </div>
        </div>
    );
}