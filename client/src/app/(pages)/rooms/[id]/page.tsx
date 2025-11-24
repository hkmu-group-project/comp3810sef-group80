import type * as React from "react";

import { RoomInfo } from "#/components/pages/room/info";
import { RoomInput } from "#/components/pages/room/input";
import { RoomMessages } from "#/components/pages/room/messages";
import { ScrollArea } from "#/components/ui/scroll-area";

type PageProps = {
    params: Promise<{
        id: string;
    }>;
};

export default async ({ params }: PageProps): Promise<React.JSX.Element> => {
    const { id } = await params;

    return (
        <div className="pt-17 mx-auto max-w-6xl">
            <div className="h-[calc(100vh-(var(--spacing)*17))] flex gap-6 p-6">
                {/* Info Panel */}
                <div className="w-64 shrink-0 border rounded-lg p-4 flex flex-col gap-4">
                    <RoomInfo id={id} />
                </div>

                {/* Chat Panel */}
                <div className="flex-1 border rounded-lg flex flex-col">
                    {/* Messages */}
                    <ScrollArea className="flex-1 p-4">
                        <RoomMessages id={id} />
                    </ScrollArea>

                    {/* Input */}
                    <RoomInput id={id} />
                </div>
            </div>
        </div>
    );
};
