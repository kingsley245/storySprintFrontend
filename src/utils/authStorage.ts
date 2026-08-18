const TOKEN_KEY = "token";
const ROLE_KEY = "role";
const USER_KEY = "user";

export const getToken = (): string | null => {
  return (
    sessionStorage.getItem(TOKEN_KEY) ||
    localStorage.getItem(TOKEN_KEY)
  );
};

export const getRole = (): string | null => {
  return (
    sessionStorage.getItem(ROLE_KEY) ||
    localStorage.getItem(ROLE_KEY)
  );
};

export const getUser = () => {
  const user =
    sessionStorage.getItem(USER_KEY) ||
    localStorage.getItem(USER_KEY);

  if (!user) {
    return null;
  }

  try {
    return JSON.parse(user);
  } catch {
    return null;
  }
};

export const saveAuth = (
  token: string,
  user: any,
  rememberMe: boolean
) => {
  clearAuth();

  const storage = rememberMe
    ? localStorage
    : sessionStorage;

  const role = user?.role
    ?.replace(/^ROLE_/i, "")
    .toLowerCase() || "student";

  storage.setItem(TOKEN_KEY, token);
  storage.setItem(ROLE_KEY, role);
  storage.setItem(USER_KEY, JSON.stringify(user));

  console.log("========== SAVE AUTH ==========");
  console.log("Remember Me:", rememberMe);
  console.log(
    "Storage:",
    rememberMe ? "localStorage" : "sessionStorage"
  );
  console.log("Role:", role);
  console.log("Token exists:", !!token);
  console.log("===============================");
};

export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(USER_KEY);

  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(ROLE_KEY);
  sessionStorage.removeItem(USER_KEY);
};