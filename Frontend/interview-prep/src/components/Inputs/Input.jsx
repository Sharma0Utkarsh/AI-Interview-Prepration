import React, { useState } from "react";
    import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";
    
    const Input = ({ value, onChange, label, placeholder, type }) => {
      const [showPassword, setShowPassword] = useState(false);
    
      const togglePassword = () => {
        setShowPassword(!showPassword);
      };
    
      return (
        <div className="flex flex-col w-full">
          {/* Label */}
          <label className="text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
    
          {/* Input Box */}
          <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-blue-400 bg-white">
            <input
              type={
                type === "password" ? (showPassword ? "text" : "password") : type
              }
              placeholder={placeholder}
              className="w-full text-sm text-gray-800 placeholder-gray-400 bg-transparent outline-none"
              value={value}
              onChange={(e) => onChange(e)}
            />
    
            {/* Eye Icon for Password */}
            {type === "password" && (
              <>
                {showPassword ? (
                  <FaRegEye
                    size={20}
                    className="text-blue-400 cursor-pointer"
                    onClick={togglePassword}
                  />
                ) : (
                  <FaRegEyeSlash
                    size={20}
                    className="text-gray-400 cursor-pointer"
                    onClick={togglePassword}
                  />
                )}
              </>
            )}
          </div>
        </div>
      );
    };
    
    export default Input;