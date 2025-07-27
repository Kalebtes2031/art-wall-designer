// frontend/src/pages/Login.tsx
import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";


declare const google: any;

// Add type for Google credential response
type CredentialResponse = {
  credential: string;
  select_by?: string;
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  // const [rememberMe, setRememberMe] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Auto-focus email field on mount
  // useEffect(() => {
  //   emailRef.current?.focus();
  // }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      animateInputError();
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      const { token, user } = res.data;
      login(token, user);

      // Smooth transition before navigation
      await new Promise((resolve) => setTimeout(resolve, 300));

      switch (user.role) {
        case "admin":
          navigate("/admin");
          break;
        case "seller":
          navigate("/seller");
          break;
        default:
          navigate("/");
      }
    } catch (err) {
      console.error("Login error:", err);
      animateInputError();
    } finally {
      setLoading(false);
    }
  };

  const googleButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    /* global google */
    google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: async (response: CredentialResponse) => {
        const idToken = response.credential;
        if (!idToken) return;

        try {
          const { data } = await api.post("auth/google", { idToken });
          login(data.token, data.user);
          toast.success("Welcome via Google!");
          navigate(data.user.role === "admin" ? "/admin" : "/");
        } catch {
          toast.error("Google login failed");
        }
      },
    });

    google.accounts.id.renderButton(googleButtonRef.current!, {
      text: "continue_with",
      shape: "circle",
      theme: "filled_blue",
      size: "large",
      // logo_alignment: "center",
    });
  }, []);

  const animateInputError = () => {
    [emailRef, passwordRef].forEach((ref) => {
      ref.current?.animate(
        [
          { transform: "translateX(0)", borderColor: "#e53e3e" },
          { transform: "translateX(-5px)" },
          { transform: "translateX(5px)" },
          { transform: "translateX(0)" },
        ],
        {
          duration: 400,
          iterations: 1,
        }
      );
    });
  };

  const handleDemoLogin = (role: "admin" | "seller" | "customer") => {
    setEmail(`${role}@example.com`);
    setPassword("demoPassword123");
  };

  return (
    <div className="h-screen md:px-8 md:pt-[80px] flex items-center justify-center bg-gradient-to-br from-gray-900 to-indigo-900 p-4">
      <div className="w-full max-w-5xl flex flex-col lg:flex-row bg-white/5 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden">
        {/* Left Panel - Branding */}
         <div className="hidden md:flex w-full md:w-1/2 bg-gradient-to-br from-indigo-900 to-purple-900 relative overflow-hidden">
          {/* <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1598300054756-e11c48c07ef5?auto=format&fit=crop&w=800&q=80')] bg-cover bg-center mix-blend-overlay opacity-40"></div> */}

          <div className="relative z-10 p-12 w-full flex flex-col justify-center items-center">
            <div className="flex flex-col items-center justify-center">
              <div className="w-24 h-24 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center mb-8">
                {/* <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4-4 4 4m0 0l4-4 4 4m-4-4V4m0 0H8m4 0v4"
                  />
                </svg> */}
                <div>
                  <img 
                    src="/artlogo.jpg"
                    className="h-20 w-20 object-cover rounded-full shadow-lg"
                  />
                </div>
              </div>
              <h1 className="text-4xl text-start font-extrabold text-white mb-4">
                Design Your Wall
              </h1>
              <p className="text-indigo-100 text-lg max-w-md">
                Bring your space to life. Drag, drop, and shop stunning artworks
                on your wall in real-time. A seamless design experience,
                tailored to your taste.
              </p>
            </div>

            {/* <div className="flex space-x-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="w-3 h-3 rounded-full bg-white/50 hover:scale-110 transition"
                ></div>
              ))}
            </div> */}
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="w-full lg:w-1/2 p-8 md:p-6">
          <div className="text-center mb-5">
            <div className="mx-auto w-12 h-12 bg-gradient-to-r from-gray-500 to-gray-200 rounded-full flex items-center justify-center shadow-lg mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h6 className="text-2xl font-bold text-gray-100">Welcome Back</h6>
            <p className="mt-2 text-gray-400">Sign in to your account</p>
          </div>

          <form onSubmit={submit} className="space-y-6">
            <div className="relative">
              <input
                ref={emailRef}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=" "
                required
                className="w-full px-4 py-3 text-[14px] bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent peer transition-all duration-200"
              />
              <label
                htmlFor="email"
                className="absolute left-4 top-3 text-[14px] text-gray-500 pointer-events-none transition-all duration-200 peer-focus:text-indigo-400 peer-placeholder-shown:translate-y-0 peer-focus:-translate-y-8 peer-focus:text-sm peer-placeholder-shown:text-base peer-placeholder-shown:scale-100 scale-75 -translate-y-8 origin-left"
              >
                Email Address
              </label>
              <div className="absolute right-3 top-3.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>

            <div className="relative">
              <input
                ref={passwordRef}
                type={isVisible? "text":"password" } 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=" "
                required
                className="w-full px-4 py-3 text-[14px] bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent peer transition-all duration-200 pr-12"
              />
              <label
                htmlFor="password"
                className="absolute left-4 top-3 text-[14px] text-gray-500 pointer-events-none transition-all duration-200 peer-focus:text-indigo-400 peer-placeholder-shown:translate-y-0 peer-focus:-translate-y-8 peer-focus:text-sm peer-placeholder-shown:text-base peer-placeholder-shown:scale-100 scale-75 -translate-y-8 origin-left"
              >
                Password
              </label>
              <button
                type="button"
                onClick={() => setIsVisible(!isVisible)}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-indigo-400"
              >
               {isVisible ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  // checked={rememberMe}
                  // onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-600 rounded-[32px] bg-gray-800"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-400"
                >
                  Remember me
                </label>
              </div>
              <a
                href="#"
                className="text-sm text-indigo-400 hover:text-indigo-300 transition"
              >
                Forgot password?
              </a>
            </div>

            <div className="pt-4 flex justify-center items-center w-full">
              <button
                type="submit"
                disabled={loading}
                className=" w-full max-w-[200px] flex justify-center py-2 px-4 border border-[#1c3c74] rounded-full shadow-lg text-lg font-medium  text-white bg-gradient-to-r from-[#001842] via-[#1c3c74] to-[#5E89B3] hover:from-[#5E89B3] hover:via-[#1c3c74] hover:to-[#001842] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                   <h6 className="text-[12px]"> 
                    
                    Authenticating...
                    </h6> 
                  </div>
                ) : (
                  <div className="flex items-center">
                    <span>Sign In</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </div>
                )}
              </button>
            </div>
          </form>

          {/* <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-900 text-gray-500">
                  Or try demo accounts
                </span>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-3 gap-3">
              {['admin', 'seller', 'customer'].map((role) => (
                <button
                  key={role}
                  onClick={() => handleDemoLogin(role as any)}
                  className="py-2.5 px-4 text-sm font-medium text-center text-white bg-gray-800/60 rounded-lg hover:bg-gray-800/90 transition border border-gray-700 hover:border-indigo-500"
                >
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </button>
              ))}
            </div>
          </div> */}
          <div className="mt-5">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white rounded text-gray-500">or</span>
              </div>
            </div>

            <div className="mt-5 w-full flex justify-center items-center gap-3">
              <div ref={googleButtonRef} className=""></div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-medium text-indigo-400 hover:text-indigo-300 transition"
              >
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
