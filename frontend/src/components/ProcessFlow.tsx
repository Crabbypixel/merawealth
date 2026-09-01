export default function ProcessFlow() {
    return (
        <main className="min-h-screen bg-white">
            <div className="mx-auto max-w-7xl px-6 py-10">
                <img
                    src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/public/merawealth_process_flow.png`}
                    alt="MeraWealth Process Flow"
                    className="mx-auto h-auto max-w-full"
                />
            </div>
        </main>
    );
}