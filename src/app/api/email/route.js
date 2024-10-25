// src/app/api/emails/route.js
import { connectDB } from "@/app/dbconfig/dbconfig"; // Database connection utility
import Email from "@/app/models/Email"; // Email schema

// Database connection
await connectDB();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 5;
    const filter = searchParams.get("filter") || "all";

    // Fetch emails from third-party API
    const thirdPartyEmails = await fetchThirdPartyEmails();

    // Sync with local database
    const localEmails = await syncEmailsWithDatabase(thirdPartyEmails);

    // Filter emails based on the selected filter
    let filteredEmails = localEmails;

    if (filter === "read") {
      filteredEmails = localEmails.filter((email) => email.isRead);
    } else if (filter === "unread") {
      filteredEmails = localEmails.filter((email) => !email.isRead);
    } else if (filter === "favorites") {
      filteredEmails = localEmails.filter((email) => email.isFavorite);
    }

    // Paginate emails
    const totalItems = filteredEmails.length;
    const totalPages = Math.ceil(totalItems / limit);
    const paginatedEmails = filteredEmails.slice(
      (page - 1) * limit,
      page * limit
    );

    return new Response(
      JSON.stringify({
        paginatedEmails,
        totalItems,
        totalPages,
      }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error.message,
        message: "Error in fetching emails",
      }),
      { status: 400 }
    );
  }
}

// Function to fetch emails from third-party API
async function fetchThirdPartyEmails() {
  const response = await fetch("https://flipkart-email-mock.vercel.app/");
  const data = await response.json();

  return data.list; // Return the list of emails
}

// Function to sync third-party emails with your local database
async function syncEmailsWithDatabase(thirdPartyEmails) {
  const emailsWithStatus = [];

  // Check if thirdPartyEmails is an array
  if (!Array.isArray(thirdPartyEmails)) {
    return emailsWithStatus; // Return empty array if not valid
  }

  for (const email of thirdPartyEmails) {
    const name = email.from?.name || "Unknown Name"; // Get name from the email's 'from' field
    const emailAddress = email.from?.email || "unknown@example.com"; // Get email from the email's 'from' field

    // Check if the email exists in the local database
    let localEmail = await Email.findOne({ emailId: email.id });

    if (!localEmail) {
      // If email doesn't exist, create a new one in the database
      localEmail = new Email({
        emailId: email.id, // Match with the API response
        subject: email.subject,
        body: email.short_description, // Use short_description as the email body
        isRead: false, // Initially, emails are unread
        isFavorite: false, // Initially, emails are not favorites
        createdAt: new Date(email.date), // Convert the timestamp to Date object
        email: emailAddress,
        name: name,
      });
      await localEmail.save();
    }

    // Add email data with status to array
    emailsWithStatus.push({
      emailId: localEmail.emailId,
      subject: localEmail.subject,
      body: localEmail.body,
      isRead: localEmail.isRead,
      isFavorite: localEmail.isFavorite,
      createdAt: localEmail.createdAt,
      email: localEmail.email,
      name: localEmail.name,
    });
  }

  return emailsWithStatus;
}
