import { Outlet } from "react-router-dom";
import { Navbar } from "./components/layout/Navbar";
import { BackToTop, Footer, GlobalStyles } from "./MainPage";



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