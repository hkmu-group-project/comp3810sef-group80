import type * as React from "react";

import { HomeMainButton } from "#/components/pages/home/button";

export default (): React.JSX.Element => {
    return (
        <div className="flex h-screen flex-col items-center justify-center bg-background px-8 text-center">
            <h1 className="mb-8 text-5xl font-bold text-foreground">
                {"Welcome to Instant Messaging System!"}
            </h1>

            <div className="flex flex-wrap justify-center gap-4">
                <HomeMainButton />
            </div>
        </div>
    );
};
