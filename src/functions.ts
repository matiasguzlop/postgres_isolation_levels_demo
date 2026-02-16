import { prisma } from "./prisma";
import type { TransactionIsolationLevel } from "../generated/prisma/internal/prismaNamespace";

export const transfer = async (
    originAccountId: number,
    targetAccountId: number,
    amount: number,
    isolationLevel: TransactionIsolationLevel = "ReadCommitted",
) => {
    await prisma.$transaction(
        async (tx) => {
            const originAccount = await tx.account.findUnique({
                where: { id: originAccountId },
            });
            if (!originAccount) throw new Error("Origin account not found!");

            await new Promise<void>((resolve, reject) =>
                setTimeout(() => resolve(), 10),
            );

            const targetAccount = await tx.account.findUnique({
                where: { id: targetAccountId },
            });
            if (!targetAccount) throw new Error("Target account not found!");

            if (originAccount.balance < amount)
                throw new Error("Origin account doesn't have enough balance");

            await tx.account.update({
                where: { id: targetAccountId },
                data: { balance: targetAccount.balance + amount },
            });

            await tx.account.update({
                where: { id: originAccountId },
                data: { balance: originAccount.balance - amount },
            });
        },
        {
            isolationLevel,
        },
    );
};
