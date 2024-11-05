import { connectDB } from "../../../../app/dbconfig/dbconfig.js";
import axios from "axios";
import Email from "../../../../app/models/Email.js";

await connectDB();

export async function POST(req) {
  try {
    const { id, isRead, isFavorite } = await req.json();

    // Find and update the email in the database
    const existingEmail = await Email.findOneAndUpdate(
      { emailId: id },
      {
        $set: {
          isRead: isRead !== undefined ? true : true,
          isFavorite: isFavorite !== undefined ? isFavorite : false,
        },
      },
      { upsert: true, new: true }
    );

    return new Response(
      JSON.stringify({
        message: "Email status updated successfully",
        data: existingEmail,
      }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        message: "Error updating email status",
        error: error.message,
      }),
      { status: 500 }
    );
  }
}

export async function GET(req) {
  const url = new URL(req.url);
  const emailId = url.pathname.split("/").pop();

  try {
    const thirdPartyAPIUrl = `https://flipkart-email-mock.now.sh/?id=${emailId}`;
    const thirdPartyEmailData = await axios.get(thirdPartyAPIUrl);

    if (!thirdPartyEmailData.data) {
      return new Response(
        JSON.stringify({ message: "Email not found in third-party API" }),
        { status: 404 }
      );
    }

    const existingEmail = await Email.findOne({ emailId });

    const isRead = existingEmail && existingEmail.isRead ? true : true;

    const result = await Email.findOneAndUpdate(
      { emailId },
      {
        $set: {
          isRead: isRead,
        },
      },
      { upsert: true, new: true }
    );

    return new Response(
      JSON.stringify({
        message: "Email fetched and status updated successfully",
        email: thirdPartyEmailData.data,
      }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        message: "Error fetching email",
        error: error.message,
      }),
      { status: 500 }
    );
  }
}
