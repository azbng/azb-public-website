import { Outlet } from "react-router-dom";
import { useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { useSolarUser } from "@/lib/solarAuth";

const Layout = () => {
  const location = useLocation();
  const solarUser = useSolarUser();
  const isSolarPath = location.pathname.startsWith("/subsidiaries/solar");
  const hideMainHeader = isSolarPath && Boolean(solarUser);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {!hideMainHeader ? <Header /> : null}
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
