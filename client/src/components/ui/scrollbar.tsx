"use client";

import type { Options } from "@scrolia/react";
import type * as React from "react";

import { Scrollbar as S } from "@scrolia/react";

import { cn } from "#/lib/utils";

type ScrollbarProps = Pick<Options, "disabled" | "page"> & {
    containerClassName?: string;
    contentRef?: React.Ref<HTMLDivElement> | undefined;
    contentClassName?: string;
    children?: React.ReactNode;
};

const Scrollbar = (props: ScrollbarProps): React.JSX.Element => {
    const { containerClassName, contentRef, contentClassName, children, ...p } =
        props;

    return (
        <S.Provider {...p}>
            <S.Container
                className={cn("relative w-full h-full", containerClassName)}
            >
                <S.Content
                    ref={contentRef}
                    className={cn(
                        "sla-nsb relative w-full h-full",
                        !p.page && "overflow-scroll",
                        contentClassName,
                    )}
                >
                    {children}
                </S.Content>
                <S.TrackX
                    className={cn(
                        "fixed z-1",
                        "bottom-0 left-0 w-full h-[12px]",
                        !p.page && "absolute",
                    )}
                >
                    <S.ThumbX
                        className={cn(
                            "absolute bg-primary/60 rounded-full",
                            "h-[12px]",
                        )}
                    />
                </S.TrackX>
                <S.TrackY
                    className={cn(
                        "fixed z-1",
                        "top-0 right-0 w-[12px] h-full",
                        !p.page && "absolute",
                    )}
                >
                    <S.ThumbY
                        className={cn(
                            "absolute bg-primary/60 rounded-full",
                            "w-[12px]",
                        )}
                    />
                </S.TrackY>
            </S.Container>
        </S.Provider>
    );
};

export type { ScrollbarProps };
export { Scrollbar };
