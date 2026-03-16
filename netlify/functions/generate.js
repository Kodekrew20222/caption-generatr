export async function handler(event) {
  try {
    const API_KEY = process.env.GEMINI_API_KEY;

    const body = JSON.parse(event.body);

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=" +
        API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    );

    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error("Function Error:", error);

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        error: "Internal server error",
        details: error.message,
      }),
    };
  }
}
