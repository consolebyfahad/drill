import { BASE_URL } from "~/config";

// Generic API call function
export const apiCall = async (payload, method = "POST") => {
  try {
    console.log("📡 API Request:", { url: BASE_URL, method, payload });

    const response = await fetch(BASE_URL, {
      method,
      body: payload,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong");
    }

    console.log("✅ API Response:", JSON.stringify(data));
    return data;
  } catch (error) {
    console.log("📡 API Request:", { BASE_URL });
    console.error("❌ API Error:", error.message);
    throw error;
  }
};
