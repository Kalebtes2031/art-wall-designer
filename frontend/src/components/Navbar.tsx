// src/components/Navbar.tsx
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { token, user, logout } = useAuth();

  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => setIsMobileMenuOpen(false), [location]);

  // Shared button classes
  const authBtnClasses =
    "flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:from-blue-600 hover:to-purple-600";

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-white/90 backdrop-blur-md shadow-md py-2 h-[56px]"
          : "bg-[#D7D7D7] py-3 h-[56px]"
      }`}
    >
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-full">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-10 h-10 rounded-xl flex items-center justify-center">
            {/* SVG omitted for brevity */}
          </div>
          <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent transition-all">
            ArtGallery
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center space-x-8">
          <Link
            to="/"
            className={`relative font-medium transition-colors ${
              location.pathname === "/"
                ? "text-blue-600"
                : "text-gray-700 hover:text-blue-500"
            }`}
          >
            Home
            {location.pathname === "/" && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full" />
            )}
          </Link>

          {user?.role === "customer" && (
            <Link
              to="/cart"
              className={`relative font-medium transition-colors ${
                location.pathname === "/cart"
                  ? "text-blue-600"
                  : "text-gray-700 hover:text-blue-500"
              }`}
            >
              Cart
              {location.pathname === "/cart" && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full" />
              )}
            </Link>
          )}
          {user?.role === "customer" && (
            <Link
              to="/orders"
              className={`relative font-medium transition-colors ${
                location.pathname === "/orders"
                  ? "text-blue-600"
                  : "text-gray-700 hover:text-blue-500"
              }`}
            >
              Order
              {location.pathname === "/orders" && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full" />
              )}
            </Link>
          )}
          {user?.role === "admin" && (
            <Link
              to="/admin"
              className={`relative font-medium transition-colors ${
                location.pathname === "/admin"
                  ? "text-blue-600"
                  : "text-gray-700 hover:text-blue-500"
              }`}
            >
              Admin
              {location.pathname === "/admin" && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full" />
              )}
            </Link>
          )}
          {user?.role === "seller" && (
            <Link
              to="/seller"
              className={`relative font-medium transition-colors ${
                location.pathname === "/seller"
                  ? "text-blue-600"
                  : "text-gray-700 hover:text-blue-500"
              }`}
            >
              seller
              {location.pathname === "/seller" && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full" />
              )}
            </Link>
          )}
        </div>

        {/* Auth buttons: Desktop */}
        <div className="hidden md:flex items-center space-x-4">
          {token ? (
            <div className="flex items-center space-x-12">
              <h2 className="font-semibold ">{user?.name} </h2>
              <button onClick={logout} className={authBtnClasses}>
                {/* Logout icon omitted for brevity */}
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className={authBtnClasses}>
                {/* Login icon omitted */}
                Login
              </Link>
              <Link to="/signup" className={authBtnClasses}>
                {/* Signup icon omitted */}
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 rounded-md text-gray-700 hover:text-blue-600 focus:outline-none"
        >
          {isMobileMenuOpen ? (
            /* close icon */
            <svg /* ... */ />
          ) : (
            /* menu icon */
            <svg /* ... */ />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden bg-white shadow-lg rounded-b-xl transition-all duration-300 overflow-hidden ${
          isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Link
            to="/"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              location.pathname === "/"
                ? "bg-blue-50 text-blue-600"
                : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
            }`}
          >
            Home
          </Link>
          {user?.role === "admin" && (
            <Link
              to="/admin"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                location.pathname === "/admin"
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
              }`}
            >
              Admin
            </Link>
          )}
          <div className="pt-4 border-t border-gray-200">
            {token ? (
              <button
                onClick={logout}
                className="w-full px-4 py-2 rounded-md bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium shadow"
              >
                Logout
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block w-full px-4 py-2 rounded-md bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium shadow mb-2"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="block w-full px-4 py-2 rounded-md bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium shadow"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
