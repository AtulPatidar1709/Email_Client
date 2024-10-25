"use client";

import axios from "axios";
import { Suspense, useEffect, useState } from "react";
import EmailBody from "../components/EmailBody.js";
import { formatDate } from "../utils/formatDate.js";
import Loader from "./Loader/page.js";
import Link from "next/link.js";

const EmailList = () => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingBody, setLoadingBody] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [filter, setFilter] = useState("all");
  const [selectedData, setSelectedData] = useState(null);
  const [dataLength, setDataLength] = useState(0);
  const emailsPerPage = 5;
  let timeoutId;

  useEffect(() => {
    const fetchEmails = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `/api/email?page=${currentPage}&limit=${emailsPerPage}&filter=${filter}`
        );
        if (response.status === 200) {
          setDataLength(response.data.totalItems);
          setEmails(response.data.paginatedEmails);
          setTotalPages(Math.ceil(response.data.totalItems / emailsPerPage));
        } else {
          throw new Error("Failed to fetch emails");
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEmails();
    const interval = setInterval(fetchEmails, 10000); // Poll every 10 seconds
    return () => {
      clearInterval(interval);
      clearTimeout(timeoutId); // Clear timeout on unmount
    };
  }, [currentPage, filter]);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleFilterChange = (newFilter) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      setSelectedEmail(null);
      setSelectedData(null);
      setFilter(newFilter);
      setCurrentPage(1); // Reset to the first page when filter changes
    }, 300); // Delay of 300ms
  };

  const handleEmailSelect = async (email) => {
    setLoadingBody(true);
    try {
      const response = await axios.get(`/api/email/${email.emailId}`);
      if (response.status === 200) {
        setSelectedEmail({ ...response.data.email, read: true });
        setEmails((prevEmails) =>
          prevEmails.map((e) =>
            e.emailId === email.emailId ? { ...e, read: true } : e
          )
        );
        setSelectedData({
          id: email.emailId,
          from: email.name,
          email: email.email,
          subject: email.subject,
          date: formatDate(email.createdAt),
          body: response.data.email.body,
        });
      } else {
        setError("Error in fetching single data");
      }
    } catch (error) {
      console.error("Error fetching selected email:", error);
      setError("Failed to fetch the selected email");
    } finally {
      setLoadingBody(false);
    }
  };

  const handleBackToList = () => {
    setSelectedEmail(null);
    setSelectedData(null);
  };

  const filteredEmails = emails.filter((email) => {
    if (filter === "read") {
      return email.isRead;
    }
    if (filter === "unread") {
      return !email.isRead;
    }
    if (filter === "favorites") {
      return email.isFavorite;
    }
    return true;
  });

  if (loading) return <Loader />;
  if (error) return <p>Error: {error}</p>;

  return (
    <Suspense fallback={<Loader />}>
      <header
        className={`flex ${
          selectedEmail ? "hidden md:flex" : "w-full"
        } flex-wrap items-center justify-start mb-4 pt-4 space-x-1`}
      >
        <h4 className="font-semibold">Filter By:</h4>
        {["all", "read", "unread", "favorites"].map((filterType) => (
          <Link
            href="#"
            key={filterType}
            onClick={() => handleFilterChange(filterType)}
            className={`px-4 py-1 mx-1 rounded-full ${
              filter === filterType ? "bg-gray-200 text-black" : ""
            }`}
          >
            {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
          </Link>
        ))}
      </header>

      <main className={`flex flex-col md:flex-row h-screen w-full`}>
        <aside
          className={`flex-grow px-3 gap-4 overflow-y-auto ${
            selectedEmail ? "hidden" : "block"
          }`}
        >
          {filteredEmails.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p>No emails found.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {filteredEmails.map((email) => (
                <div
                  key={email.emailId}
                  className={`p-3 flex gap-4 rounded-lg cursor-pointer shadow-md ${
                    email.isRead ? "bg-gray-100" : "bg-white"
                  } ${
                    selectedEmail?.emailId === email.emailId
                      ? "bg-gray-200"
                      : ""
                  }`}
                  onClick={() => handleEmailSelect(email)}
                >
                  <div className="bg-[#E54065] ml-2 rounded-full h-12 w-12 flex items-center justify-center text-xl font-semibold text-white">
                    {email.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col gap-1">
                    <p>
                      From:{" "}
                      <span className="font-semibold">
                        {email.name} {email.email}
                      </span>
                    </p>
                    <p>
                      Subject:{" "}
                      <span className="font-semibold">{email.subject}</span>
                    </p>
                    <p>{email.body}</p>
                    <div className="flex gap-4">
                      <p>{formatDate(email.createdAt)}</p>
                      {email.isFavorite && (
                        <p className="text-[#E54065] font-semibold">Favorite</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {dataLength > emailsPerPage && (
            <div className="flex justify-center items-center gap-4 mt-4">
              <Link
                href="#"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className="disabled:bg-gray-200 px-4 py-1 bg-red-200 rounded-md"
              >
                Previous
              </Link>
              <span className="font-semibold">
                Page {currentPage} of {totalPages}
              </span>
              <Link
                href="#"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                className="disabled:bg-gray-200 px-4 py-1 bg-red-200 rounded-md"
              >
                Next
              </Link>
            </div>
          )}
        </aside>

        <Suspense fallback={<Loader />}>
          {selectedEmail && selectedData && (
            <div className="flex flex-col flex-grow h-full p-3 border-l border-gray-300">
              <Link
                href="#"
                onClick={handleBackToList}
                className="mb-2 text-blue-500 hover:underline"
              >
                Back to Emails
              </Link>
              <EmailBody
                email={selectedEmail}
                onBack={handleBackToList}
                selectedData={selectedData}
                loading={loadingBody}
              />
            </div>
          )}
        </Suspense>
      </main>
    </Suspense>
  );
};

export default EmailList;
