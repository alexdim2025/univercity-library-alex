import BookList from "@/components/BookList";
import BookOverview from "@/components/BookOverview";
//import { sampleBooks } from "@/constants";
//import { users } from "@/database/schema";
import { db } from "@/database/drizzle";
import { auth } from "@/auth";
import { books } from "@/database/schema";
import { desc } from "drizzle-orm";

const Home = async () => {

  const session = await auth();

  const latestBooks = (await db
    .select()
    .from(books)
    .limit(10)
    .orderBy(desc(books.createdAt))) as Book[];  
  
  //const result = await db.select().from(users);
  //console.log(JSON.stringify(result, null, 2));
 
  return (
    <>
      <BookOverview {...latestBooks[0]} userId={ session?.user?.id as string } /> 
      <BookList
        title="Latest Books"
        books={latestBooks.slice(1)}
        containerClassName="mt-28"
      /> 
    </>
  );
}

export default Home;
