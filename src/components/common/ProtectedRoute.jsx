import { Navigate, Outlet } from "react-router-dom";
import { getRole, getToken } from "../../utils/authStorage";

export default function ProtectedRoute({ requiredRole }) {
  const token = getToken();
  const role = getRole();

  console.log("========== AUTH CHECK ==========");
  console.log("Token exists:", !!token);
  console.log("Role:", role);
  console.log("Required role:", requiredRole);
  console.log("================================");

  // User is not authenticated
  if (!token) {
    console.log("❌ No token found. Redirecting to login.");
    return <Navigate to="/login" replace />;
  }

  // Normalize both roles
  const normalizedRole = role
    ?.replace(/^ROLE_/i, "")
    .toLowerCase();

  const normalizedRequiredRole = requiredRole
    ?.replace(/^ROLE_/i, "")
    .toLowerCase();

  console.log("Normalized role:", normalizedRole);
  console.log("Normalized required role:", normalizedRequiredRole);

  // User has the wrong role
  if (
    normalizedRequiredRole &&
    normalizedRole !== normalizedRequiredRole
  ) {
    console.log("❌ Role mismatch.");

    return (
      <Navigate
        to={
          normalizedRole === "admin"
            ? "/admin/dashboard"
            : "/student/dashboard"
        }
        replace
      />
    );
  }

  console.log("✅ Protected route passed.");

  return <Outlet />;
}