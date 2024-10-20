import axios from "axios";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  try {
    const response = await axios.get(
      `https://flipkart-email-mock.now.sh/?id=${id}`
    );

    const data = response.data;

    return NextResponse.json(
      {
        success: true,
        message: "Fetched email successfully",
        email: data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching email:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error in fetching email",
      },
      { status: 500 }
    );
  }
}
