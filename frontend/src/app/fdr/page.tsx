import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
});

export default function FDRPage() {
  return (
    <main className={`${inter.className} min-h-screen bg-gray-50`}>
      <section className="mx-auto max-w-7xl px-6 py-12">

        {/* Hero Image */}
        <div className="flex justify-center">
          <img
            src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/public/fdr.png`}
            alt="Fixed Deposit"
            className="h-auto w-[800px] rounded-2xl shadow-xl"
          />
        </div>

        {/* Hero Content */}
        <div className="mt-12 text-center">
          <h1 className="text-5xl font-extrabold tracking-tight text-gray-950">
            Grow Your Wealth with Fixed Deposits
          </h1>

          <p className="mx-auto mt-6 max-w-4xl text-lg leading-8 text-gray-700">
            Fixed Deposits (FDs) are among India's most trusted investment
            options, offering guaranteed returns with complete capital
            protection. Whether you're planning for future goals or looking
            for a secure place to invest surplus funds, Fixed Deposits provide
            predictable growth without exposure to market fluctuations.
          </p>
        </div>

        {/* Benefits */}
        <section className="mt-20">
          <h2 className="mb-10 text-center text-3xl font-bold tracking-tight text-gray-900">
            Why Choose Fixed Deposits?
          </h2>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
              <h3 className="mb-3 text-xl font-semibold text-gray-900">
                Guaranteed Returns
              </h3>

              <p className="leading-7 text-gray-700">
                Earn fixed interest with complete certainty throughout the
                investment period.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
              <h3 className="mb-3 text-xl font-semibold text-gray-900">
                Zero Market Risk
              </h3>

              <p className="leading-7 text-gray-700">
                Your investment remains unaffected by market volatility,
                ensuring complete peace of mind.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
              <h3 className="mb-3 text-xl font-semibold text-gray-900">
                Flexible Tenure
              </h3>

              <p className="leading-7 text-gray-700">
                Select an investment duration that matches your financial goals
                and requirements.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
              <h3 className="mb-3 text-xl font-semibold text-gray-900">
                Capital Protection
              </h3>

              <p className="leading-7 text-gray-700">
                Your principal amount remains secure until maturity, making FD
                a dependable investment.
              </p>
            </div>

          </div>
        </section>

        {/* How It Works */}
        <section className="mt-20">
          <h2 className="mb-10 text-center text-3xl font-bold tracking-tight text-gray-900">
            How It Works
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
                Deposit your preferred investment amount.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm transition hover:shadow-md">
              <div className="mb-4 text-3xl font-bold text-amber-600">
                2
              </div>

              <h3 className="text-lg font-semibold text-gray-900">
                Select Tenure
              </h3>

              <p className="mt-2 leading-7 text-gray-700">
                Choose a tenure that suits your financial objectives.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm transition hover:shadow-md">
              <div className="mb-4 text-3xl font-bold text-amber-600">
                3
              </div>

              <h3 className="text-lg font-semibold text-gray-900">
                Earn Interest
              </h3>

              <p className="mt-2 leading-7 text-gray-700">
                Enjoy fixed returns throughout the investment period.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm transition hover:shadow-md">
              <div className="mb-4 text-3xl font-bold text-amber-600">
                4
              </div>

              <h3 className="text-lg font-semibold text-gray-900">
                Receive Maturity Amount
              </h3>

              <p className="mt-2 leading-7 text-gray-700">
                Get your principal along with guaranteed interest at maturity.
              </p>
            </div>

          </div>
        </section>

        {/* FDR */}
        <section className="mt-20 rounded-2xl border border-gray-200 bg-white p-10 shadow-sm">
          <h2 className="mb-6 text-3xl font-bold tracking-tight text-gray-900">
            What is a Fixed Deposit Receipt (FDR)?
          </h2>

          <p className="leading-8 text-gray-700">
            A <strong className="font-semibold text-gray-900">Fixed Deposit Receipt (FDR)</strong> is the official
            document issued after your Fixed Deposit is created. It serves as
            proof of your investment and contains all essential information
            related to your deposit.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">

            {[
              "Deposit Amount",
              "Interest Rate",
              "Investment Tenure",
              "Deposit Date",
              "Maturity Date",
              "Maturity Amount",
            ].map((item) => (
              <div
                key={item}
                className="rounded-lg border border-gray-200 bg-gray-50 p-4 font-medium text-gray-800"
              >
                {item}
              </div>
            ))}

          </div>
        </section>

        {/* Suitable For */}
        <section className="mt-20">
          <h2 className="mb-10 text-center text-3xl font-bold tracking-tight text-gray-900">
            Who Should Invest?
          </h2>

          <div className="mx-auto max-w-4xl rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <ul className="grid gap-4 text-lg text-gray-800 md:grid-cols-2">
              <li>• Conservative investors</li>
              <li>• First-time investors</li>
              <li>• Retired individuals</li>
              <li>• Long-term wealth planners</li>
              <li>• Investors seeking predictable returns</li>
              <li>• Portfolio diversification seekers</li>
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
              Compare the best Fixed Deposit opportunities available.
            </div>

            <div className="rounded-xl bg-white p-6 text-gray-800 shadow-sm">
              Understand returns clearly before investing.
            </div>

            <div className="rounded-xl bg-white p-6 text-gray-800 shadow-sm">
              Choose tenures that align with your financial goals.
            </div>

            <div className="rounded-xl bg-white p-6 text-gray-800 shadow-sm">
              Invest with complete transparency and confidence.
            </div>

          </div>
        </section>

        {/* CTA */}
        <section className="mt-20 rounded-2xl bg-gray-950 px-8 py-14 text-center text-white">
          <h2 className="text-4xl font-extrabold tracking-tight">
            Start Investing with Confidence
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-gray-200">
            Secure your savings with Fixed Deposits and enjoy guaranteed
            returns, capital protection, and complete peace of mind. Build a
            stronger financial future with MeraWealth.
          </p>
        </section>

      </section>
    </main>
  );
}