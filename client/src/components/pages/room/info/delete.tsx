"use client";

import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

import { Button } from "#/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "#/components/ui/dialog";
import { deleteRoom } from "#/openapi";

type RoomDeleteProps = {
    id: string;
};

const RoomDelete = (props: RoomDeleteProps): React.JSX.Element => {
    const router: AppRouterInstance = useRouter();

    const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
    const [loading, setLoading] = React.useState<boolean>(false);

    const mutationFn = async (): Promise<void> => {
        setLoading(true);

        try {
            const { error } = await deleteRoom({
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
                        toast.error("Invalid input");
                        break;
                    case "invalid":
                        toast.error("Invalid user credentials");
                        break;
                    case "not_found":
                        toast.error("Room not found");
                        break;
                    case "forbidden":
                        toast.error("Forbidden access");
                        break;
                    default:
                        toast.error("Unknown error");
                        break;
                }

                throw new Error();
            }
        } catch (_: unknown) {
            toast.error("Unknown error");
            throw new Error();
        } finally {
            setLoading(false);
        }
    };

    const { mutateAsync } = useMutation({
        mutationKey: [
            "room",
            props.id,
        ],
        mutationFn,
        onSuccess: async (): Promise<void> => {
            setIsDeleteOpen(false);
            toast.success("Room deleted");
            router.push("/rooms");
        },
    });

    const handleClick = async (): Promise<void> => {
        await mutateAsync();
    };

    return (
        <Dialog
            open={isDeleteOpen}
            onOpenChange={setIsDeleteOpen}
        >
            <DialogTrigger asChild>
                <Button className="mt-4 w-full text-bold bg-red-500 text-white hover:bg-red-600">
                    {"Delete"}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{"Are you sure?"}</DialogTitle>
                    <DialogDescription>
                        {"This action will permanently delete this room, "}
                        {"which cannot be undone."}
                    </DialogDescription>
                </DialogHeader>
                <Button
                    onClick={handleClick}
                    disabled={loading}
                    className="mt-4 w-full text-bold bg-red-500 text-white hover:bg-red-600"
                >
                    {"Delete"}
                </Button>
            </DialogContent>
        </Dialog>
    );
};

export { RoomDelete };
