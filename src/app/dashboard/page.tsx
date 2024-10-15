import Link from "next/link";
import { SearchForm } from "@/components/SearchForm";
import { SignOutButton } from "@/components/SignOutButton";
import { TopTracks } from "@/components/TopTracks";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-green-400">Tindify</h1>
          <SignOutButton />
        </div>
        <div className="mb-8 flex justify-end ">
          <Link
            href="/tindify"
            className=" hover:bg-green-900 border border-green-400 text-white font-bold py-3 px-6 rounded-full inline-block transition duration-300 ease-in-out transform hover:scale-105"
          >
            Try Tindify
          </Link>
        </div>

        <div className="">
          <TopTracks />
        </div>
      </div>
    </main>
  );
}
