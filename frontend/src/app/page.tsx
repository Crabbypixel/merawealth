"use client";

import Link from "next/link"
import Footer from "@/components/Footer";
// This is the main page of the application.
// It serves as a landing page -> To be developed further
// Minimal for now
export default function Home() {
    return (
        <section className="bg-white">
            <div className="relative">
                <img
                    src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/public/pre_ipo_banner.png`}
                    alt="MeraWealth Banner"
                    className="block w-full"
                />

                <Link
                    href="/pre-ipo"
                    className="absolute"
                    aria-label="Go to Pre-IPO"
                    style={{
                        left: "15%",
                        top: "76%",
                        width: "14%",
                        height: "12%",
                    }}
                />
            </div>
        </section>
    );
}
