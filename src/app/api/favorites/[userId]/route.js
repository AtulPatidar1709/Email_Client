import { connectDB } from "../../../../dbconfig/dbconfig.js";
import Email from "../../../../models/Email.js";

await connectDB();

export async function GET(req, { params }) {
  const { userId } = params;

  try {
    const favorites = await Email.find({ userId, isFavorite: true });

    return new Response(JSON.stringify(favorites), { status: 200 });
  } catch (error) {
    return new Response(
      JSON.stringify({
        message: "Error fetching favorites",
        error: error.message,
      }),
      { status: 500 }
    );
  }
}

export async function POST(req, { params }) {
  const { userId } = params;
  const { emailId } = await req.json();

  try {
    const result = await Email.findOneAndUpdate(
      { userId, emailId },
      { isFavorite: true },
      { upsert: true, new: true }
    );

    return new Response(
      JSON.stringify({ message: "Favorite status updated", data: result }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        message: "Error updating favorite status",
        error: error.message,
      }),
      { status: 500 }
    );
  }
}
