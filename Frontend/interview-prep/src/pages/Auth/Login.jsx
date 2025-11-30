import React, { useContext, useState } from "react";
    import { useNavigate } from "react-router-dom";
    import Input from "../../components/Inputs/Input";
    import { validateEmail } from "../../utils/helper";
    import axiosInstance from "../../utils/axiosinstance";
import { API_PATHS } from "../../utils/apiPaths";
import { UserContext } from "../../context/userContext";


const Login = ({ setCurrentPage }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);


  const {updateUser} = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();


    if (!validateEmail(email)) {
      setError("Please enter a valid email");
      return;
    }

    if (!password) {
      setError("Please enter a password");
      return;
    }

    try {
      
      const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN,{
        email,
        password,
      });

      const {token} = response.data;

      if(token){
        localStorage.setItem("token",token);
        updateUser(response.data)
        navigate("/dashboard")
      }

    } catch (error) {
      if (error.response && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError("Something went wrong");
      }
    }
    // handle login logic
  };

  return (
    <div className="w-[90vw] md:w-[28vw] bg-white shadow-lg rounded-2xl p-8 flex flex-col justify-center">
      <h3 className="text-xl font-semibold text-gray-900">Welcome Back</h3>
      <p className="text-sm text-gray-500 mt-2 mb-6">
        Please enter your details to log in
      </p>

      <form onSubmit={handleLogin} className="flex flex-col gap-5">
        <Input
          value={email}
          onChange={({ target }) => setEmail(target.value)}
          label="Email Address"
          placeholder="person@email.com"
          type="text"
        />

        <Input
          value={password}
          onChange={({ target }) => setPassword(target.value)}
          label="Password"
          placeholder="********"
          type="password"
        />

        {error && (
          <p className="text-red-500 text-xs -mt-3">{error}</p>
        )}

        <button
          type="submit"
          className="w-full bg-black text-white py-2.5 rounded-md font-medium hover:bg-gray-800 transition"
        >
          LOGIN
        </button>

        <p className="text-sm text-gray-600 text-center mt-2">
          Don’t have an account?{" "}
          <button
            type="button"
            className="text-blue-500 font-semibold underline"
            onClick={() => setCurrentPage("signup")}
          >
            SignUp
          </button>
        </p>
      </form>
    </div>
  );
};

export default Login;


