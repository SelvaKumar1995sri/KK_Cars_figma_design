import { API } from "./apiConfig";

export async function setUserAsAdmin(userId: string) {
  try {
    const response = await fetch(
      `${API}/set-admin`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      }
    );

    if (response.ok) {
      console.log("User set as admin successfully");
      return true;
    } else {
      console.error("Failed to set user as admin");
      return false;
    }
  } catch (error) {
    console.error("Error setting admin:", error);
    return false;
  }
}
