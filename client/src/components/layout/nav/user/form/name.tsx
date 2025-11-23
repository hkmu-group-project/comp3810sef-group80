"use client";

import * as React from "react";
import { toast } from "sonner";

import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { useUserStore } from "#/stores/user";
import { updateUser } from ".openapi/sdk.gen";

const NavUserFormName = (): React.JSX.Element => {
    const { id, name, setName } = useUserStore();

    const [loading, setLoading] = React.useState<boolean>(false);
    const [username, setUsername] = React.useState<string>("");

    React.useEffect((): void => {
        if (name) {
            setUsername(name);
        }
    }, [
        name,
    ]);

    const update = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();

        if (!username) {
            toast.error("Please enter a username");
            return void 0;
        }

        if (username === name) {
            toast.warning("Username is the same");
            return void 0;
        }

        if (!id) {
            toast.error("Unknown credentials");
            return void 0;
        }

        try {
            const { error } = await updateUser({
                credentials: "include",
                body: {
                    id,
                    name: username,
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
                    case "duplicate":
                        toast.error("Duplicate username");
                        return void 0;
                    default:
                        toast.error("Unknown error");
                        return void 0;
                }
            }

            setName(username);

            toast.success("Username updated");
        } catch (_: unknown) {
            toast.error("Unknown error");
            return void 0;
        } finally {
            setLoading(false);
        }
    };

    return (
        <form
            onSubmit={update}
            className="space-y-4 mb-8"
        >
            <Label htmlFor="username">{"Update username"}</Label>
            <Input
                id="username"
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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

export { NavUserFormName };
