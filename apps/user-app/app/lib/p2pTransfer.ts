"use server"
import { getServerSession } from "next-auth";
import { authOptions } from "./auth"; 
import prisma from "@repo/db/client";

export async function p2pTransfer(to: string, amount: number) {
    try{
        const session = await getServerSession(authOptions);
        
        const from = session?.user?.id;
        if (!from) {
            return {
            message: "Error while sending"
            }
        }
        const toUser = await prisma.user.findFirst({
            where: {
            number: to
            }
        });
        if (!toUser) {
            return {
            message: "User not found"
            }
        }
        await prisma.$transaction(async (tx) => {
            const fromBalance = await tx.balance.findUnique({
                where: { userId: Number(from) },
            });
            if (!fromBalance || fromBalance.amount < amount) {
                throw new Error('Insufficient funds');
            }
            await tx.balance.update({
                where: { userId: Number(from) },
                data: { amount: { decrement: amount } },
            });
            
            await tx.balance.update({
                where: { userId: toUser.id },
                data: { amount: { increment: amount } },
            });
            const res=await tx.onRampTransaction.create({
                data:{
                    userId:Number(session.user.id),
                    provider:"",
                    amount:amount*100,
                    startTime:new Date(),
                    token:(Math.random() * 1000).toString(),
                    status:"Success"
                }
            })
            return{
                msg:"p2p transfer completed"
            }
        });
    }catch{
        return {
            msg:"not transfer"
        }
    }
}