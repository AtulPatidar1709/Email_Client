import EmailList from "@/components/Emaillist";
import Loader from "@/components/Loader/page";
import Image from "next/image";
import { Suspense } from "react";

export default function Home() {
  return (
    <Suspense fallback={<Loader />}>
      <div className="w-[95%] sm:w-11/12">
        <EmailList />
      </div>
    </Suspense>
  );
}
