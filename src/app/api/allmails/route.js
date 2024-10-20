// src/app/api/allmails/route.js
import axios from "axios";
import { NextResponse } from "next/server";

import { connectDB } from "../../../dbconfig/dbconfig";

connectDB();
export async function GET(request) {
  try {
    const url = new URL(request.url);
    const page = Math.max(parseInt(url.searchParams.get("page")) || 1, 1);
    const limit = Math.max(parseInt(url.searchParams.get("limit")) || 6, 1);
    const filter = url.searchParams.get("filter") || "all"; // Get filter from query
    const skip = (page - 1) * limit;

    const response = await axios.get("https://flipkart-email-mock.vercel.app/");
    let emails = response.data.list;

    if (filter === "read") {
      emails = emails.filter((email) => email.read === true);
    } else if (filter === "unread") {
      emails = emails.filter((email) => email.read === false);
    }

    const totalItems = emails.length;
    const paginatedEmails = emails.slice(skip, skip + limit);

    return NextResponse.json(
      {
        success: true,
        message: "Fetched emails successfully",
        paginatedEmails,
        totalItems,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching emails:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error in fetching emails",
      },
      { status: 500 }
    );
  }
}
