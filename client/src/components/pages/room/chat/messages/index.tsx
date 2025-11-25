/**
 * In this page, the data should be `x[][]`,
 * first array is the pages, second array is the messages in each page,
 * both array include the pages data from oldest to latest.
 */

"use client";

import type { QueryClient } from "@tanstack/react-query";

import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import { toast } from "sonner";

import { Message } from "#/components/pages/room/chat/messages/message";
import { Skeleton } from "#/components/ui/skeleton";
import { findMessages } from "#/openapi";

const PAGE_SIZE = 30 as const;

type FetchFirstOptions = {
    roomId: string;
    after?: string;
};

const fetchFirst = async ({ roomId, after }: FetchFirstOptions) => {
    return await findMessages({
        credentials: "include",
        query: {
            roomId,
            first: PAGE_SIZE,
            after,
        },
    });
};

type FetchLastOptions = {
    roomId: string;
    before?: string;
};

const fetchLast = async ({ roomId, before }: FetchLastOptions) => {
    return await findMessages({
        credentials: "include",
        query: {
            roomId,
            last: PAGE_SIZE,
            before,
        },
    });
};

type FetchDataOptions = {
    roomId: string;
} & (
    | {
          type: "first";
          after?: string;
      }
    | {
          type: "last";
          before?: string;
      }
);

