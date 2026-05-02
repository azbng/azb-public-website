import { Navigate, useLocation } from "react-router-dom";
import { useSolarUser } from "@/lib/solarAuth";

const SolarRequireAuth = ({ children, admin = false }: { children: React.ReactNode; admin?: boolean }) => {
  const user = useSolarUser();
  const location = useLocation();
  if (!user) return <Navigate to="/subsidiaries/solar/auth" replace state={{ from: location.pathname }} />;
  if (admin && user.role !== "admin") return <Navigate to="/subsidiaries/solar/dashboard" replace />;
  return <>{children}</>;
};

export default SolarRequireAuth;
