import { connectDB } from "@/app/dbconfig/dbconfig";
import Email from "@/app/models/Email";

await connectDB();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 5;
    const filter = searchParams.get("filter") || "all";

    // Fetch emails directly from the database
    const data = await Email.find({});

    // Filter emails based on the selected filter

    let filteredEmails;

    if (filter === "read") {
      filteredEmails = await Email.find({ isRead: true });
    } else if (filter === "unread") {
      filteredEmails = await Email.find({ isRead: false });
    } else if (filter === "favorites") {
      filteredEmails = await Email.find({ isFavorite: true });
    } else {
      filteredEmails = await Email.find({});
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
