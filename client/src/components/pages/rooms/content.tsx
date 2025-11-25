"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import Link from "next/link";
import * as React from "react";
import { toast } from "sonner";

import { Button } from "#/components/ui/button";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "#/components/ui/card";
import { findRooms } from "#/openapi";

const PAGE_SIZE = 30 as const;

type RoomProps = {
    id: string;
    ownerId: string;
    name: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
};

const Room = (props: RoomProps): React.JSX.Element => {
    const { name, description } = props;

    return (
        <Link
            href={`/rooms/${props.id}`}
            passHref
        >
            <Card className="p-4 hover:bg-secondary">
                <CardHeader className="p-0 mb-2">
                    <CardTitle className="text-lg">{name}</CardTitle>
                    {description ? (
                        <CardDescription>{description}</CardDescription>
                    ) : null}
                </CardHeader>
            </Card>
        </Link>
    );
};

const Rooms = (): React.JSX.Element => {
    const queryFn = async ({ pageParam }: { pageParam?: string }) => {
        try {
            const { data, error } = await findRooms({
                query: {
                    first: PAGE_SIZE,
                    after: pageParam,
                },
            });

            if (error) {
                const err = error.errors[0];

                if (err?.code === "parse") {
                    toast.error("Invalid query");
                } else {
                    toast.error("Unknown error");
                }
                throw new Error();
            }

            const payload = data?.data ?? [];

            return payload;
        } catch (_: unknown) {
            toast.error("Unknown error");
            throw new Error();
        }
    };

    const { status, data, fetchNextPage, isFetchingNextPage, hasNextPage } =
        useInfiniteQuery({
            queryKey: [
                "rooms",
            ],
            queryFn,
            initialPageParam: void 0,
            getNextPageParam: (lastPage): string | undefined => {
                if (lastPage.length < PAGE_SIZE) return void 0;
                const lastData = lastPage[lastPage.length - 1];
                if (!lastData) return void 0;
                return lastData.id;
            },
        });

    if (status === "pending") {
        return (
            <div className="flex items-center justify-center w-full h-screen">
                <div>{"Loading..."}</div>
            </div>
        );
    }

    if (status === "error") {
        return (
            <div className="flex items-center justify-center w-full h-screen">
                <div>{"Something went wrong!"}</div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-6xl p-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-4">
                {data.pages.map(
                    (rooms, index): React.JSX.Element => (
                        // biome-ignore lint/suspicious/noArrayIndexKey: I don't care
                        <React.Fragment key={index}>
                            {rooms.map(
                                (room): React.JSX.Element => (
                                    <Room
                                        key={room.id}
                                        {...room}
                                    />
                                ),
                            )}
                        </React.Fragment>
                    ),
                )}
            </div>

            <React.Activity mode={hasNextPage ? "visible" : "hidden"}>
                <Button
                    className="mx-auto block"
                    disabled={isFetchingNextPage}
                    onClick={(): void => {
                        fetchNextPage();
                    }}
                >
                    {isFetchingNextPage ? "Loading..." : "Load more"}
                </Button>
            </React.Activity>
        </div>
    );
};

export { Rooms };
