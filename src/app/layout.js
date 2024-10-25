import { EmailProvider } from "@/context/EmailContext";
import "./globals.css";
import { Suspense } from "react";
import Loader from "@/components/Loader/page";

export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Suspense fallback={<Loader />}>
          <EmailProvider>{children}</EmailProvider>
        </Suspense>
      </body>
    </html>
  );
}
