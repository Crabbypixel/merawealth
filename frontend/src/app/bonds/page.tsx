import { Inter } from "next/font/google";

const inter = Inter({
    subsets: ["latin"],
});

export default function BondsPage() {
    return (
        <main className={`${inter.className} min-h-screen bg-gray-50`}>
            <section className="mx-auto max-w-7xl px-6 py-12">

                {/* Hero Images */}
                <div className="flex flex-col gap-6 md:flex-row md:justify-center">
                    <img
                        src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/public/rbi_bonds.jpeg`}
                        alt="RBI Bonds"
                        className="w-full rounded-2xl shadow-xl md:w-1/2"
                    />

                    <img
                        src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/public/bonds.png`}
                        alt="Corporate Bonds"
                        className="w-full rounded-2xl shadow-xl md:w-1/2"
                    />
                </div>

                {/* Hero */}
                <div className="mt-12 text-center">
                    <h1 className="text-5xl font-extrabold tracking-tight text-gray-950">
                        Bonds – Stable Income. Structured Growth.
                    </h1>

                    <p className="mx-auto mt-6 max-w-4xl text-lg leading-8 text-gray-700">
                        Bonds are fixed-income investment instruments that provide
                        predictable interest payments and defined maturity dates. Whether
                        issued by the Government of India or leading corporations, bonds
                        help investors preserve capital while generating stable and
                        reliable income.
                    </p>
                </div>

                {/* Bond Types */}
                <section className="mt-20">
                    <h2 className="mb-10 text-center text-3xl font-bold tracking-tight text-gray-900">
                        Choose the Right Bond for Your Investment Goals
                    </h2>

                    <div className="grid gap-8 lg:grid-cols-2">

                        {/* Government Bonds */}
                        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition hover:shadow-md">
                            <h3 className="mb-4 text-2xl font-bold text-gray-900">
                                Government & RBI Bonds
                            </h3>

                            <p className="leading-7 text-gray-700">
                                Government bonds are issued by the Government of India and are
                                among the safest investment options available. They are ideal
                                for investors seeking capital protection and consistent returns
                                with minimal risk.
                            </p>

                            <ul className="mt-6 space-y-3 text-gray-800">
                                <li>• Backed by Government credibility</li>
                                <li>• Fixed interest payouts</li>
                                <li>• Very low investment risk</li>
                                <li>• Long-term wealth preservation</li>
                                <li>• Stable and predictable returns</li>
                            </ul>
                        </div>

                        {/* Corporate Bonds */}
                        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition hover:shadow-md">
                            <h3 className="mb-4 text-2xl font-bold text-gray-900">
                                Corporate Bonds
                            </h3>

                            <p className="leading-7 text-gray-700">
                                Corporate bonds are issued by companies to raise capital. They
                                generally offer higher interest rates than government
                                securities while carrying varying levels of credit risk
                                depending on the issuer.
                            </p>

                            <ul className="mt-6 space-y-3 text-gray-800">
                                <li>• Attractive interest rates</li>
                                <li>• Regular coupon payments</li>
                                <li>• Diversification from equities</li>
                                <li>• Multiple maturity options</li>
                                <li>• Suitable for income-focused investors</li>
                            </ul>
                        </div>

                    </div>
                </section>

                {/* How It Works */}
                <section className="mt-20">
                    <h2 className="mb-10 text-center text-3xl font-bold tracking-tight text-gray-900">
                        How Bonds Work
                    </h2>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">

                        <div className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm transition hover:shadow-md">
                            <div className="mb-4 text-3xl font-bold text-amber-600">
                                1
                            </div>

                            <h3 className="text-lg font-semibold text-gray-900">
                                Invest
                            </h3>

                            <p className="mt-2 leading-7 text-gray-700">
                                Purchase bonds by investing your desired amount.
                            </p>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm transition hover:shadow-md">
                            <div className="mb-4 text-3xl font-bold text-amber-600">
                                2
                            </div>

                            <h3 className="text-lg font-semibold text-gray-900">
                                Earn Interest
                            </h3>

                            <p className="mt-2 leading-7 text-gray-700">
                                Receive periodic coupon payments throughout the tenure.
                            </p>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm transition hover:shadow-md">
                            <div className="mb-4 text-3xl font-bold text-amber-600">
                                3
                            </div>

                            <h3 className="text-lg font-semibold text-gray-900">
                                Hold to Maturity
                            </h3>

                            <p className="mt-2 leading-7 text-gray-700">
                                Continue earning stable returns until maturity.
                            </p>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm transition hover:shadow-md">
                            <div className="mb-4 text-3xl font-bold text-amber-600">
                                4
                            </div>

                            <h3 className="text-lg font-semibold text-gray-900">
                                Receive Principal
                            </h3>

                            <p className="mt-2 leading-7 text-gray-700">
                                Get your invested capital back upon maturity.
                            </p>
                        </div>

                    </div>
                </section>

                {/* Comparison */}
                <section className="mt-20">
                    <h2 className="mb-10 text-center text-3xl font-bold tracking-tight text-gray-900">
                        RBI Bonds vs Corporate Bonds
                    </h2>

                    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                        <table className="w-full text-left">
                            <thead className="bg-gray-100 text-gray-900">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Feature</th>
                                    <th className="px-6 py-4 font-semibold">
                                        Government / RBI Bonds
                                    </th>
                                    <th className="px-6 py-4 font-semibold">
                                        Corporate Bonds
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-200 text-gray-700">
                                <tr>
                                    <td className="px-6 py-4 font-semibold text-gray-900">
                                        Risk
                                    </td>
                                    <td className="px-6 py-4">Very Low</td>
                                    <td className="px-6 py-4">Low to Moderate</td>
                                </tr>

                                <tr>
                                    <td className="px-6 py-4 font-semibold text-gray-900">
                                        Returns
                                    </td>
                                    <td className="px-6 py-4">Moderate</td>
                                    <td className="px-6 py-4">Moderate to High</td>
                                </tr>

                                <tr>
                                    <td className="px-6 py-4 font-semibold text-gray-900">
                                        Issuer
                                    </td>
                                    <td className="px-6 py-4">Government of India</td>
                                    <td className="px-6 py-4">Corporate Entities</td>
                                </tr>

                                <tr>
                                    <td className="px-6 py-4 font-semibold text-gray-900">
                                        Stability
                                    </td>
                                    <td className="px-6 py-4">High</td>
                                    <td className="px-6 py-4">
                                        Depends on Credit Rating
                                    </td>
                                </tr>

                                <tr>
                                    <td className="px-6 py-4 font-semibold text-gray-900">
                                        Suitable For
                                    </td>
                                    <td className="px-6 py-4">
                                        Conservative Investors
                                    </td>
                                    <td className="px-6 py-4">
                                        Investors Seeking Higher Yield
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Investors */}
                <section className="mt-20">
                    <h2 className="mb-10 text-center text-3xl font-bold tracking-tight text-gray-900">
                        Who Should Invest in Bonds?
                    </h2>

                    <div className="mx-auto max-w-5xl rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
                        <ul className="grid gap-4 text-lg text-gray-800 md:grid-cols-2">
                            <li>• Investors seeking stable income</li>
                            <li>• Retirees requiring regular cash flow</li>
                            <li>• Conservative investors</li>
                            <li>• Portfolio diversification</li>
                            <li>• Investors reducing equity exposure</li>
                            <li>• Long-term wealth builders</li>
                        </ul>
                    </div>
                </section>

                {/* Why MeraWealth */}
                <section className="mt-20 rounded-2xl border border-orange-100 bg-orange-50 p-10">
                    <h2 className="mb-8 text-center text-3xl font-bold tracking-tight text-gray-900">
                        Why Invest Through MeraWealth?
                    </h2>

                    <div className="grid gap-6 md:grid-cols-2">

                        <div className="rounded-xl bg-white p-6 text-gray-800 shadow-sm">
                            Compare Government and Corporate bond opportunities.
                        </div>

                        <div className="rounded-xl bg-white p-6 text-gray-800 shadow-sm">
                            Understand credit ratings and issuer quality.
                        </div>

                        <div className="rounded-xl bg-white p-6 text-gray-800 shadow-sm">
                            Evaluate risk and expected returns with clarity.
                        </div>

                        <div className="rounded-xl bg-white p-6 text-gray-800 shadow-sm">
                            Invest confidently with complete transparency.
                        </div>

                    </div>
                </section>

                {/* CTA */}
                <section className="mt-20 rounded-2xl bg-gray-950 px-8 py-14 text-center text-white">
                    <h2 className="text-4xl font-extrabold tracking-tight">
                        Build Stability into Your Portfolio
                    </h2>

                    <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-gray-200">
                        Bonds provide dependable income, preserve capital, and help balance
                        your investment portfolio. Start investing through MeraWealth and
                        take a disciplined approach toward long-term financial growth.
                    </p>
                </section>

            </section>
        </main>
    );
}