"use client";

import type * as React from "react";

import { Button } from "#/components/ui/button";
import { logout as logoutProcess } from "#/openapi";

const NavUserLogoutButton = (): React.JSX.Element => {
    const logout = async (): Promise<void> => {
        await logoutProcess({
            credentials: "include",
        });

        window.location.href = "/";
    };

    return (
        <Button
            onClick={logout}
            className="float-right text-bold bg-red-500 text-white hover:bg-red-600"
        >
            {"Logout"}
        </Button>
    );
};

export { NavUserLogoutButton };
