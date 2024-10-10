"use server"
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import db from "@repo/db/client"
export async function CreateOnRamp(provider:any,amount:number) {
    const session=await getServerSession(authOptions)
    console.log(session.user)
    if(!session.user.id){
        return {
            message:"User not logged in"
        }
    }
    const res=await db.onRampTransaction.create({
        data:{
            userId:Number(session.user.id),
            provider:provider,
            amount:amount*100,
            startTime:new Date(),
            token:(Math.random() * 1000).toString(),
            status:"Processing"
        }
    })
    return{
        msg:"Transaction added"
    }
}