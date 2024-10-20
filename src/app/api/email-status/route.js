import { connectDB } from "../../../dbconfig/dbconfig.js";
import Email from "../../../models/Email.js";

await connectDB();

export async function GET(request) {
  try {
    const emails = await Email.find({});
    return new Response(JSON.stringify(emails), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to fetch emails" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function PATCH(request, response) {
  const { emailId, isRead, isFavorite } = req.body;

  try {
    const updatedEmail = await Email.findOneAndUpdate(
      { emailId },
      { isRead, isFavorite }, // Fields to update
      { new: true, runValidators: true } // Return the updated document and run validators
    );

    if (!updatedEmail) {
      return res
        .status(404)
        .json({ success: false, message: "Email not found" });
    }

    return res.status(200).json({ success: true, email: updatedEmail });
  } catch (error) {
    console.error("Error updating email:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
