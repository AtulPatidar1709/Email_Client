import EmailList from "../components/Emaillist.js";
import Loader from "../components/Loader/page.js";
import Image from "next/image";

export default function Home() {
  return (
    <div className="w-[95%]">
      <EmailList />
    </div>
  );
}
