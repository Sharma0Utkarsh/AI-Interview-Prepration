import React, { useState, useContext } from "react";
    import { useNavigate } from "react-router-dom";
    import Input from "../../components/Inputs/Input";
    import ProfilePhotoSelector from "../../components/Inputs/ProfilePhotoSelector";
    import { validateEmail } from "../../utils/helper";
import axiosInstance from "../../utils/axiosinstance";
import { API_PATHS } from "../../utils/apiPaths";
import { UserContext } from "../../context/userContext";

const SignUp = ({ setCurrentPage }) => {
  const [profilePic, setProfilePic] = useState(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { updateUser } = useContext(UserContext);
  const navigate = useNavigate();

  // Upload image helper
  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    const res = await axiosInstance.post(API_PATHS.IMAGE.UPLOAD_IMAGE, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data; // { imageUrl }
  };

  // Handle Signup
  const handleSignUp = async (e) => {
    e.preventDefault();

    let profileImageUrl = "";
    if (!fullName) {
      setError("Please enter full name");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email");
      return;
    }

    if (!password) {
      setError("Enter a valid password");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // Upload image if present
      if (profilePic) {
        const imgUploadRes = await uploadImage(profilePic);
        profileImageUrl = imgUploadRes.imageUrl || "";
      }

      const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
        name: fullName,
        email,
        password,
        profileImageUrl,
      });

      const { token } = response.data;

      if (token) {
        localStorage.setItem("token", token);
        updateUser(response.data);
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Signup error:", error);
      if (error.response && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError("Something went wrong while registering");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-[90vw] md:w-[28vw] bg-white shadow-lg rounded-2xl p-8 flex flex-col justify-center">
      <h3 className="text-xl font-semibold text-gray-900">Create an Account</h3>
      <p className="text-sm text-gray-500 mt-2 mb-6">Enter your details below</p>

      <form onSubmit={handleSignUp} className="flex flex-col gap-5">
        {/* Profile Photo Upload */}
        <ProfilePhotoSelector image={profilePic} setImage={setProfilePic} />

        {/* Input Fields */}
        <Input
          value={fullName}
          onChange={({ target }) => setFullName(target.value)}
          label="Full Name"
          placeholder="Your Name"
          type="text"
        />

        <Input
          value={email}
          onChange={({ target }) => setEmail(target.value)}
          label="Email"
          placeholder="person@email.com"
          type="email"
        />

        <Input
          value={password}
          onChange={({ target }) => setPassword(target.value)}
          label="Password"
          placeholder="********"
          type="password"
        />

        {/* Error Message */}
        {error && <p className="text-red-500 text-xs -mt-3">{error}</p>}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-black text-white py-2.5 rounded-md font-medium transition ${
            loading ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-800"
          }`}
        >
          {loading ? "Signing Up..." : "SIGN UP"}
        </button>

        {/* Redirect to Login */}
        <p className="text-sm text-gray-600 text-center mt-2">
          Already have an account?{" "}
          <button
            type="button"
            className="text-blue-500 font-semibold underline"
            onClick={() => setCurrentPage("login")}
          >
            Login
          </button>
        </p>
      </form>
    </div>
  );
};

export default SignUp;

