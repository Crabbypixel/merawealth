import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function MutualFundsPage() {
    return (
        <main className={`${inter.className} min-h-screen bg-gray-50`}>
            <section className="mx-auto max-w-7xl px-6 py-12">

                {/* Hero Image */}
                <div className="flex justify-center">
                    <img
                        src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/public/mutual_funds.png`}
                        alt="Mutual Funds"
                        className="rounded-2xl shadow-lg max-w-full h-auto"
                    />
                </div>

                {/* Hero */}
                <div className="mt-10 text-center">
                    <h1 className="text-4xl font-extrabold text-gray-900">
                        Mutual Funds – Smart Investing Made Simple
                    </h1>

                    <p className="mx-auto mt-6 max-w-4xl text-lg leading-8 text-gray-700">
                        Mutual Funds offer a convenient and professionally managed way
                        to build long-term wealth. Your investment is pooled with other
                        investors and diversified across equities, debt, or other asset
                        classes, helping reduce risk while maximizing growth potential.
                    </p>
                </div>

                {/* Why Invest */}
                <section className="mt-16">
                    <h2 className="mb-8 text-center text-3xl font-extrabold text-gray-900">
                        Why Invest in Mutual Funds?
                    </h2>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">

                        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
                            <h3 className="mb-3 text-lg font-semibold text-gray-900">
                                Professional Management
                            </h3>

                            <p className="text-gray-700">
                                Experienced fund managers make investment decisions on
                                your behalf.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
                            <h3 className="mb-3 text-lg font-semibold text-gray-900">
                                Diversification
                            </h3>

                            <p className="text-gray-700">
                                Spread investments across multiple assets to reduce
                                overall risk.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
                            <h3 className="mb-3 text-lg font-semibold text-gray-900">
                                Beginner Friendly
                            </h3>

                            <p className="text-gray-700">
                                Suitable for both first-time and experienced investors.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
                            <h3 className="mb-3 text-lg font-semibold text-gray-900">
                                SIP Available
                            </h3>

                            <p className="text-gray-700">
                                Start investing with small monthly contributions.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
                            <h3 className="mb-3 text-lg font-semibold text-gray-900">
                                Flexible Investing
                            </h3>

                            <p className="text-gray-700">
                                Invest through SIPs or one-time lump sum investments.
                            </p>
                        </div>

                    </div>
                </section>

                {/* How It Works */}
                <section className="mt-20">
                    <h2 className="mb-8 text-center text-3xl font-extrabold text-gray-900">
                        How Mutual Funds Work
                    </h2>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">

                        <div className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm transition hover:shadow-md">
                            <div className="mb-4 text-3xl font-extrabold text-amber-600">
                                1
                            </div>

                            <h3 className="font-semibold text-gray-900">
                                Invest
                            </h3>

                            <p className="mt-2 text-gray-700">
                                Start with a lump sum or monthly SIP.
                            </p>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm transition hover:shadow-md">
                            <div className="mb-4 text-3xl font-extrabold text-amber-600">
                                2
                            </div>

                            <h3 className="font-semibold text-gray-900">
                                Pooling
                            </h3>

                            <p className="mt-2 text-gray-700">
                                Your investment is combined with other investors' funds.
                            </p>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm transition hover:shadow-md">
                            <div className="mb-4 text-3xl font-extrabold text-amber-600">
                                3
                            </div>

                            <h3 className="font-semibold text-gray-900">
                                Professional Investing
                            </h3>

                            <p className="mt-2 text-gray-700">
                                Fund managers invest across diversified assets.
                            </p>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm transition hover:shadow-md">
                            <div className="mb-4 text-3xl font-extrabold text-amber-600">
                                4
                            </div>

                            <h3 className="font-semibold text-gray-900">
                                Wealth Growth
                            </h3>

                            <p className="mt-2 text-gray-700">
                                Returns grow based on the fund's market performance.
                            </p>
                        </div>

                    </div>
                </section>

                {/* Types */}
                <section className="mt-20">
                    <h2 className="mb-8 text-center text-3xl font-extrabold text-gray-900">
                        Types of Mutual Funds
                    </h2>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">

                        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
                            <h3 className="mb-4 text-xl font-semibold text-gray-900">
                                Equity Funds
                            </h3>

                            <ul className="space-y-2 text-gray-700">
                                <li>• Invest primarily in stocks</li>
                                <li>• Higher growth potential</li>
                                <li>• Ideal for long-term investing</li>
                            </ul>
                        </div>

                        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
                            <h3 className="mb-4 text-xl font-semibold text-gray-900">
                                Debt Funds
                            </h3>

                            <ul className="space-y-2 text-gray-700">
                                <li>• Invest in bonds and debt securities</li>
                                <li>• Lower investment risk</li>
                                <li>• Suitable for stable returns</li>
                            </ul>
                        </div>

                        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
                            <h3 className="mb-4 text-xl font-semibold text-gray-900">
                                Hybrid Funds
                            </h3>

                            <ul className="space-y-2 text-gray-700">
                                <li>• Combination of equity and debt</li>
                                <li>• Balanced risk and reward</li>
                                <li>• Diversified investment approach</li>
                            </ul>
                        </div>

                        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
                            <h3 className="mb-4 text-xl font-semibold text-gray-900">
                                SIP
                            </h3>

                            <ul className="space-y-2 text-gray-700">
                                <li>• Invest monthly</li>
                                <li>• Build wealth gradually</li>
                                <li>• Reduce market timing risk</li>
                            </ul>
                        </div>

                    </div>
                </section>

                {/* Benefits */}
                <section className="mt-20 rounded-2xl border border-gray-200 bg-white p-10 shadow-sm transition hover:shadow-md">
                    <h2 className="mb-8 text-center text-3xl font-extrabold text-gray-900">
                        Why Choose Mutual Funds?
                    </h2>

                    <div className="grid gap-6 text-lg font-medium text-gray-800 md:grid-cols-2">
                        <div>• Long-term wealth creation</div>
                        <div>• Potential to beat inflation</div>
                        <div>• Flexible withdrawal options</div>
                        <div>• Tax-saving opportunities through ELSS</div>
                        <div>• Goal-based financial planning</div>
                        <div>• Suitable for investors at every stage</div>
                    </div>
                </section>

                {/* Investors */}
                <section className="mt-20">
                    <h2 className="mb-8 text-center text-3xl font-extrabold text-gray-900">
                        Who Should Invest?
                    </h2>

                    <div className="mx-auto max-w-5xl rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition hover:shadow-md">
                        <ul className="grid gap-4 text-lg text-gray-800 md:grid-cols-2">
                            <li>• First-time investors</li>
                            <li>• Young professionals</li>
                            <li>• Long-term wealth builders</li>
                            <li>• Goal-based investors</li>
                            <li>• Retirement planners</li>
                            <li>• Investors seeking diversified growth</li>
                        </ul>
                    </div>
                </section>

                {/* Why MeraWealth */}
                <section className="mt-20 rounded-2xl border border-orange-100 bg-orange-50 p-10">
                    <h2 className="mb-8 text-center text-3xl font-extrabold text-gray-900">
                        Why Invest Through MeraWealth?
                    </h2>

                    <div className="grid gap-6 md:grid-cols-2">

                        <div className="rounded-xl bg-white p-6 text-gray-800 font-medium shadow-sm transition hover:shadow-md">
                            Compare top-performing mutual funds.
                        </div>

                        <div className="rounded-xl bg-white p-6 text-gray-800 font-medium shadow-sm transition hover:shadow-md">
                            Select investments aligned with your financial goals.
                        </div>

                        <div className="rounded-xl bg-white p-6 text-gray-800 font-medium shadow-sm transition hover:shadow-md">
                            Understand risk profiles before investing.
                        </div>

                        <div className="rounded-xl bg-white p-6 text-gray-800 font-medium shadow-sm transition hover:shadow-md">
                            Invest through SIP or lump sum with ease.
                        </div>

                        <div className="rounded-xl bg-white p-6 text-gray-800 font-medium shadow-sm transition hover:shadow-md md:col-span-2">
                            Track and manage your investments through a transparent,
                            user-friendly platform.
                        </div>

                    </div>
                </section>

                {/* CTA */}
                <section className="mt-20 rounded-2xl bg-gray-950 px-8 py-14 text-center text-white">
                    <h2 className="text-4xl font-extrabold">
                        Start Your Investment Journey Today
                    </h2>

                    <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-gray-200">
                        Put your money to work with professionally managed mutual funds.
                        Build wealth systematically, stay invested with confidence, and
                        move closer to achieving your long-term financial goals.
                    </p>
                </section>

            </section>
        </main>
    );
}