import z from "zod";

export interface CustomJwtSessionClaims {
    metadata?: {
        role?: "user" | "admin";
    }
}

export const UserFormSchema = z.object({
  firstName: z
    .string({ message: "First name is required!" })
    .min(2, { message: "First name must be at least 2 characters!" })
    .max(100, { message: "First name must be less than 100 characters!" }),
  lastName: z
    .string({ message: "Last name is required!" })
    .min(2, { message: "Last name must be at least 2 characters!" })
    .max(100, { message: "Last name must be less than 100 characters!" }),
  username: z
    .string({ message: "Username is required!" })
    .min(2, { message: "Username must be at least 2 characters!" })
    .max(100, { message: "Username must be less than 100 characters!" }),
  emailAddress: z.array(z.string({ message: "Invalid email address!" })),
  password: z
  .string( { message: "Password is required!" })
  .min(8, { message: "Password must be at least 8 characters!" })
  .max(50, { message: "Password must be less than 50 characters!" }),
});