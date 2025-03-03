import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {jwtDecode} from "jwt-decode";
import AuthContext from "../context/AuthContext";
import axios from "axios";

export default function Header() {
  const [showMenu, setShowMenu] = useState(false);
  const { user, logoutUser } = useContext(AuthContext);
  const token = localStorage.getItem("authTokens");
  const [user_id, setUser_id] = useState("");

  useEffect(() => {
    if (token) {
      const decoded = jwtDecode(token);
      setUser_id(decoded.user_id);
    }
  }, [token]);

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const closeMenu = () => {
    setShowMenu(false);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1) {
        setShowMenu(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div>
      <nav className="flex items-center justify-between p-4">
        <div className="flex lg:flex-1">
          <Link to="/" className="pr-1">
            <span className="sr-only">Your Company</span>
            <img className="h-8 max-w-none" src="/learning.png" alt="Company Logo" />
          </Link>
          <Link to="/" className="text-2xl font-extrabold pr-2">
            Learning platform
          </Link>
        </div>
        {token !== null ? (
          <div className="ml-12 flex items-center">
            <Link to="/" className="linkHomePage flex items-center">
              <p>Home</p>
              <img className="h-10 max-w-none" src="/home.png" alt="Home" />
            </Link>
            <Link to="/allcourses" className="linkHomePage flex items-center">
              <p className="pr-2">Courses</p>
              <img className="h-10 max-w-none" src="/webinar.png" alt="Courses" />
            </Link>
            <Link to="/Dashboard" className="linkHomePage flex items-center">
              <p className="pr-2">Dashboard</p>
              <img className="h-10 max-w-none" src="/dashboard.png" alt="Dashboard" />
            </Link>
          </div>
        ) : (
          <div>
            <Link to="/" className="linkHomePage flex items-center">
              <img className="h-8 max-w-none" src="/home.png" alt="Home" />
              <span>Home</span>
            </Link>
          </div>
        )}

        <div className="lg:flex lg:flex-1 lg:justify-end lg:gap-x-6 mr-3">
          <div className="lg:hidden">
            <button onClick={toggleMenu} className="flex items-center pl-10 py-1 text-white hover:text-green-500">
              <img className="h-8 max-w-none border-black rounded-md" src="/menu.svg" alt="Menu" />
            </button>
          </div>
          {showMenu && (
            <div className="absolute z-50 right-8 px-2 top-14 bg-zinc-600 shadow-md py-2 rounded-md w-34">
              {token !== null ? (
                <div>
                  <Link to="/login" className="block regLogLinks hover:text-green-500 lg:mr-4 md:mr-2 sm:mr-1" onClick={closeMenu}>
                    Log in <span aria-hidden="true">&#10094;</span>
                  </Link>
                  <Link to="/register" className="block regLogLinks hover:text-amber-500" onClick={closeMenu}>
                    Register <span aria-hidden="true">&#10094;</span>
                  </Link>
                </div>
              ) : (
                <div>
                  <Link to="/reset" className="block regLogLinks hover:text-emerald-400 lg:mr-4 md:mr-2 sm:mr-1" onClick={closeMenu}>
                    Change Password <span aria-hidden="true">&nbsp;&#10094;</span>
                  </Link>
                  <button className="block regLogLinks hover:text-red-500" onClick={logoutUser}>
                    Logout <span aria-hidden="true">&nbsp;&#10094;</span>
                  </button>
                </div>
              )}
            </div>
          )}
          <div className="hidden lg:inline-block">
            <div className="lg:flex lg:flex-1 lg:justify-end">
              {token === null ? (
                <>
                  <Link to="/login" className="block regLogLinks hover:text-green-500 lg:mr-4 md:mr-2 sm:mr-1">
                    Log in <span aria-hidden="true">&#10094;</span>
                  </Link>
                  <Link to="/register" className="block regLogLinks hover:text-amber-500 ml-1">
                    Register <span aria-hidden="true">&#10094;</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link to={`/users/${user_id}`} className="pr-1">
                    <span className="sr-only">Profile</span>
                    <img className="h-8 max-w-none" src="/profile.png" alt="Profile" />
                  </Link>
                  <button className="block regLogLinks hover:text-red-500" onClick={logoutUser}>
                    Logout <span aria-hidden="true">&nbsp;&#10094;</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
