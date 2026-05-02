import { Outlet } from "react-router-dom";
import SolarHeader from "@/components/SolarHeader";

const SolarLayout = () => (
  <>
    <SolarHeader />
    <Outlet />
  </>
);

export default SolarLayout;
