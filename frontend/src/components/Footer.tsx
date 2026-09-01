import Link from "next/dist/client/link";

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
                            MeraWealth
                        </h3>

                        <div className="space-y-2 text-slate-600">

                            <p>36, M M 1st Street,</p>
                            <p>Vadapalani, Chennai-26</p>

                            <p className="pt-2">
                                Mail: info@merawealth.in
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
                                <Link
                                    href="/about-us"
                                    className="text-slate-600 hover:text-blue-600"
                                >
                                    About Us
                                </Link>
                            </li>

                            <li>
                                <Link
                                    href="/process-flow"
                                    className="text-slate-600 hover:text-blue-600"
                                >
                                    Process Flow
                                </Link>
                            </li>

                            <li>
                                <Link
                                    href="/services"
                                    className="text-slate-600 hover:text-blue-600"
                                >
                                    Services
                                </Link>
                            </li>

                            <li>
                                <Link
                                    href="/privacy-policy"
                                    className="text-slate-600 hover:text-blue-600"
                                >
                                    Privacy Policy
                                </Link>
                            </li>

                            <li>
                                <Link
                                    href="/disclaimer"
                                    className="text-slate-600 hover:text-blue-600"
                                >
                                    Disclaimer
                                </Link>
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
                                <Link href="https://www.bseindia.com" target="_blank" className="text-slate-600 hover:text-blue-600">
                                    BSE
                                </Link>
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