import { faker } from "@faker-js/faker";
import type { Prisma } from "../generated/prisma/client";

export const createAccount = (initialBalance?: number): Prisma.AccountCreateInput => ({
    email: faker.internet.email(),
    balance: initialBalance ?? 1000,
});
