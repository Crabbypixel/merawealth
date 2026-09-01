export default function DisclaimerPage() {
    return (
        <main className="min-h-screen bg-slate-50">
            <section className="mx-auto max-w-5xl px-6 py-12 sm:py-16">

                {/* Header */}
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-slate-900 sm:text-5xl">
                        Disclaimer
                    </h1>

                    <p className="mt-4 text-lg text-slate-600">
                        Important information regarding investments made through
                        MeraWealth.
                    </p>
                </div>

                <div className="mt-12 space-y-8">

                    {/* General Disclaimer */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                        <p className="leading-8 text-slate-600">
                            The information provided on{" "}
                            <strong className="font-semibold text-slate-900">
                                MeraWealth
                            </strong>{" "}
                            is intended for general informational purposes only and
                            should not be construed as investment, financial, legal
                            or tax advice.
                        </p>

                        <p className="mt-5 leading-8 text-slate-600">
                            Investments in securities and financial products are
                            subject to risks. The value of investments may go up or
                            down, and investors may lose part or all of their
                            invested capital.
                        </p>
                    </div>

                    {/* Unlisted Shares */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                        <h2 className="text-2xl font-bold text-slate-900">
                            Unlisted Shares
                        </h2>

                        <p className="mt-5 leading-8 text-slate-600">
                            Unlisted shares may involve{" "}
                            <strong className="font-semibold text-slate-900">
                                higher liquidity risk, valuation uncertainty and
                                limited price discovery
                            </strong>{" "}
                            compared with securities traded on recognised stock
                            exchanges. There may be no assurance regarding future
                            listing, valuation or availability of buyers.
                        </p>
                    </div>

                    {/* Mutual Funds */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                        <h2 className="text-2xl font-bold text-slate-900">
                            Mutual Funds
                        </h2>

                        <p className="mt-5 leading-8 text-slate-600">
                            Mutual fund investments are subject to market risks.
                            Investors should read the relevant scheme information
                            and other applicable documents carefully before
                            investing.
                        </p>
                    </div>

                    {/* FDRs and Bonds */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                        <h2 className="text-2xl font-bold text-slate-900">
                            FDRs and Bonds
                        </h2>

                        <p className="mt-5 leading-8 text-slate-600">
                            Fixed-income products are subject to risks including{" "}
                            <strong className="font-semibold text-slate-900">
                                credit risk, interest-rate risk, liquidity risk and
                                issuer-related risks
                            </strong>
                            . The return of principal or interest depends on the
                            terms of the product and the obligations of the
                            respective issuer.
                        </p>
                    </div>

                    {/* Additional Information */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                        <p className="leading-8 text-slate-600">
                            Information such as prices, returns, availability,
                            company details and other product information may change
                            from time to time. Past performance or indicative
                            pricing should not be considered a guarantee of future
                            performance.
                        </p>

                        <p className="mt-5 leading-8 text-slate-600">
                            Investors should conduct their own due diligence and,
                            where appropriate, consult a qualified financial, legal
                            or tax professional before making an investment
                            decision.
                        </p>
                    </div>

                    {/* Final Disclaimer */}
                    <div className="rounded-2xl border border-orange-200 bg-orange-50 p-6 sm:p-8">
                        <p className="leading-7 text-orange-900">
                            <strong className="font-bold">
                                MeraWealth does not guarantee any return or profit
                                from any investment.
                            </strong>
                        </p>
                    </div>

                </div>

            </section>
        </main>
    );
}