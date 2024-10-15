"use client";

import { useRouter } from "next/navigation";

export function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      // Call the sign-out API route
      const response = await fetch("/api/auth/signout", { method: "POST" });
      if (response.ok) {
        // Redirect to the home page after successful sign-out
        router.push("/");
      } else {
        console.error("Failed to sign out");
      }
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  };

  return (
    <button
      onClick={handleSignOut}
      className="border border-red-500 hover:bg-red-900 text-white font-bold py-2 px-4 rounded"
    >
      Sign Out
    </button>
  );
}
