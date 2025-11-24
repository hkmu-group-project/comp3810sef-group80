"use client";

import type { QueryClient } from "@tanstack/react-query";

import { useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import { toast } from "sonner";

import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { createMessage } from "#/openapi";

type RoomInputProps = {
    // room id
    id: string;
};

const RoomInput = (props: RoomInputProps): React.JSX.Element => {
    const client: QueryClient = useQueryClient();

    const [loading, setLoading] = React.useState<boolean>(false);
    const [message, setMessage] = React.useState<string>("");

    const sendMessage = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();

        if (!message) return void 0;

        setLoading(true);

        try {
            const { error } = await createMessage({
                credentials: "include",
                body: {
                    roomId: props.id,
                    content: message,
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

            await client.invalidateQueries({
                queryKey: [
                    "messages",
                    props.id,
                ],
            });
        } catch (_: unknown) {
            toast.error("Unknown error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form
            onSubmit={sendMessage}
            className="p-4 border-t flex gap-4"
        >
            <Input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter something..."
                className="flex-1"
                disabled={loading}
            />
            <Button
                type="submit"
                disabled={!message || loading}
            >
                {"Send"}
            </Button>
        </form>
    );
};

export type { RoomInputProps };
export { RoomInput };
