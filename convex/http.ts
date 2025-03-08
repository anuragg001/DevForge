import { httpRouter } from "convex/server";
import {  httpAction} from  "./_generated/server";
import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/nextjs/server";
import {api} from "./_generated/api";

const http = httpRouter();

// we are creating a webhook i.e. communication between client and convex to9 send the acknowledgement to the convex whenever the user try to sign-in 

http.route({
    path:"/clerk-webHook",
    method:"POST",

    handler:httpAction(async (ctx,request)=>{
        const webHookSecret= process.env.CLERK_WEBHOOK_SECRET;
        if(!webHookSecret) {
            throw new Error("You didn't provided clerk_WEBHOOK_secret environment variable")

        }

        const svix_id= request.headers.get("svix-id")
        const svix_signature = request.headers.get("svix-signature")
        const svix_timestamp = request.headers.get("svix-timestamp")

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
                "svix-id":svix_id,
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
            const email= email_addresses[0].email_address;
            const name = `${first_name || ""} ${last_name || ""}`.trim();

            try {
                //save the user in db
                await ctx.runMutation(api.users.syncUser,{
                    userId:id,
                    name,
                    email
                })
            } catch (error) {
                console.log("Error While creating users.",error);
                return new Response ("Error creating user.",{status:500});
            }
        }
        return new Response("Webhook processed succesfully.",{status:200})
    }),
})

export default http;