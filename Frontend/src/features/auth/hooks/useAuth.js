import { useContext, useEffect } from "react";
import { AuthContext } from "../auth.context";
import { login, register, getMe, logout } from "../services/auth.api";

export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider");
    }

    const {
        user,
        setUser,
        loading,
        setLoading
    } = context;

  
    async function handleRegister({ username, email, password }) {
        setLoading(true);

        try {
            const data = await register({
                username,
                email,
                password
            });

            alert(
                data.message ||
                "Registration successful. Please verify your email."
            );

            return true;
        } catch (err) {
            console.error("Registration Error:", err);

            alert(
                err.response?.data?.message ||
                err.message ||
                "Registration failed"
            );

            return false;
        } finally {
            setLoading(false);
        }
    }

    async function handleLogin({ username, email, password }) {
        setLoading(true);

        try {
            // Login (sets cookie)
            await login({
                username,
                email,
                password
            });

            // Fetch authenticated user
            const me = await getMe();

            setUser(me.user);

            return true;

        } catch (err) {

            console.error("Login Error:", err);

            alert(
                err.response?.data?.message ||
                err.message ||
                "Login failed"
            );

            setUser(null);

            return false;

        } finally {
            setLoading(false);
        }
    }

 
    async function handleGetMe() {
        setLoading(true);

        try {

            const data = await getMe();

            setUser(data.user);

        } catch (err) {

            
            if (err.response?.status !== 401) {
                console.error(
                    "Failed to fetch current session:",
                    err
                );
            }

            setUser(null);

        } finally {
            setLoading(false);
        }
    }

  
    async function handleLogout() {

        setLoading(true);

        try {

            await logout();

            setUser(null);

            alert("Logged out successfully");

            return true;

        } catch (err) {

            console.error("Logout Error:", err);

            alert(
                err.response?.data?.message ||
                err.message ||
                "Logout failed"
            );

            return false;

        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        handleGetMe();
    }, []);

    return {
        user,
        loading,
        handleRegister,
        handleLogin,
        handleGetMe,
        handleLogout
    };
};