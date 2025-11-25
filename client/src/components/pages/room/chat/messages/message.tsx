"use client";

import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import * as React from "react";
import { toast } from "sonner";

import { cn } from "#/lib/utils";
import { findUser } from "#/openapi";
import { useUserStore } from "#/stores/user";

type MessageProps = {
    id: string;
    roomId: string;
    sender: string;
    content: string;
    createdAt: string;
    updatedAt: string;
};

dayjs.extend(relativeTime);

const Message = (props: MessageProps): React.JSX.Element => {
    const { id } = useUserStore();

    const isMe: boolean = id === props.sender;

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

    const { data } = useQuery({
        queryKey: [
            "user",
            props.sender,
        ],
        queryFn,
        enabled: !isMe,
    });

    return (
        <div
            className={cn(
                "relative m-4 w-fit max-w-[80%] md:max-w-[60%] p-4 rounded-lg bg-secondary/40",
                isMe ? "ml-auto" : "mr-auto",
            )}
        >
            <React.Activity mode={!isMe ? "visible" : "hidden"}>
                <div className="pr-8 mb-2 text-sm font-medium text-muted-foreground">
                    {data?.name}
                </div>
            </React.Activity>

            <div className="text-md leading-relaxed break-words">
                {props.content}
            </div>

            <div className="mt-2 text-xs text-muted-foreground block text-right">
                {dayjs(props.createdAt).fromNow()}
            </div>
        </div>
    );
};

export type { MessageProps };
export { Message };
