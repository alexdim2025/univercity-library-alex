import { z } from "zod";

export const signUpSchema = z.object({
   fullName: z.string().min(3), // we dont use camelcase because we will store it in database as fullname
   email: z.string().email(),
   universityId: z.coerce.number(), // it will take string and convert it to number
   universityCard: z.string().nonempty("University Card is required"),
   password: z.string().min(8),
});

export const signInSchema = z.object({
   email: z.string().email(),
   password: z.string().min(8),
});
 