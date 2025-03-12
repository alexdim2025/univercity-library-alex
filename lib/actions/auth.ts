"use server";
import { eq } from "drizzle-orm";
import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { hash } from "bcryptjs";
import { signIn } from "@/auth";
import { headers } from "next/headers";
import ratelimit from "@/lib/ratelimit";
import { redirect } from "next/navigation";
import { workflowClient } from "../workflow";

export const signUp = async (params: AuthCredentials) => { 
   const { fullName, email, password, universityId, universityCard } = params;

   const ip = (await headers()).get("x-forwarded-for") || "127.0.0.1";
   const { success } = await ratelimit.limit(ip);

   if(!success) return redirect("/too-fast")

   // Check if the user already exists
   const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
   
   if(existingUser.length > 0) {
      return { success: false, error: "User already exists" };
   }

   const hashedPassword = await hash(password, 10);
   
   try { 
      await db.insert(users).values({
         fullName,
         email,
         password: hashedPassword,
         universityId,
         universityCard,
      });

      await workflowClient.trigger({
         url: `$(config.env.prodApiEndpoint)/api/workflows/onboarding`,
         //method: "POST",
         body: {
            email,
            fullName,
         },
      });

      await signInWithCredentials({email, password});

      return { success: true, error: null };
   } catch (error) {
      console.log(error, "Error while creating user");
      return { success: false, error: "Signup error" };
   }

};

export const signInWithCredentials = async (
   params: Pick<AuthCredentials, "email" | "password">
) => {
   const { email, password } = params;

   const ip = (await headers()).get("x-forwarded-for") || "127.0.0.1";
   const { success } = await ratelimit.limit(ip);
   console.log("IP: ", ip);

   if (!success) return redirect("/too-fast");

   try { 
      const result = await signIn("credentials", {
         email,
         password,
         redirect: false,
      });

      if(result?.error) {
         return { success: false, error: result.error };
      }

      return { success: true, error: null };

   } catch (error) {
      console.log(error, "Error while Signin user");
      return { success: false, error: "Signin error" };
   }
 

   
};
 