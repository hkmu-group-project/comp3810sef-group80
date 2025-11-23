"use client";

import type * as React from "react";

import Link from "next/link";

import { NavUserFormName } from "#/components/layout/nav/user/form/name";
import { NavUserFormPassword } from "#/components/layout/nav/user/form/password";
import { NavUserLogoutButton } from "#/components/layout/nav/user/logout";
import { Button, buttonVariants } from "#/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "#/components/ui/sheet";
import { cn } from "#/lib/utils";
import { useUserStore } from "#/stores/user";

const NavUser = (): React.JSX.Element => {
    const { id, name } = useUserStore();

    if (id && name) {
        // return <>{`Welcome, ${name}!`}</>;
        return (
            <Sheet>
                <SheetTrigger asChild>
                    <Button
                        variant={"link"}
                        className="cursor-pointer"
                    >{`Welcome, ${name}!`}</Button>
                </SheetTrigger>
                <SheetContent onOpenAutoFocus={(e) => e.preventDefault()}>
                    <SheetHeader>
                        <SheetTitle>{`Welcome, ${name}!`}</SheetTitle>
                    </SheetHeader>
                    <div className="p-4">
                        <NavUserFormName />
                        <NavUserFormPassword />
                        <NavUserLogoutButton />
                    </div>
                </SheetContent>
            </Sheet>
        );
    }

    return (
        <>
            <Link
                href="/auth/login"
                className={cn(
                    buttonVariants({
                        variant: "ghost",
                    }),
                )}
            >
                {"Sign In"}
            </Link>

            <Link
                href="/auth/register"
                className={cn(
                    buttonVariants({
                        variant: "ghost",
                    }),
                )}
            >
                {"Sign Up"}
            </Link>
        </>
    );
};

export { NavUser };
