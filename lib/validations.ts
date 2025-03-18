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
 
export const bookSchema = z.object({
   title: z.string().trim().min(2).max(100),
   description: z.string().trim().min(10).max(1000),
   author: z.string().trim().min(2).max(100),
   genre: z.string().trim().min(2).max(50),
   rating: z.coerce.number().min(1).max(5),
   totalCopies: z.coerce.number().int().positive().lte(10000), // lte means less than or equal to
   coverUrl: z.string().nonempty(),
   coverColor: z
     .string()
     .trim()
     .regex(/^#[0-9A-F]{6}$/i), // must be regular expression for valid hexadecimal color
   videoUrl: z.string().nonempty(),
   summary: z.string().trim().min(10),
});