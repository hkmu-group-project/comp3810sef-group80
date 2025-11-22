import type * as React from "react";

import { Init } from "#/components/layout/init";
import { Nav } from "#/components/layout/nav";
import { ThemeProvider } from "#/components/layout/theme";
import { Toaster } from "#/components/ui/sonner";

export default ({
    children,
}: {
    children: React.ReactNode;
}): React.JSX.Element => {
    return (
        <ThemeProvider
            attribute={"class"}
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <Init />
            <Nav />
            {children}
            <Toaster
                richColors
                position="bottom-center"
                toastOptions={{
                    style: {
                        padding: 8,
                    },
                }}
            />
        </ThemeProvider>
    );
};
