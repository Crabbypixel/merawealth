export default function ServicesPage() {
    return (
        <main className="min-h-screen bg-slate-50">
            <section className="mx-auto max-w-5xl px-6 py-12 sm:py-16">

                {/* Header */}
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-slate-900 sm:text-5xl">
                        Services
                    </h1>

                    <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-600">
                        At{" "}
                        <strong className="font-semibold text-slate-900">
                            MeraWealth
                        </strong>
                        , we provide access to a range of investment products and
                        opportunities, with a focus on making the investment process
                        simple, transparent and convenient.
                    </p>
                </div>

                {/* Unlisted Shares */}
                <div className="mt-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                    <h2 className="text-2xl font-bold text-slate-900">
                        1. Unlisted Shares
                    </h2>

                    <div className="mt-5 space-y-5 leading-8 text-slate-600">
                        <p>
                            MeraWealth provides opportunities to{" "}
                            <strong className="font-semibold text-slate-900">
                                buy and sell selected unlisted and pre-IPO shares
                            </strong>
                            .
                        </p>

                        <p>
                            Unlisted shares are securities that are not currently
                            traded on recognised stock exchanges. Investors can
                            explore available opportunities, review relevant
                            information and place their orders through our platform.
                        </p>

                        <p>
                            <strong className="font-semibold text-slate-900">
                                All transactions in unlisted shares are off-market
                                transactions.
                            </strong>
                        </p>

                        <p>
                            Unlisted investments may involve risks including liquidity
                            risk, valuation uncertainty and limited price discovery.
                            Investors should carefully evaluate the investment before
                            making a decision.
                        </p>
                    </div>
                </div>

                {/* Mutual Funds */}
                <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                    <h2 className="text-2xl font-bold text-slate-900">
                        2. Mutual Funds
                    </h2>

                    <div className="mt-5 space-y-5 leading-8 text-slate-600">
                        <p>
                            MeraWealth is a{" "}
                            <strong className="font-semibold text-slate-900">
                                Mutual Fund Distributor
                            </strong>{" "}
                            and facilitates investment in mutual fund schemes
                            offered by Asset Management Companies (AMCs) with which
                            we are associated or empanelled.
                        </p>

                        <p>
                            Investors can explore available mutual fund schemes and
                            complete their investment transactions through our
                            platform, subject to applicable KYC and other
                            requirements.
                        </p>

                        <p>
                            <strong className="font-semibold text-slate-900">
                                Mutual Fund investments are subject to market risks.
                                Read all scheme-related documents carefully before
                                investing.
                            </strong>
                        </p>
                    </div>
                </div>

                {/* FDR */}
                <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                    <h2 className="text-2xl font-bold text-slate-900">
                        3. Fixed Deposit Receipts (FDR)
                    </h2>

                    <div className="mt-5 space-y-5 leading-8 text-slate-600">
                        <p>
                            MeraWealth provides access to selected{" "}
                            <strong className="font-semibold text-slate-900">
                                Fixed Deposit / Fixed Deposit Receipt (FDR)
                            </strong>{" "}
                            investment opportunities offered by eligible
                            institutions.
                        </p>

                        <p>
                            Investors can review the applicable tenure, interest
                            rate, terms and conditions before making an investment.
                        </p>

                        <p>
                            The applicable terms, returns and repayment are subject
                            to the terms of the respective issuer/institution.
                        </p>
                    </div>
                </div>

                {/* Bonds */}
                <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                    <h2 className="text-2xl font-bold text-slate-900">
                        4. Bonds
                    </h2>

                    <div className="mt-5 space-y-5 leading-8 text-slate-600">
                        <p>
                            MeraWealth provides access to selected{" "}
                            <strong className="font-semibold text-slate-900">
                                Bonds and fixed-income investment opportunities
                            </strong>
                            .
                        </p>

                        <p>
                            Investors can explore available bond offerings and review
                            relevant information relating to the issuer, tenure,
                            interest rate, maturity and other applicable terms before
                            investing.
                        </p>

                        <p>
                            Investments in bonds are subject to various risks,
                            including credit risk, interest-rate risk and liquidity
                            risk.
                        </p>
                    </div>
                </div>

                {/* Our Commitment */}
                <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                    <h2 className="text-2xl font-bold text-slate-900">
                        Our Commitment
                    </h2>

                    <div className="mt-5 space-y-5 leading-8 text-slate-600">
                        <p>
                            We aim to provide a{" "}
                            <strong className="font-semibold text-slate-900">
                                simple, transparent and convenient investment
                                experience
                            </strong>{" "}
                            while ensuring that relevant product information and
                            applicable terms are made available to investors.
                        </p>

                        <p>
                            We encourage investors to understand the features and
                            risks associated with each product before making an
                            investment decision.
                        </p>

                        <p>
                            <strong className="font-bold text-slate-900">
                                MeraWealth does not guarantee any return or profit on
                                investments.
                            </strong>
                        </p>
                    </div>
                </div>

            </section>
        </main>
    );
}