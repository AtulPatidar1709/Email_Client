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