const fetchData = async (options: FetchDataOptions) => {
    try {
        const { data, error } =
            options.type === "first"
                ? await fetchFirst(options)
                : await fetchLast(options);

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

type RoomMessagesProps = {
    // room id
    id: string;
    lockPos: boolean;
    scrollArea: React.RefObject<HTMLDivElement | null>;
    hvNewMessage: boolean;
    setHvNewMessage: (bl: boolean) => void;
};

const RoomMessages = (props: RoomMessagesProps): React.JSX.Element => {
    const [hvPreviousPage, setHvPreviousPage] = React.useState<boolean>(true);

    const client: QueryClient = useQueryClient();

    const queryFn = async ({ pageParam }: { pageParam?: string }) => {
        const result = await fetchData({
            type: "last",
            roomId: props.id,
            before: pageParam,
        });

        if (result.length < PAGE_SIZE) {
            setHvPreviousPage(false);
        }

        return result;
    };

    const { data } = useInfiniteQuery({
        queryKey: [
            "messages",
            props.id,
        ],
        queryFn,
        initialPageParam: void 0,
        getPreviousPageParam: (firstPage): string | undefined => {
            const firstData = firstPage[0];
            if (!firstData) return void 0;
            return firstData.id;
        },
        getNextPageParam: (lastPage): string | undefined => {
            if (lastPage.length < PAGE_SIZE) return void 0;
            const lastData = lastPage[lastPage.length - 1];
            if (!lastData) return void 0;
            return lastData.id;
        },
    });

    const handleOnScrollSetQueryData = React.useEffectEvent(
        (oldMessages: Array<any>): void => {
            client.setQueriesData(
                {
                    queryKey: [
                        "messages",
                        props.id,
                    ],
                },
                (
                    old:
                        | {
                              pages: Array<Array<any>>;
                              pageParams: Array<any>;
                          }
                        | undefined,
                ) => {
                    if (!old) {
                        return {
                            pages: [
                                oldMessages,
                            ],
                            pageParams: [
                                void 0,
                            ],
                        };
                    }

                    return {
                        ...old,
                        pages: [
                            oldMessages,
                            ...old.pages,
                        ],
                    };
                },
            );
        },
    );

    const oldestMessageId: string | undefined = data?.pages[0]?.[0]?.id;

    const handleOnScroll = React.useCallback(async (): Promise<void> => {
        const scrollArea: HTMLDivElement | null = props.scrollArea.current;

        if (!scrollArea) return void 0;

        // at top
        if (scrollArea.scrollTop !== 0) return void 0;

        const oldMessages = await fetchData({
            type: "last",
            roomId: props.id,
            before: oldestMessageId,
        });

        if (oldMessages.length === 0) return void 0;

        if (oldMessages.length < PAGE_SIZE) {
            setHvPreviousPage(false);
        }

        handleOnScrollSetQueryData(oldMessages);
    }, [
        props.scrollArea,
        props.id,
        oldestMessageId,
    ]);

    // fetch old messages when scroll to top
    React.useEffect((): (() => void) => {
        const scrollArea: HTMLDivElement | null = props.scrollArea.current;

        if (!scrollArea) return (): void => void 0;

        scrollArea.addEventListener("scroll", handleOnScroll);

        return (): void => {
            scrollArea.removeEventListener("scroll", handleOnScroll);
        };
    }, [
        props.scrollArea,
        handleOnScroll,
    ]);

    const intervalFetch = React.useCallback(
        async ({ after }: { after?: string }): Promise<void> => {
            try {
                const newMessages = await fetchData({
                    type: "first",
                    roomId: props.id,
                    after,
                });

                if (newMessages.length === 0) return void 0;

                client.setQueriesData(
                    {
                        queryKey: [
                            "messages",
                            props.id,
                        ],
                    },
                    (
                        old:
                            | {
                                  pages: Array<Array<any>>;
                                  pageParams: Array<any>;
                              }
                            | undefined,
                    ) => {
                        if (!old) {
                            return {
                                pages: [
                                    newMessages,
                                ],
                                pageParams: [
                                    void 0,
                                ],
                            };
                        }

                        return {
                            ...old,
                            pages: [
                                ...old.pages,
                                newMessages,
                            ],
                        };
                    },
                );
            } catch (_: unknown) {
                // ignore
            }
        },
        [
            props.id,
            client.setQueriesData,
        ],
    );

    const latestMessageId = React.useMemo((): string | undefined => {
        const pages = data?.pages;
        if (!pages || pages.length === 0) return void 0;
        const lastPage = pages[pages.length - 1];
        if (!lastPage) return void 0;
        const lastMessage = lastPage[lastPage.length - 1];
        if (!lastMessage) return void 0;
        return lastMessage.id;
    }, [
        data,
    ]);

    // trigger refetch interval
    React.useEffect((): (() => void) => {
        const interval = setInterval(async (): Promise<void> => {
            await intervalFetch({
                after: latestMessageId,
            });
        }, 5000);

        return (): void => clearInterval(interval);
    }, [
        intervalFetch,
        latestMessageId,
    ]);

    // trigger refetch if input new data
    React.useEffect((): void => {
        (async (): Promise<void> => {
            if (!props.hvNewMessage) return void 0;

            await intervalFetch({
                after: latestMessageId,
            });

            props.setHvNewMessage(false);
        })();
    }, [
        props.hvNewMessage,
        intervalFetch,
        latestMessageId,
        props.setHvNewMessage,
    ]);

    // scroll to bottom if new data and lock pos at bottom
    React.useEffect((): (() => void) => {
        if (!props.lockPos) return (): void => void 0;

        if (!data) return (): void => void 0;

        const scrollArea: HTMLDivElement | null = props.scrollArea.current;

        if (!scrollArea) return (): void => void 0;

        const timout: NodeJS.Timeout = setTimeout((): void => {
            scrollArea.scrollTo({
                top: scrollArea.scrollHeight,
                behavior: "smooth",
            });
        }, 300);

        return (): void => {
            clearTimeout(timout);
        };
    }, [
        props.lockPos,
        data,
        props.scrollArea.current,
    ]);

    return (
        <>
            <React.Activity mode={hvPreviousPage ? "visible" : "hidden"}>
                {Array.from({
                    length: 4,
                }).map(
                    (_, index): React.JSX.Element => (
                        <Skeleton
                            // biome-ignore lint/suspicious/noArrayIndexKey: I don't care
                            key={index}
                            className="h-16 m-4 p-4 rounded-lg bg-secondary/40"
                        />
                    ),
                )}
            </React.Activity>
            {data?.pages.map(
                (messages, index): React.JSX.Element => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: I don't care
                    <React.Fragment key={index}>
                        {messages.map(
                            (message): React.JSX.Element => (
                                <Message
                                    key={message.id}
                                    {...message}
                                />
                            ),
                        )}
                    </React.Fragment>
                ),
            )}
        </>
    );
};

export type { RoomMessagesProps };
export { RoomMessages };
