import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  getUserCompanions,
  getUserSessions,
  getBookmarkedCompanions,
} from "@/lib/actions/companion.actions";
import Image from "next/image";
import CompanionsList from "@/components/CompanionsList";

const Profile = async () => {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const companions = await getUserCompanions(user.id);
  const sessionHistory = await getUserSessions(user.id);
  const bookmarkedCompanions = await getBookmarkedCompanions(user.id);

  return (
      <main className="w-full max-w-5xl mx-auto px-4 py-8 space-y-10">
        {/* Profile Card */}
        <section className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 rounded-xl shadow-md bg-gradient-to-r from-[#fdfbfb] to-[#ebedee]">
          <div className="flex items-center gap-4">
            <Image
                src={user.imageUrl}
                alt="user profile"
                width={100}
                height={100}
                className="rounded-full border border-gray-300"
            />
            <div>
              <h1 className="text-2xl font-bold">{user.firstName} {user.lastName}</h1>
              <p className="text-sm text-muted-foreground">{user.emailAddresses[0].emailAddress}</p>
            </div>
          </div>

          <div className="flex gap-4">
            {/* Stats Cards */}
            <div className="bg-white border shadow-sm rounded-lg px-4 py-3 text-center">
              <p className="text-xl font-bold">{sessionHistory.length}</p>
              <p className="text-sm text-gray-500">Lessons Completed</p>
            </div>
            <div className="bg-white border shadow-sm rounded-lg px-4 py-3 text-center">
              <p className="text-xl font-bold">{companions.length}</p>
              <p className="text-sm text-gray-500">Companions Created</p>
            </div>
          </div>
        </section>

        {/* Accordion */}
        <Accordion type="multiple" className="space-y-4">
          <AccordionItem value="bookmarks">
            <AccordionTrigger className="text-xl font-semibold rounded-md bg-gray-100 px-4 py-3">
              Bookmarked Companions ({bookmarkedCompanions.length})
            </AccordionTrigger>
            <AccordionContent className="bg-white p-4 rounded-md shadow">
              <CompanionsList
                  companions={bookmarkedCompanions}
                  title="Bookmarked Companions"
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="recent">
            <AccordionTrigger className="text-xl font-semibold rounded-md bg-gray-100 px-4 py-3">
              Recent Sessions
            </AccordionTrigger>
            <AccordionContent className="bg-white p-4 rounded-md shadow">
              <CompanionsList
                  companions={sessionHistory}
                  title="Recent Sessions"
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="companions">
            <AccordionTrigger className="text-xl font-semibold rounded-md bg-gray-100 px-4 py-3">
              My Companions ({companions.length})
            </AccordionTrigger>
            <AccordionContent className="bg-white p-4 rounded-md shadow">
              <CompanionsList
                  companions={companions}
                  title="My Companions"
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </main>
  );
};

export default Profile;
