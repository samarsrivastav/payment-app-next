import prisma from "@repo/db/client";
import { P2PTransactions } from "../../../components/P2PTransfer";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
async function getTransaction() {
    const session=await getServerSession(authOptions)
    const tx=await prisma.p2pTransfer.findMany({
        where: {
            OR: [
                {
                    fromUserId: Number(session?.user?.id)
                },
                {
                    toUserId: Number(session?.user?.id)
                }
            ]
        }
    })
    return tx.map((t)=>{
        if(t.fromUserId==session.user.id){
            return {
                type:"DEBIT",
                amount:t.amount,
                time:new Date(t.timestamp),
                userId:t.toUserId

            }
        }else{
            return {
                type:"CREDIT",
                amount:t.amount,
                time:new Date(t.timestamp),
                userId:t.fromUserId

            }
        }
    })

}
export default async function() {
    const transactions=await getTransaction()
    return <div>
        <P2PTransactions transactions={transactions}/>
    </div>
}