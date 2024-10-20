import "./globals.css";
import { EmailProvider } from "../context/EmailContext";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex justify-center">
        <EmailProvider>{children}</EmailProvider>
      </body>
    </html>
  );
}
