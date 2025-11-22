"use client";

import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

import { Button } from "#/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "#/components/ui/card";
import { Input } from "#/components/ui/input";
import { register as registerProcess } from "#/openapi";

const RegisterForm = (): React.JSX.Element => {
    const router: AppRouterInstance = useRouter();

    const [loading, setLoading] = React.useState<boolean>(false);
    const [username, setUsername] = React.useState<string>("");
    const [password, setPassword] = React.useState<string>("");
    const [password2, setPassword2] = React.useState<string>("");

    const register = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();

        if (!username.trim() || !password.trim() || !password2.trim()) {
            toast.error("Please enter username and password");
            return void 0;
        }

        if (password !== password2) {
            toast.error("Passwords do not match");
            return void 0;
        }

        setLoading(true);

        try {
            const { error } = await registerProcess({
                body: {
                    name: username,
                    password,
                },
            });

            if (error) {
                const err = error?.errors[0];

                if (err) {
                    if (err.code === "duplicate") {
                        toast.error("Duplicate username");
                        return void 0;
                    }
                } else {
                    toast.error("Unknown error");
                    return void 0;
                }
            }

            toast.success("Registration successful");

            router.push("/auth/login");
        } catch (_: unknown) {
            toast.error("Unknown error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen flex-col bg-muted dark:bg-background">
            {/* Top Navigation */}
            <header className="w-full bg-card text-card-foreground shadow-sm px-6 py-4">
                <h1 className="text-xl font-light">💬 Chat System</h1>
            </header>

            {/* Main Content */}
            <main className="flex flex-1 items-center justify-center px-6 py-8">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <CardTitle className="text-3xl">
                            {"Create Account"}
                        </CardTitle>
                        <CardDescription className="text-base">
                            {"Join the community today!"}
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form
                            onSubmit={register}
                            className="space-y-4"
                        >
                            <Input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Choose a username"
                            />

                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Create a password"
                            />

                            <Input
                                type="password"
                                value={password2}
                                onChange={(e) => setPassword2(e.target.value)}
                                placeholder="Confirm the password"
                            />

                            <Button
                                type="submit"
                                className="w-full font-bold"
                                disabled={loading}
                            >
                                {loading ? "Creating..." : "Create Account"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
};

export { RegisterForm };
