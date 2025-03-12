import { serve } from "@upstash/workflow/nextjs"
import { sendEmail } from "@/lib/workflow";
import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { eq } from "drizzle-orm";

type UserState = 'non-active' | 'active' | 'banned';

type InitialData = {
  email: string,
  fullName: string,
}

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;
const THREE_DAYS_IN_MS = 3 * ONE_DAY_IN_MS;
const THIRTY_DAYS_IN_MS = 30 * ONE_DAY_IN_MS;

const getUserState = async (email: string): Promise<UserState> => { 

  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (user.length === 0) return 'non-active'; // user is not active.

  const lastActivityDate = new Date(user[0].lastActivityDate!); // by using ! we say to typescript it will be there,
  const currentDate = new Date();
  const timeDifference = currentDate.getTime() - lastActivityDate.getTime();

  if (
    timeDifference > THREE_DAYS_IN_MS &&
    timeDifference <= THIRTY_DAYS_IN_MS
  ) {
    return 'non-active';
  }

  return 'active';

}

export const { POST } = serve<InitialData>(async (context) => {
  const { email, fullName } = context.requestPayload;

  // Welcome email
  await context.run("new-signup", async () => {
    await sendEmail({
      email,
      subject: "Welcome to the platform",
      message: `Welcome to the platform, ${fullName}! We are excited to have you on board.`,
    })
  })

  await context.sleep("wait-for-3-days", 60 * 60 * 24 * 3)

  while (true) {
    const state = await context.run("check-user-state", async () => {
      return await getUserState(email);
    })

    if (state === "non-active") {
      await context.run("send-email-non-active", async () => {
        await sendEmail({
          email,
          subject: "Are you still there ?",
          message: `Hey ${fullName}, we miss you !`,
        })
      })
    } else if (state === "active") {
      await context.run("send-email-active", async () => {
        await sendEmail({
          email, 
          subject: "Welcome back!",
          message: `Hey ${fullName}, welcome back to the platform!`,
        })
      })
    }

    await context.sleep("wait-for-1-month", 60 * 60 * 24 * 30)
  }
})

/* dummy from upstash and we create functions in the nextjs app

async function sendEmail(message: string, email: string) {
  // Implement email sending logic here
  console.log(`Sending ${message} email to ${email}`)
}

type UserState = "non-active" | "active"

const getUserState = async (): Promise<UserState> => {
  // Implement user state logic here
  return "non-active"
}
*/