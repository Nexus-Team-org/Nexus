import { jwtDecode } from "jwt-decode";

export const extractRoleFromToken = () => {
  const token = localStorage.getItem("ga6");
  if (token) {
    const decoded = jwtDecode(token);
    //@ts-ignore
    return decoded.role;
  }
};
