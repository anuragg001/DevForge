import { SignedIn, SignedOut, SignOutButton, SignUpButton } from "@clerk/nextjs";
import Image from "next/image";

export default function Home() {
  console.log("hello from server side")
  return (
    <div>
      <SignedOut>

        <SignUpButton />
      </SignedOut>

      <SignedIn>
        <SignOutButton />
      </SignedIn>
    </div>
  );
}
