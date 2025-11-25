"use client";

import { useMutation } from "@tanstack/react-query";
import * as React from "react";
import { toast } from "sonner";

import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { createMessage } from "#/openapi";

type RoomInputProps = {
    // room id
    id: string;
    scrollArea: React.RefObject<HTMLDivElement | null>;
    setHvNewMessage: (bl: boolean) => void;
};

const RoomInput = (props: RoomInputProps): React.JSX.Element => {
    const [loading, setLoading] = React.useState<boolean>(false);
    const [message, setMessage] = React.useState<string>("");

    const mutationFn = async (): Promise<void> => {
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
                    throw new Error();
                }

                switch (err.code) {
                    case "parse":
                        toast.error("Invalid input");
                        break;
                    case "invalid":
                        toast.error("Invalid user credentials");
                        break;
                    default:
                        toast.error("Unknown error");
                        break;
                }

                throw new Error();
            }
        } catch (err: unknown) {
            toast.error("Unknown error");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const { mutate } = useMutation({
        mutationKey: [
            "message",
            props.id,
        ],
        mutationFn,
        onSuccess: async (): Promise<void> => {
            setMessage("");
            props.setHvNewMessage(true);
        },
    });

    return (
        <form
            className="p-4 border-t flex gap-4"
            onSubmit={(e: React.FormEvent<HTMLFormElement>): void => {
                e.preventDefault();
                mutate();
            }}
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
