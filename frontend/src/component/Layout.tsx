import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

export default function Layout() {
  return (
    <div className="flex flex-col h-screen">
      <header className="bg-gradient-to-r from-neutral-600 to-stone-500 text-white shadow-lg  ">
        <Header />
      </header>

      <main className="  ">
        <Outlet />
      </main>

      <footer className="   mt-auto ">
        <Footer />
      </footer>
    </div>
  );
}
