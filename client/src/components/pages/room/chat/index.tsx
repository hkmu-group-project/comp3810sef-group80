"use client";

import * as React from "react";

import { RoomInput } from "#/components/pages/room/chat/input";
import { RoomMessages } from "#/components/pages/room/chat/messages";
import { ScrollArea } from "#/components/ui/scroll-area";

const THRESHOLD = 100 as const;

type ChatProps = {
    // room id
    id: string;
};

const Chat = (props: ChatProps): React.JSX.Element => {
    const [lockPos, setLockPos] = React.useState<boolean>(true);
    const scrollAreaRef = React.useRef<HTMLDivElement>(null);
    const [hvNewMessage, setHvNewMessage] = React.useState<boolean>(false);

    /**
     * check if scroll area is at the bottom, if so, lock position.
     *
     * The `lockPos` will be used to prevent the scroll area from being scrolled down on new messages.
     */
    React.useEffect((): (() => void) => {
        const scrollArea: HTMLDivElement | null = scrollAreaRef.current;

        if (!scrollArea) return (): void => void 0;

        const onScroll = (): void => {
            // at bottom
            if (
                scrollArea.scrollTop + scrollArea.clientHeight >=
                scrollArea.scrollHeight - THRESHOLD
            ) {
                setLockPos(true);
            }

            // not at bottom
            else {
                setLockPos(false);
            }
        };

        scrollArea.addEventListener("scroll", onScroll);

        return (): void => {
            scrollArea.removeEventListener("scroll", onScroll);
        };
    }, []);

    return (
        <>
            {/* Messages */}
            <ScrollArea
                ref={scrollAreaRef}
                className="flex-1 min-h-0"
            >
                <RoomMessages
                    id={props.id}
                    lockPos={lockPos}
                    scrollArea={scrollAreaRef}
                    hvNewMessage={hvNewMessage}
                    setHvNewMessage={setHvNewMessage}
                />
            </ScrollArea>

            {/* Input */}
            <RoomInput
                id={props.id}
                scrollArea={scrollAreaRef}
                setHvNewMessage={setHvNewMessage}
            />
        </>
    );
};

export { Chat };
