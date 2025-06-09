import type { FC } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router";
import { selectIsAuthenticated } from "@/features/authSlice";

import { extractRoleFromToken } from "@/utils/extractToken";
import Loading from "./Loading";

const PublicRoute: FC<any> = ({ children, allowedRoles }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const role = extractRoleFromToken();
  if (isAuthenticated === null) {
    return <Loading fullscreen />; 
  }
  if (allowedRoles && (!role || !allowedRoles.includes(role))) {
    return <Navigate to="/unauthorized" replace />;
  }
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default PublicRoute;
