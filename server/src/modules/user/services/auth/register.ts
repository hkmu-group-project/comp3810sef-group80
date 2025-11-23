import type { WithId } from "mongodb";
import type { Format } from "ts-vista";

import type { User } from "#/modules/user/schema";

import { hash } from "@node-rs/argon2";

import { createUser, findUserByName } from "#/modules/user/sql";
import { ServiceError } from "#/utils/service-error";

type ServiceUserRegisterOptions = Format<Pick<User, "name" | "password">>;

enum ServiceUserRegisterErrorCode {
    DUPLICATE = "duplicate",
}

enum ServiceUserRegisterErrorMessage {
    DUPLICATE = "User already exists",
}

const getErrorMessage = (
    code: ServiceUserRegisterErrorCode,
): ServiceUserRegisterErrorMessage => {
    switch (code) {
        case ServiceUserRegisterErrorCode.DUPLICATE:
            return ServiceUserRegisterErrorMessage.DUPLICATE;
    }
};

const serviceUserRegister = async (
    options: ServiceUserRegisterOptions,
): Promise<void> => {
    // check duplicate

    const duplicate: WithId<User> | null = await findUserByName(options.name);

    if (duplicate) {
        const code: ServiceUserRegisterErrorCode =
            ServiceUserRegisterErrorCode.DUPLICATE;

        throw new ServiceError(code)
            .setStatus(409)
            .setMessage(getErrorMessage(code));
    }

    // create user

    await createUser({
        name: options.name,
        password: await hash(options.password),
    });
};

export type { ServiceUserRegisterOptions, ServiceError };
export {
    ServiceUserRegisterErrorCode,
    ServiceUserRegisterErrorMessage,
    serviceUserRegister,
};
