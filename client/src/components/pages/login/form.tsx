"use client";

import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

import { Button, buttonVariants } from "#/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "#/components/ui/card";
import { Input } from "#/components/ui/input";
import { cn } from "#/lib/utils";
import { login as loginProcess } from "#/openapi";
import { useUserStore } from "#/stores/user";

const LoginForm = (): React.JSX.Element => {
    const router: AppRouterInstance = useRouter();

    const { setId, setName } = useUserStore();

    const [loading, setLoading] = React.useState<boolean>(false);
    const [username, setUsername] = React.useState<string>("");
    const [password, setPassword] = React.useState<string>("");

    const login = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();

        if (!username.trim() || !password.trim()) {
            toast.error("Please enter username and password");
            return void 0;
        }

        setLoading(true);

        try {
            const { data, error } = await loginProcess({
                credentials: "include",
                body: {
                    name: username,
                    password,
                },
            });

            if (error) {
                const err = error.errors[0];

                if (err) {
                    if (err.code === "invalid") {
                        toast.error("Invalid username or password");
                        return void 0;
                    }
                } else {
                    toast.error("Unknown error");
                    return void 0;
                }
            }

            const payload = data?.data;

            if (!payload) {
                toast.error("Unknown error");
                return void 0;
            }

            setId(payload.id);
            setName(payload.name);

            toast.success("Login successful");

            router.push("/rooms");
        } catch (_: unknown) {
            toast.error("Unknown error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-muted dark:bg-background">
            <div className="flex flex-1 items-center justify-center p-6">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <CardTitle className="text-3xl">
                            {"Welcome Back"}
                        </CardTitle>
                        <CardDescription>
                            {"Sign in to continue"}
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form
                            onSubmit={login}
                            className="space-y-4"
                        >
                            <Input
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                disabled={loading}
                            />

                            <Input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                            />

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={loading}
                            >
                                {loading ? "Signing In..." : "Enter Chatroom"}
                            </Button>
                        </form>

                        <Link
                            href={"/auth/register"}
                            className={cn(
                                buttonVariants({
                                    variant: "ghost",
                                }),
                                "w-full mt-4",
                            )}
                        >
                            {"Don't have an account?"}
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export { LoginForm };
