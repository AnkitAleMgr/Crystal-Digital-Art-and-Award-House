import { Outlet } from "react-router-dom";
import { Navbar } from "./components/layout/Navbar";
import { GlobalStyles } from "../client/components/layout/globalStyle";
import { BackToTop} from "../client/components/layout/BackToTop";
import { Footer } from "./components/layout/Footer";



export default function Layout() {
  return (
    <>
      <GlobalStyles />

      <Navbar />

      <main>
        <Outlet />
      </main>

      <Footer/>

      <BackToTop />
    </>
  );
}