import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Image } from "../components";
import { jwtDecode } from "jwt-decode";
import AuthContext from "../context/AuthContext";

export default function HomePage() {
  const { user, logoutUser } = useContext(AuthContext);
  const token = localStorage.getItem("authTokens");
  const [username, serUsername] = useState("");
  useEffect(() => {
    if (token) {
      const decoded = jwtDecode(token);
      serUsername(decoded.username);
    }
  }, [token]);

  return (
    <div className="w-full flex justify-center items-center">
      <div className=" text-white text-xl flex justify-center items-center  w-[30%] h-[70%] mt-16  bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
        <section className="text-gray-600 ">
          <section className="relative ">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
              <div className="py-24 md:py-32">
                {token !== null ? (
                  <>
                    <h1 className="mb-5 text-4xl font-bold text-white">
                      Welcome <a className="text-green-300">{username} </a>on
                      Learning platform!
                    </h1>
                    <h1 className="mb-9 text-2xl font-semibold text-gray-200">
                      On this site, you can take a look at the available
                      courses, use the navigation bar, and go for the victories!
                    </h1>
                  </>
                ) : (
                  <>
                    <h1 className="mb-5 text-6xl font-bold text-white">
                      Hello new Student!
                    </h1>
                    <h1 className="mb-9 text-2xl font-semibold text-gray-200 text-">
                      Sign up or Sign in if you already have an account to get
                      access to our team task management system
                    </h1>

                    <Link
                      to="/register"
                      className="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 shadow-lg shadow-blue-500/50 dark:shadow-lg dark:shadow-blue-800/80 font-medium rounded-lg text-sm px-12 py-3 text-center me-2 mb-2 "
                    >
                      Sign up
                    </Link>

                    <Link
                      to="/login"
                      className="text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 shadow-lg shadow-teal-500/50 dark:shadow-lg dark:shadow-teal-800/80 font-medium rounded-lg text-sm ml-4 px-12 py-3 text-center me-2 mb-2"
                    >
                      Sign in
                    </Link>
                  </>
                )}
              </div>
            </div>
          </section>
        </section>
      </div>
    </div>
  );
}
