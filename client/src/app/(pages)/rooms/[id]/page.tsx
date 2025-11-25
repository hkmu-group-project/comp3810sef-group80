import type * as React from "react";

import { Chat } from "#/components/pages/room/chat";
import { RoomInfo } from "#/components/pages/room/info";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "#/components/ui/sheet";

type PageProps = {
    params: Promise<{
        id: string;
    }>;
};

export default async ({ params }: PageProps): Promise<React.JSX.Element> => {
    const { id } = await params;

    return (
        <div className="pt-17 mx-auto max-w-6xl">
            <div className="h-[calc(100vh-(var(--spacing)*17))] flex gap-6 md:p-6">
                {/* Desktop Info Panel */}
                <div className="hidden md:flex w-64 shrink-0 border rounded-lg p-4 flex-col gap-4">
                    <RoomInfo id={id} />
                </div>

                <div className="flex-1 border rounded-lg flex flex-col overflow-hidden">
                    {/* Mobile Info Panel */}
                    <Sheet>
                        <SheetTrigger asChild>
                            <div className="flex md:hidden border-b p-4 text-right">
                                {"Room info >"}
                            </div>
                        </SheetTrigger>
                        <SheetContent>
                            <SheetHeader>
                                <SheetTitle>Room Info</SheetTitle>
                            </SheetHeader>

                            <div className="p-4">
                                <RoomInfo id={id} />
                            </div>
                        </SheetContent>
                    </Sheet>
                    {/* Chat Panel */}
                    <Chat id={id} />
                </div>
            </div>
        </div>
    );
};
