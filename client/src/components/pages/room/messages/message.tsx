"use client";

import type * as React from "react";

import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { findUser } from "#/openapi";

type MessageProps = {
    id: string;
    roomId: string;
    sender: string;
    content: string;
    createdAt: string;
    updatedAt: string;
};

const Message = (props: MessageProps): React.JSX.Element => {
    const queryFn = async () => {
        try {
            const { data, error } = await findUser({
                credentials: "include",
                query: {
                    id: props.sender,
                },
            });

            if (error) {
                const err = error.errors[0];

                if (!err) {
                    toast.error("Unknown error");
                    throw new Error();
                }

                switch (err.code) {
                    case "missing":
                        toast.error("Missing id or name");
                        break;
                    case "not_found":
                        toast.error("User not found");
                        break;
                    default:
                        toast.error("Unknown error");
                        break;
                }

                throw new Error();
            }

            return data.data;
        } catch (_: unknown) {
            toast.error("Unknown error");
            throw new Error();
        }
    };

    const { data, isLoading, error } = useQuery({
        queryKey: [
            "user",
            props.sender,
        ],
        queryFn,
    });

    if (isLoading) {
        return (
            <div className="p-4 text-sm text-muted-foreground">
                {"Loading..."}
            </div>
        );
    }

    if (error || !data) {
        return <div className="p-4 text-sm text-destructive">{"Error"}</div>;
    }

    return (
        <div className="flex flex-col gap-1 p-4 rounded-lg bg-secondary/40">
            <span className="text-xs font-medium text-muted-foreground">
                {data.name}
            </span>
            <p className="text-sm leading-relaxed break-words">
                {props.content}
            </p>
        </div>
    );
};

export type { MessageProps };
export { Message };
