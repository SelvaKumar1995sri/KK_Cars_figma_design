import { projectId, publicAnonKey } from "/utils/supabase/info";

export async function setUserAsAdmin(userId: string) {
  try {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-d0c59136/set-admin`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicAnonKey}`,
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
