import { getServerSession } from "next-auth";
import { P2PTransactions } from "../../../components/P2PTransfer";
import { SendCard } from "../../../components/SendCard";
import { authOptions } from "../../lib/auth";
import prisma from "@repo/db/client";
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
    return <div className="w-screen">
    <div className="text-4xl text-[#6a51a6] pt-8 mb-8 font-bold">
      P2P Transfer
    </div>
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 p-4">
      <div>
        <SendCard />
      </div>

      <div className="pt-4">
        <P2PTransactions transactions={transactions} />
      </div>

    </div>
  </div>
}