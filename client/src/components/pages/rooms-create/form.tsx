"use client";

import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

import { useMutation } from "@tanstack/react-query";
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
import { createRoom } from ".openapi/sdk.gen";

const CreateRoomForm = (): React.JSX.Element => {
    const router: AppRouterInstance = useRouter();

    const [loading, setLoading] = React.useState<boolean>(false);

    const [name, setName] = React.useState<string>("");
    const [description, setDescription] = React.useState<string>("");

    const mutationFn = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();

        setLoading(true);

        if (!name) {
            toast.error("Please enter a name");
            return void 0;
        }

        try {
            const { data, error } = await createRoom({
                credentials: "include",
                body: {
                    name,
                    description,
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
                    case "invalid":
                        toast.error("Invalid user credentials");
                        return void 0;
                    default:
                        toast.error("Unknown error");
                        return void 0;
                }
            }

            const payload = data?.data;

            if (!payload) {
                toast.error("Unknown error");
                return void 0;
            }

            toast.success("Room created successfully");

            router.push(`/rooms/${payload.id}`);
        } catch (_: unknown) {
            toast.error("Unknown error");
        } finally {
            setLoading(false);
        }
    };

    const { mutate } = useMutation({
        mutationKey: [
            "create-room",
        ],
        mutationFn,
    });

    return (
        <div className="min-h-screen flex flex-col bg-muted dark:bg-background">
            <div className="flex flex-1 items-center justify-center p-6">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <CardTitle className="text-3xl">
                            {"Create Room"}
                        </CardTitle>
                        <CardDescription>
                            {"Create a new room to chat with others"}
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form
                            onSubmit={mutate}
                            className="space-y-4"
                        >
                            <Input
                                type="text"
                                placeholder="Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={loading}
                            />

                            <Input
                                type="text"
                                placeholder="Description (Optional)"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                disabled={loading}
                            />

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={loading}
                            >
                                {loading ? "Creating..." : "Create Room"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export { CreateRoomForm };
