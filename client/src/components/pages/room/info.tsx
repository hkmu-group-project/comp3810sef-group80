"use client";

import type * as React from "react";

import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { findRoom } from "#/openapi";

type RoomInfoProps = {
    // room id
    id: string;
};

const RoomInfo = (props: RoomInfoProps): React.JSX.Element => {
    const queryFn = async () => {
        try {
            const { data, error } = await findRoom({
                credentials: "include",
                path: {
                    id: props.id,
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
                        toast.error("Invalid query");
                        break;
                    case "not_found":
                        toast.error("Room not found");
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
            "room",
            props.id,
        ],
        queryFn,
    });

    if (error) {
        return <div>{"Something went wrong..."}</div>;
    }

    if (isLoading) {
        return <div>{"Loading..."}</div>;
    }

    return (
        <div>
            <h2 className="text-xl font-semibold">{data?.name}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
                {data?.description}
            </p>
        </div>
    );
};

export type { RoomInfoProps };
export { RoomInfo };
