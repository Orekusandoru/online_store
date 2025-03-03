import axios from "axios";
import { useState, useContext } from "react";
import AuthContext from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const {registerUser} = useContext(AuthContext)

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
  //     const response = await axios.post(`${BACKEND_URL}/auth/users/`, {
  //       email,
  //       name,
  //       password,
  //       re_password: rePassword,
  //     });
  //     setToken(response.data.token);
  //     console.log(response.data.token);
  //     navigate("/activate/:uid/:token");
  //     window.location.reload();
  //   } catch (error) {
  //     notify(error.response.data);
  //   }
  // };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (email && username && password && password2) {
      await registerUser(email,username, password,password2);
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
            rounded-lg shadow-2xl my-16"
      >
        <form className=" " onSubmit={(e) => onSubmit(e)}>
          <h1 className="text-black tracking-wide text-3xl font-black mb-8 centerForm">
            RegisterPage
          </h1>

          <h2 className="textOverInputField">Username</h2>
          <input
            type="text"
            placeholder="Type your username "
            value={username}
            onChange={(ev) => setUsername(ev.target.value)}
            className="customInput "
          />

          <h2 className="textOverInputField">Email</h2>
          <input
            type="text"
            placeholder="Type your email"
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
            className="customInput "
          />

          <h2 className="textOverInputField">Password</h2>
          <input
            type="password"
            placeholder="Type your password"
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
            className="customInput"
          />
          <h2 className="textOverInputField">Confirm Password</h2>
          <input
            type="password"
            placeholder="Type your password"
            value={password2}
            onChange={(ev) => setPassword2(ev.target.value)}
            className="customInput"
          />

          <div className="centerForm pt-4">
            
            <button class="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-2xl group bg-gradient-to-br from-green-400 to-blue-600 group-hover:from-green-400 group-hover:to-blue-600 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800" type="submit">
              <span class="relative px-10 py-1.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-2xl group-hover:bg-opacity-0">
              Register
              </span>
            </button>
          </div>
          <p className="flex justify-center items-center pt-2 ">
            <p className="text-sm pr-1">Already have an account?</p>
            <p>
              <Link
                to="/login"
                className=" text-sm tracking-wide pt-2 transition-colors text-blue-500 hover:text-blue-700  hover:font-semibold duration-300"
              >
                Login Now
              </Link>
            </p>
          </p>
          {/* <p className="flex justify-center">
            <Link
              to="/recovery"
              className="text-sm tracking-wide pt-2 transition-colors text-blue-500 hover:text-blue-700  hover:font-semibold duration-300"
            >
              Forgot password?
            </Link>
          </p> */}
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
}
