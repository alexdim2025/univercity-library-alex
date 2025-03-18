import { ReactNode } from 'react';
import Header from '@/components/Header';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { after } from 'next/server';
import { eq } from 'drizzle-orm';
import { users } from '@/database/schema';
import { db } from '@/database/drizzle';

const Layout = async ({ children } : {children: ReactNode}) => {

   const session = await auth();
   if (!session) redirect("/sign-in");

   after(async () => { // non blocking UI.
      if (!session?.user?.id) return;

      // get the user and see if last activity date is today
      const user = await db
         .select()
         .from(users)
         .where(eq(users.id, session?.user?.id))
         .limit(1);
      
      if(user[0].lastActivityDate === new Date().toISOString().slice(0, 10)) return;   
      
      await db
      .update(users)
      .set({ lastActivityDate: new Date().toISOString().slice(0, 10) })
      .where(eq(users.id, session?.user?.id));
   });

  return (
     <main className="root-container">
        <div className="mx-auto max-w-7xl">
           <Header session={session} />
           <div className="mt-20 pb-20">{children}</div>
        </div>
    </main>
  )
}

export default Layout