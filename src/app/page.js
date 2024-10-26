import EmailList from "../components/Emaillist.js";
import Loader from "../components/Loader/page.js";
import Image from "next/image";
import { Suspense } from "react";

export default function Home() {
  return (
    <Suspense fallback={<Loader />}>
      <div className="w-[95%]">
        <EmailList />
      </div>
    </Suspense>
  );
}
