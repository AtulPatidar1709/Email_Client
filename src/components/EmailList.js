"use client";

import axios from "axios";
import { Suspense, useEffect, useState } from "react";
import EmailBody from "../components/EmailBody.js";
import { formatDate } from "../utils/formatDate.js";

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

  const emailsPerPage = 5;

  useEffect(() => {
    const fetchEmails = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/allmails?page=${currentPage}&limit=${emailsPerPage}`
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        if (Array.isArray(data.paginatedEmails)) {
          setEmails(data.paginatedEmails);
          // Adjust totalPages logic based on the total count received from the response
          setTotalPages(
            data.totalItems ? Math.ceil(data.totalItems / emailsPerPage) : 1
          );
        } else {
          throw new Error("Data structure is not as expected");
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEmails();
  }, [currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleEmailSelect = async (email) => {
    setLoadingBody(true);
    try {
      const response = await axios.get(`/api/emailid?id=${email.id}`);
      if (response.data.success) {
        setSelectedEmail({ ...response.data.email, read: true });
        setEmails((prevEmails) =>
          prevEmails.map((e) => (e.id === email.id ? { ...e, read: true } : e))
        );
        setSelectedData({
          id: email.id,
          from: email.from.name,
          email: email.from.email,
          subject: email.subject,
          date: formatDate(email.date),
          body: response.data.email.body,
        });
      } else {
        throw new Error(response.data.error);
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
      return email.read;
    }
    if (filter === "unread") {
      return !email.read;
    }
    return true;
  });

  if (loading) return <span className="loader"></span>;

  if (error) return <p>Error: {error}</p>;

  return (
    <Suspense>
      <header
        className={`flex ${
          selectedEmail ? "hidden md:flex" : "w-full"
        }  flex-wrap items-center justify-start mb-4 pt-4 space-x-4`}
      >
        <h4 className="font-semibold"> From:</h4>
        <button
          onClick={() => {
            setSelectedEmail(null);
            setSelectedData(null);
            setFilter("all");
          }}
          className={`px-4 py-1 mx-1 rounded-full ${
            filter === "all" ? "bg-gray-200 text-black" : ""
          }`}
        >
          All
        </button>
        <button
          onClick={() => {
            setSelectedEmail(null);
            setSelectedData(null);
            setFilter("read");
          }}
          className={`px-6 py-1 mx-2 rounded-full ${
            filter === "read" ? "bg-gray-200 text-black" : ""
          }`}
        >
          Read
        </button>
        <button
          onClick={() => {
            setSelectedEmail(null);
            setSelectedData(null);
            setFilter("unread");
          }}
          className={`px-6 py-1 mx-2 rounded-full ${
            filter === "unread" ? "bg-gray-200 text-black" : ""
          }`}
        >
          Unread
        </button>
      </header>

      <main
        className={` ${
          selectedEmail ? "justify-between gap-4" : "w-full"
        }  pt-3 mx-auto h-screen flex flex-col md:flex-row`}
      >
        {/* Email List Section */}
        <section
          className={`transition-width duration-300 ease-in-out ${
            selectedEmail ? "" : "w-full"
          }`}
        >
          <ul
            className={`${
              selectedEmail
                ? "hidden md:flex flex-col overflow-x-auto"
                : "w-full"
            }`}
          >
            {filteredEmails.length > 0 ? (
              filteredEmails.map((email) => (
                <li
                  key={email.id}
                  className={`mb-4 ${email.read ? "bg-gray-100" : "bg-white"}`}
                >
                  <article
                    onClick={() => handleEmailSelect(email)}
                    className="flex flex-col md:flex-row items-center p-4 gap-4 rounded-lg shadow-md border hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                  >
                    <div className="bg-[#E54065] rounded-full h-12 w-12 flex items-center justify-center text-xl font-semibold text-white">
                      {email.from.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-grow text-center md:text-left">
                      <p className="text-lg font-medium">
                        From:{" "}
                        <span className="font-bold">
                          {email.from.name} &lt;{email.from.email}&gt;
                        </span>
                      </p>
                      <p className="pt-2 text-base">
                        Subject:{" "}
                        <span className="font-bold">{email.subject}</span>
                      </p>
                      <p className="text-base pt-2">
                        {email.short_description}
                      </p>
                      <p className="pt-2">{formatDate(email.date)}</p>
                    </div>
                  </article>
                </li>
              ))
            ) : (
              <p>No emails available.</p>
            )}
          </ul>
          {!loading && totalPages > 1 ? (
            <nav
              className={`flex justify-center mt-4 ${
                selectedEmail ? "hidden md:flex" : "w-full"
              }`}
            >
              <button
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className="px-4 py-2 mx-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="mx-2">{`Page ${currentPage} of ${totalPages}`}</span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                className="px-4 py-2 mx-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
              >
                Next
              </button>
            </nav>
          ) : null}
        </section>

        {/* Email Body Section */}
        {selectedEmail && (
          <section className="w-full flex flex-col transition-width duration-300 ease-in-out">
            <button
              onClick={handleBackToList}
              className="w-fit mb-4 p-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Back to Email List
            </button>
            {loadingBody ? (
              <div className="flex justify-center items-center">
                <span className="loader"></span>
              </div>
            ) : selectedData ? (
              <EmailBody email={selectedEmail} selectedData={selectedData} />
            ) : null}
          </section>
        )}
      </main>
    </Suspense>
  );
};

export default EmailList;
