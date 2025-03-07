import { httpRouter } from "convex/server";
import {  httpAction} from  "./_generated/server";
import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/nextjs/server";
const http = httpRouter();

http.route({
    path:"/clerk-webHook",
    method:"POST",

    handler:httpAction(async (ctx,request)=>{
        const webHookSecret= process.env.CLERK_WEBHOOK_SECRET;
        if(!webHookSecret) {
            throw new Error("You didn't provided clerk_WEBHOOK_secret environment variable")

        }

        const svix_id= request.headers.get("svix_id")
        const svix_signature = request.headers.get("svix_signature")
        const svix_timestamp = request.headers.get("svix_timestamp")

        if(!svix_id  || !svix_signature || !svix_timestamp ){
            return new Response("Error occured -- no svix headers",{
                status:400,
            })
        }
        const payload= await request.json()
        const body = JSON.stringify(payload)

        const wh = new Webhook(webHookSecret);
        let evt : WebhookEvent;


        try {
            evt =wh.verify(body,{
                "svix_id":svix_id,
                "svix-signature":svix_signature,
                "svix-timestamp":svix_timestamp
            }) as WebhookEvent
        } catch (error) {
            console.error("Error Verifying Webhook Events:",error)
            return new Response("Error Occured",{status:400});
        }

        const eventType=evt.type;
        if(eventType ==="user.created"){
            //save the user to database
            const {id,email_addresses,first_name,last_name}=evt.data
        }
    }),
})