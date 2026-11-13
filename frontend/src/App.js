import { useEffect } from "react";
import { Routes, Route, useLocation, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BackdropFX } from "@/components/fx";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Services from "@/pages/Services";
import Portfolio from "@/pages/Portfolio";
import Contact from "@/pages/Contact";
import Career from "@/pages/Career";
import WelcomePopup from "@/components/WelcomePopup";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (window.__lenis) {
      window.__lenis.scrollTo(0, { immediate: true, force: true });
    }
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function NotFound() {
  useEffect(() => {
    document.title = "Page Not Found | Godavari Wave Technologies";
  }, []);
  return (
    <section className="flex min-h-[70vh] items-center pt-24">
      <div className="container-gwt text-center">
        <p className="eyebrow justify-center">404</p>
        <h1 className="mt-4 font-display text-4xl font-bold text-white sm:text-5xl">
          This page drifted <span className="text-gradient">offshore</span>
        </h1>
        <p className="mx-auto mt-4 max-w-md text-slate-400">
          The page you are looking for doesn&apos;t exist. Let&apos;s get you back to calm waters.
        </p>
        <Link
          to="/"
          data-testid="notfound-home-button"
          className="mt-8 inline-flex rounded-full bg-gradient-to-r from-[#087BFF] to-[#00C8FF] px-7 py-3.5 text-sm font-semibold text-white"
        >
          Back to Home
        </Link>
      </div>
    </section>
  );
}

export default function App() {
  return (
    <div className="relative min-h-screen overflow-x-hidden font-body text-slate-200">
      <BackdropFX />
      <ScrollToTop />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/career" element={<Career />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <WelcomePopup />
    </div>
  );
}
