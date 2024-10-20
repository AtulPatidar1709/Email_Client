import { formatDate } from "@/utils/formatDate";
import React from "react";

const EmailItem = ({ email, onSelect }) => {
  const from = typeof email.from === "string" ? email.from : "Unknown Sender";
  const date = formatDate(email.date);

  return (
    <div className="w-full max-w-[95%] pt-8 mx-auto">
      {/* Set max width and center it */}
      <article
        className="email-item flex flex-col sm:flex-row items-center p-4 gap-4 bg-white rounded-lg shadow-md border border-[var(--border-color)] hover:shadow-lg transition-shadow duration-200 cursor-pointer"
        onClick={() => onSelect(email)} // Trigger email selection on click
      >
        <div className="bg-[#E54065] rounded-full h-12 w-12 flex items-center justify-center text-xl font-semibold text-[#F4F5F9] mr-4">
          {from.charAt(0)}
        </div>
        <div className="flex-grow">
          {" "}
          {/* Allow this div to grow and take available space */}
          <p className="text-base sm:text-lg font-medium">
            From:{" "}
            <span className="font-bold">
              {email.from.name} &lt;{email.from.email}&gt;
            </span>
          </p>
          <p className="pt-2 text-sm sm:text-base text-[#636363]">
            Subject: <span className="font-bold">{email.subject} </span>
          </p>
          <p className="text-xs sm:text-sm pt-2 text-[#636363]">
            {email.short_description}
          </p>
          <p className="pt-3 text-xs sm:text-sm text-[#636363] font-sans">
            {date}
          </p>
        </div>
      </article>
    </div>
  );
};

export default EmailItem;
