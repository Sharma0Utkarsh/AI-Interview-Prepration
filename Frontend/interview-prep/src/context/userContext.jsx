import { useState, useEffect, createContext, useCallback } from "react";
import axiosInstance from "../utils/axiosinstance";
import { API_PATHS } from "../utils/apiPaths";
import SpinnerLoader from "../components/Loader/SpinnerLoader";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const clearUser = useCallback(() => {
    setUser(null);
    localStorage.removeItem("token");
  }, []);

  useEffect(() => {
    if (user) {
      setLoading(false);
      return;
    }

    const accessToken = localStorage.getItem("token");
    if (!accessToken) {
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE);
        setUser(response.data);
      } catch (error) {
        console.error("User not authenticated", error);
        clearUser();
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [user, clearUser]);

  const updateUser = useCallback((userData) => {
    setUser(userData);
    localStorage.setItem("token", userData.token);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <SpinnerLoader />
      </div>
    );
  }

  return (
    // 1. FIXED: `UserDContext` ko `UserContext` kiya gaya
    <UserContext.Provider value={{ user, loading, updateUser, clearUser }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;