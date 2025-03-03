import axios from "axios";
import { useState, useContext } from "react";
import AuthContext from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";


import "react-toastify/dist/ReactToastify.css";


const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const {loginUser} = useContext(AuthContext)

  const navigate = useNavigate();

  const notify = (message) => {
    toast.error(message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
    });
  };

  // const onSubmit = async (e) => {
  //   e.preventDefault();
  //   try {
  //     const response = await axios.post(`${BACKEND_URL}/backend/auth`, {
  //       email,
  //       password,
  //     });
  //     setToken(response.data.token);

  //     navigate("/");
  //     window.location.reload();
  //   } catch (error) {
  //     notify(error.response.data);
  //   }
  // };

  
   const onSubmit = async (e) => {
    e.preventDefault();
    if (email && password) {
      await loginUser(email, password);
    } else {
      notify("Please fill in all fields");
    }
  };

  return (
    <div
      className="py-10 
         flex flex-col justify-center items-center "
    >
      <div
        className="bg-white px-8 pt-8 pb-8
            rounded-lg shadow-2xl my-32"
      >
        <form className=" " onSubmit={(e) => onSubmit(e)}>
          <h1 className="text-black tracking-wide text-3xl font-black mb-8 centerForm">
            Login
          </h1>

          <h2 className="textOverInputField">Email</h2>
          <input
            type="email"
            placeholder="Type your username or email"
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
            required
            className="customInput "
          />

          <h2 className="textOverInputField">Password</h2>
          <input
            type="password"
            placeholder="Type your password"
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
            minLength={6}
            required
            className="customInput"
          />

          <div className="centerForm pt-4">
            
            <button className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-2xl group bg-gradient-to-br from-green-400 to-blue-600 group-hover:from-green-400 group-hover:to-blue-600 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800" type="submit">
              <span className="relative px-10 py-1.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-2xl group-hover:bg-opacity-0">
              Login
              </span>
            </button>
          </div>
          <div className="flex justify-center">
            <p>
              Don`t have an account?
              <Link
                to="/register"
                className="text-sm tracking-wide pt-2 transition-colors text-blue-500 hover:text-blue-700  hover:font-semibold duration-300"
              >
                Register here
              </Link>
            </p>
          </div>

          {/* <div className="flex justify-center">
            <p>
              Forgot password?
              <Link
                to="/reset-password"
                className="text-sm tracking-wide pt-2 transition-colors text-blue-500 hover:text-blue-700  hover:font-semibold duration-300"
              >
                Reset Password
              </Link>
            </p>
          </div> */}
        </form>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
      </div>
    </div>
  );
};
export default LoginPage;
