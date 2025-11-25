"use client";

import { useMutation } from "@tanstack/react-query";
import * as React from "react";
import { toast } from "sonner";

import { Button } from "#/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "#/components/ui/dialog";
import { Input } from "#/components/ui/input";
import { updateRoom } from "#/openapi";

type RoomUpdateProps = {
    id: string;
    name?: string;
    description?: string;
    refetch: () => Promise<any>;
};

const RoomUpdate = (props: RoomUpdateProps): React.JSX.Element => {
    const [isUpdateOpen, setIsUpdateOpen] = React.useState(false);
    const [loading, setLoading] = React.useState<boolean>(false);

    const [name, setName] = React.useState<string>("");
    const [description, setDescription] = React.useState<string>("");

    React.useEffect((): void => {
        setName(props.name ?? "");
        setDescription(props.description ?? "");
    }, [
        props.name,
        props.description,
    ]);

    const mutationFn = async (): Promise<void> => {
        if (!name) {
            toast.error("Please enter room name");
            throw new Error();
        }

        setLoading(true);

        try {
            const { error } = await updateRoom({
                credentials: "include",
                path: {
                    id: props.id,
                },
                body: {
                    name,
                    description,
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
            await props.refetch();
            setIsUpdateOpen(false);
            toast.success("Room updated");
        },
    });

    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>,
    ): Promise<void> => {
        e.preventDefault();
        await mutateAsync();
    };

    return (
        <Dialog
            open={isUpdateOpen}
            onOpenChange={setIsUpdateOpen}
        >
            <DialogTrigger asChild>
                <Button
                    variant={"secondary"}
                    className="w-full text-bold"
                >
                    {"Update"}
                </Button>
            </DialogTrigger>
            <DialogContent
                onOpenAutoFocus={(e: Event): void => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle>Update information</DialogTitle>
                </DialogHeader>
                <form
                    onSubmit={handleSubmit}
                    className="space-y-4"
                >
                    <Input
                        type="text"
                        placeholder="Room name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={loading}
                    />

                    <Input
                        type="text"
                        placeholder="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        disabled={loading}
                    />

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={loading}
                    >
                        {loading ? "Updating..." : "Update"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export { RoomUpdate };
