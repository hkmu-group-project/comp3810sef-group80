"use client";

import * as React from "react";
import { toast } from "sonner";

import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { useUserStore } from "#/stores/user";
import { updateUser } from ".openapi/sdk.gen";

const NavUserFormPassword = (): React.JSX.Element => {
    const { id } = useUserStore();

    const [loading, setLoading] = React.useState<boolean>(false);
    const [password, setPassword] = React.useState<string>("");
    const [password2, setPassword2] = React.useState<string>("");

    const update = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();

        if (!password || !password2) {
            toast.error("Please enter passwords");
            return void 0;
        }

        if (password !== password2) {
            toast.error("Passwords do not match");
            return void 0;
        }

        if (!id) {
            toast.error("Unknown credentials");
            return void 0;
        }

        setLoading(true);

        try {
            const { error } = await updateUser({
                credentials: "include",
                body: {
                    id,
                    password,
                },
            });

            if (error) {
                const err = error.errors[0];

                if (!err) {
                    toast.error("Unknown error");
                    return void 0;
                }

                switch (err.code) {
                    case "parse":
                        toast.error("Invalid input");
                        return void 0;
                    case "unauthorized":
                        toast.error("Invalid user credentials");
                        return void 0;
                    case "not_found":
                        toast.error("User not found");
                        return void 0;
                    case "forbidden":
                        toast.error("Forbidden access");
                        return void 0;
                    default:
                        toast.error("Unknown error");
                        return void 0;
                }
            }

            setPassword("");
            setPassword2("");

            toast.success("Password updated");
        } catch (_: unknown) {
            toast.error("Unknown error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form
            onSubmit={update}
            className="space-y-4 mb-8"
        >
            <Label htmlFor="password">{"Update password"}</Label>
            <Input
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
            />

            <Input
                type="password"
                placeholder="Confirm Password"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                disabled={loading}
            />

            <Button
                type="submit"
                className="w-full"
                disabled={loading}
            >
                {loading ? "Updating..." : "Update"}
            </Button>
        </form>
    );
};

export { NavUserFormPassword };
