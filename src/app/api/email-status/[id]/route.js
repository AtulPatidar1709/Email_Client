import { connectDB } from "../../../../dbconfig/dbconfig.js";
import axios from "axios";
import Email from "../../../../models/Email.js";

await connectDB();

export async function POST(req) {
  const { isFavorite, id } = await req.json();

  try {
    const thirdPartyAPIUrl = `https://flipkart-email-mock.now.sh/?id=${id}`;
    const thirdPartyEmailData = await axios.get(thirdPartyAPIUrl);

    if (!thirdPartyEmailData.data) {
      return new Response(
        JSON.stringify({ message: "Email not found in third-party API" }),
        { status: 404 }
      );
    }

    // Check if the email already exists in the database
    const existingEmail = await Email.findOne({ emailId: id });

    // Determine whether to set isRead to true
    const isRead = existingEmail && existingEmail.isRead ? true : true;

    const result = await Email.findOneAndUpdate(
      { emailId: id },
      {
        $set: {
          isRead: isRead,
          isFavorite: isFavorite !== undefined ? isFavorite : false,
          emailData: thirdPartyEmailData.data,
        },
      },
      { upsert: true, new: true }
    );

    return new Response(
      JSON.stringify({
        message: "Email status updated successfully",
        data: {
          email: thirdPartyEmailData.data,
          status: result,
        },
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
  const userId = url.pathname.split("/").pop(); // Extract userId from the path
  const type = url.searchParams.get("type");

  try {
    const email = await Email.findOne({ emailId: userId });

    if (!email) {
      return new Response(JSON.stringify({ message: "Email not found" }), {
        status: 404,
      });
    }

    // Return data based on the type of request
    if (type === "favorite") {
      return new Response(JSON.stringify({ isFavorite: email.isFavorite }), {
        status: 200,
      });
    } else if (type === "read") {
      return new Response(JSON.stringify({ isRead: email.isRead }), {
        status: 200,
      });
    } else {
      return new Response(JSON.stringify({ message: "Invalid request type" }), {
        status: 400,
      });
    }
  } catch (error) {
    return new Response(
      JSON.stringify({
        message: "Error fetching email status",
        error: error.message,
      }),
      { status: 500 }
    );
  }
}
