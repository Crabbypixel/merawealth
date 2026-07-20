export default function Footer() {
    return (
        <footer className="border-t border-slate-200 bg-slate-50">

            <div className="mx-auto max-w-7xl px-6 py-14">

                {/* Intro */}
                <div className="mx-auto mb-12 max-w-4xl text-center">

                    <h2 className="text-2xl font-bold text-slate-900">
                        MeraWealth
                    </h2>

                    <p className="mt-4 leading-7 text-slate-600">
                        MeraWealth is committed to helping you grow your wealth
                        responsibly while safeguarding your financial future.
                        We follow a disciplined investment approach backed by
                        research, due diligence, and risk management to deliver
                        transparent and reliable investment opportunities.
                    </p>

                </div>

                {/* Links */}
                <div className="grid gap-10 md:grid-cols-3">

                    {/* Address */}
                    <div>

                        <h3 className="mb-4 text-lg font-semibold text-slate-900">
                            Federal Capital Markets Limited
                        </h3>

                        <div className="space-y-2 text-slate-600">

                            <p>Federal House</p>
                            <p>171, 5th Cross, RIFCO-Shantiniketan Layout</p>
                            <p>Bhattarahalli, KR Puram</p>
                            <p>Bengaluru - 560049</p>

                            <p className="pt-2">
                                info@merawealth.in
                            </p>

                        </div>

                    </div>

                    {/* Company */}
                    <div>

                        <h3 className="mb-4 text-lg font-semibold text-slate-900">
                            Company
                        </h3>

                        <ul className="space-y-2">

                            <li>
                                <a href="#" className="text-slate-600 hover:text-blue-600">
                                    About Us
                                </a>
                            </li>

                            <li>
                                <a href="#" className="text-slate-600 hover:text-blue-600">
                                    Career
                                </a>
                            </li>

                            <li>
                                <a href="#" className="text-slate-600 hover:text-blue-600">
                                    Services
                                </a>
                            </li>

                            <li>
                                <a href="#" className="text-slate-600 hover:text-blue-600">
                                    Privacy Policy
                                </a>
                            </li>

                            <li>
                                <a href="#" className="text-slate-600 hover:text-blue-600">
                                    Disclaimer
                                </a>
                            </li>

                        </ul>

                    </div>

                    {/* Useful Links */}
                    <div>

                        <h3 className="mb-4 text-lg font-semibold text-slate-900">
                            Useful Links
                        </h3>

                        <ul className="space-y-2">

                            <li>
                                <a href="https://www.bseindia.com" target="_blank" className="text-slate-600 hover:text-blue-600">
                                    BSE
                                </a>
                            </li>

                            <li>
                                <a href="https://www.nseindia.com" target="_blank" className="text-slate-600 hover:text-blue-600">
                                    NSE
                                </a>
                            </li>

                            <li>
                                <a href="https://www.rbi.org.in" target="_blank" className="text-slate-600 hover:text-blue-600">
                                    RBI
                                </a>
                            </li>

                            <li>
                                <a href="https://nclt.gov.in" target="_blank" className="text-slate-600 hover:text-blue-600">
                                    NCLT
                                </a>
                            </li>

                        </ul>

                    </div>

                </div>

            </div>

            <div className="border-t border-slate-200 py-5">

                <p className="text-center text-sm text-slate-500">
                    © {new Date().getFullYear()} MeraWealth. All rights reserved.
                </p>

            </div>

        </footer>
    );
}