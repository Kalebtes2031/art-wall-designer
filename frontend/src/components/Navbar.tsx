// src/components/Navbar.tsx
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FiUser } from 'react-icons/fi';


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
    "flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-gray-500 to-gray-200 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-102 hover:from-gray-200 hover:to-gray-500";

  return (
    <nav
      className={`fixed inset-x-0 top-0 border-b-1 border-b-gray-300 z-50 transition-all duration-500 ${isScrolled
          ? "b-white/90 bg-[#D7D7D7]  backdrop-blur-md  py-2 h-[56px]"
          : "bg-gradient-to-tr from-[#001842] via-[#1c3c74] to-[#5E89B3] py-3 h-[65px]"
        }`}
    >
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-full">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="bg-ay-400 w-12 h-12 rounded-full flex items-center justify-center">
            {/* SVG omitted for brevity */}
            <img
              src="/artlogo.jpg"
              alt="ArtGallery Logo"
              className="w-full h-full rounded-full object-cover"
            />
          </div>
          <span className="font-display font-bold text-xl bg-gradient-to-r from-gray-50 via-gray-300 to-gray-500 bg-clip-text text-transparent transition-all">
            ArtGallery
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden transition-all duration-300 md:flex items-center space-x-18">
          <Link
            to="/"
            className={`relative font-medium transition-all duration-300 ${location.pathname === "/"
                ? "text-gray-100 text-[17px] font-bold"
                : "text-white hover:text-gray-300"
              }`}
          >
            Home
            {location.pathname === "/" && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white rounded-full" />
            )}
          </Link>

          {user?.role === "customer" && (
            <Link
              to="/cart"
              className={`relative font-medium transition-colors ${location.pathname === "/cart"
                  ? "text-gray-100 text-[17px] font-bold"
                : "text-white hover:text-gray-300 "
                }`}
            >
              Cart
              {location.pathname === "/cart" && (
                <span className="absolute bottom-0 left-0 w-full h-0.5  bg-white  rounded-full" />
              )}
            </Link>
          )}
          {user?.role === "customer" && (
            <Link
              to="/orders"
              className={`relative font-medium transition-colors ${location.pathname === "/orders"
                  ? "text-gray-100 text-[17px] font-bold"
                : "text-white hover:text-gray-300"
                }`}
            >
              Order
              {location.pathname === "/orders" && (
                <span className="absolute bottom-0 left-0 w-full h-0.5  bg-white  rounded-full" />
              )}
            </Link>
          )}
          {user?.role === "admin" && (
            <Link
              to="/admin"
              className={`relative font-medium transition-colors ${location.pathname === "/admin"
                  ? "text-gray-100 text-[17px] font-bold"
                : "text-white hover:text-gray-300"
                }`}
            >
              Admin
              {location.pathname === "/admin" && (
                <span className="absolute bottom-0 left-0 w-full h-0.5  bg-white  rounded-full" />
              )}
            </Link>
          )}
          {user?.role === "seller" && (
            <Link
              to="/seller"
              className={`relative font-medium transition-colors ${location.pathname === "/seller"
                 ? "text-gray-100 text-[17px] font-bold"
                : "text-white hover:text-gray-300"
                }`}
            >
              seller
              {location.pathname === "/seller" && (
                <span className="absolute bottom-0 left-0 w-full h-0.5  bg-white  rounded-full" />
              )}
            </Link>
          )}
        </div>

        {/* Auth buttons: Desktop */}
        <div className="hidden md:flex items-center space-x-4">
          {token ? (
            <div className="flex items-center space-x-6">
              {/* PROFILE LINK - NEW ADDITION */}
              <Link
                to="/profile"
                className={`relative group flex flex-col items-center px-3 py-1 rounded-lg transition-all ${location.pathname === "/profile"
                    ? "bg-gradient-to-br from-blue-50 to-purple-50 ring-1 ring-blue-200"
                    : "hover:bg-gray-50"
                  }`}
              >
                <div className="flex items-center space-x-2">
                  {user?.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    // <div className="bg-gray-200 border-2 border-dashed rounded-xl w-8 h-8 flex items-center justify-center text-xs font-bold text-gray-500">
                    //   {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    // </div>
                    <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-gray-300 flex items-center justify-center">
                      <FiUser className="w-4 h-4 text-gray-500" />
                    </div>
                  )}
                  <span className={`font-medium ${location.pathname === '/profile' ? "text-[#1c3c74]":"text-gray-100"} group-hover:text-[#1c3c74] transition-colors`}>
                    {user?.name}
                  </span>
                </div>
                {location.pathname === "/profile" && (
                  <span className="absolute -bottom-1.5 w-8/12 h-1 text-[#1c3c74]  bg-gray-200  rounded-full" />
                )}
              </Link>

              <button
                onClick={logout}
                className={`${authBtnClasses} px-4 py-1.5 text-sm`}
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className={authBtnClasses}>
                Login
              </Link>
              <Link to="/signup" className={authBtnClasses}>
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
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden bg-white shadow-lg rounded-b-xl transition-all duration-300 overflow-hidden ${isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Link
            to="/"
            className={`block px-3 py-2 rounded-md text-base font-medium ${location.pathname === "/"
                ? "bg-blue-50 text-blue-600"
                : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
              }`}
          >
            Home
          </Link>
          {user?.role === "customer" && (
            <Link
              to="/cart"
              className={`block px-3 py-2 rounded-md text-base font-medium ${location.pathname === "/cart"
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                }`}
            >
              Cart
            </Link>
          )}
          {user?.role === "customer" && (
            <Link
              to="/orders"
              className={`block px-3 py-2 rounded-md text-base font-medium ${location.pathname === "/orders"
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                }`}
            >
              Orders
            </Link>
          )}
          {user?.role === "admin" && (
            <Link
              to="/admin"
              className={`block px-3 py-2 rounded-md text-base font-medium ${location.pathname === "/admin"
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                }`}
            >
              Admin
            </Link>
          )}
          {user?.role === "seller" && (
            <Link
              to="/seller"
              className={`block px-3 py-2 rounded-md text-base font-medium ${location.pathname === "/seller"
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                }`}
            >
              Seller
            </Link>
          )}

          {/* PROFILE LINK FOR MOBILE - NEW ADDITION */}
          {token && (
            <Link
              to="/profile"
              className={`block px-3 py-2 rounded-md text-base font-medium ${location.pathname === "/profile"
                  ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 border-l-4 border-blue-500"
                  : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                }`}
            >
              <div className="flex items-center space-x-3">
                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-8 h-8 flex items-center justify-center text-xs font-bold text-gray-500">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <span>My Profile</span>
              </div>
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