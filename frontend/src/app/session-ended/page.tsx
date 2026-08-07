import { Suspense } from "react";
import SessionEndedCard from "@/components/SessionEndedCard";

export default function SessionEndedPage() {
    return (
        <div>
            <Suspense fallback={null}>
                <SessionEndedCard />
            </Suspense>
        </div>
    );
}