export default function AboutUsPage() {
    return (
        <main className="min-h-screen bg-slate-50">
            <section className="mx-auto max-w-5xl px-6 py-12 sm:py-16">

                {/* Header */}
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-slate-900 sm:text-5xl">
                        About MeraWealth
                    </h1>

                    <p className="mt-4 text-lg text-slate-600">
                        A simple and transparent platform for exploring investment
                        opportunities.
                    </p>
                </div>

                {/* About */}
                <div className="mt-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                    <h2 className="text-2xl font-bold text-slate-900">
                        About MeraWealth
                    </h2>

                    <div className="mt-6 space-y-5 leading-8 text-slate-600">
                        <p>
                            <strong className="font-semibold text-slate-900">
                                MeraWealth
                            </strong>{" "}
                            is an investment platform focused on providing investors
                            access to a range of investment opportunities across{" "}
                            <strong className="font-semibold text-slate-900">
                                Unlisted Shares, Mutual Funds, Fixed Deposits/Receipts
                                (FDRs), Bonds and other financial products
                            </strong>
                            .
                        </p>

                        <p>
                            Our objective is to provide a simple, transparent and
                            convenient platform through which investors can explore
                            available investment opportunities and complete
                            transactions through a structured process.
                        </p>

                        <p>
                            We believe that investors should have access to relevant
                            information and understand the features, risks and
                            applicable terms of an investment before making an
                            investment decision.
                        </p>

                        <p>
                            MeraWealth is committed to maintaining transparency,
                            providing timely information and following applicable
                            regulatory and compliance requirements.
                        </p>
                    </div>
                </div>

                {/* Our Approach */}
                <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                    <h2 className="text-2xl font-bold text-slate-900">
                        Our Approach
                    </h2>

                    <ul className="mt-6 space-y-4 text-slate-600">
                        <li className="flex gap-3">
                            <span className="font-semibold text-blue-600">•</span>
                            <span>
                                Simple and transparent investment process
                            </span>
                        </li>

                        <li className="flex gap-3">
                            <span className="font-semibold text-blue-600">•</span>
                            <span>
                                Access to selected investment opportunities
                            </span>
                        </li>

                        <li className="flex gap-3">
                            <span className="font-semibold text-blue-600">•</span>
                            <span>
                                Proper verification and documentation
                            </span>
                        </li>

                        <li className="flex gap-3">
                            <span className="font-semibold text-blue-600">•</span>
                            <span>
                                Secure handling of customer information
                            </span>
                        </li>

                        <li className="flex gap-3">
                            <span className="font-semibold text-blue-600">•</span>
                            <span>
                                Timely transaction notifications
                            </span>
                        </li>

                        <li className="flex gap-3">
                            <span className="font-semibold text-blue-600">•</span>
                            <span>
                                Focus on responsible investing
                            </span>
                        </li>
                    </ul>
                </div>

                {/* Disclaimer */}
                <div className="mt-8 rounded-2xl border border-orange-200 bg-orange-50 p-6 sm:p-8">
                    <p className="leading-7 text-orange-900">
                        <strong className="font-bold">
                            MeraWealth does not guarantee returns on any investment.
                        </strong>{" "}
                        Investors should independently evaluate the suitability and
                        risks of an investment before investing.
                    </p>
                </div>

            </section>
        </main>
    );
}