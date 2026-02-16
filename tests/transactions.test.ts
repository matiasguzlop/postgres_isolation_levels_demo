import type { AccountCreateInput } from "../generated/prisma/models";
import { transfer } from "../src/functions";
import { prisma } from "../src/prisma";
import { createAccount } from "./factories";

interface IContext {
    unsavedAccount1: AccountCreateInput;
    unsavedAccount2: AccountCreateInput;
    accountId1: number;
    accountId2: number;
}

describe("Transfer from one account to another", () => {
    beforeEach<IContext>(async (ctx) => {
        await prisma.account.deleteMany();

        ctx.unsavedAccount1 = createAccount(1000);
        ctx.unsavedAccount2 = createAccount(1000);

        const { id: accountId1 } = await prisma.account.create({
            data: ctx.unsavedAccount1,
        });
        const { id: accountId2 } = await prisma.account.create({
            data: ctx.unsavedAccount2,
        });

        ctx.accountId1 = accountId1;
        ctx.accountId2 = accountId2;
    });

    test<IContext>("Should perform one transfer of 100", async (ctx) => {
        await transfer(ctx.accountId1, ctx.accountId2, 100);

        const originAccount = await prisma.account.findUnique({
            where: { id: ctx.accountId1 },
        });
        const targetAccount = await prisma.account.findUnique({
            where: { id: ctx.accountId2 },
        });

        expect(originAccount?.balance).toBe(900);
        expect(targetAccount?.balance).toBe(1100);
    });

    test<IContext>("Should perform multiple transfers of 1 - READ COMMITTED", async (ctx) => {
        await Promise.all(
            [...Array(100)].map(() =>
                transfer(ctx.accountId1, ctx.accountId2, 1, "ReadCommitted"),
            ),
        );
    });

    test<IContext>("Should perform multiple transfers of 1 - REPEATABLE READ", async (ctx) => {
        await Promise.all(
            [...Array(2)].map(() =>
                transfer(ctx.accountId1, ctx.accountId2, 1, "RepeatableRead"),
            ),
        );
    });

    test<IContext>("Should perform multiple transfers of 1 - SERIALIZABLE", async (ctx) => {
        await Promise.all(
            [...Array(10)].map(() =>
                transfer(ctx.accountId1, ctx.accountId2, 1, "Serializable"),
            ),
        );
    });

    afterEach<IContext>(async (ctx) => {
        const originAccount = await prisma.account.findUnique({
            where: { id: ctx.accountId1 },
        });
        const targetAccount = await prisma.account.findUnique({
            where: { id: ctx.accountId2 },
        });

        if (!originAccount || !targetAccount) throw new Error();

        const totalAfter = originAccount.balance + targetAccount.balance;
        const totalBefore =
            ctx.unsavedAccount1.balance + ctx.unsavedAccount2.balance;
        expect(totalAfter).toBe(totalBefore);
    });
});




