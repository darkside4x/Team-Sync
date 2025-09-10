export const GOOGLE_AUTH_URL = "/api/auth/google";

export const logout = async () => {
  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include"
    });
    window.location.href = "/";
  } catch (error) {
    console.error("Logout error:", error);
  }
};

export const checkUsername = async (username: string): Promise<boolean> => {
  try {
    const response = await fetch(`/api/users/username/${username}`, {
      credentials: "include"
    });
    const data = await response.json();
    return data.available;
  } catch (error) {
    console.error("Username check error:", error);
    return false;
  }
};
