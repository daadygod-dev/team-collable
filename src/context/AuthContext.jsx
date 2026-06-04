import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const active_session = localStorage.getItem('active_user');
        if (active_session) {
            setUser(JSON.parse(active_session));
        }
        setLoading(false);
    }, []);

    const signup = (fullname, email, password) => {
        const register_users = JSON.parse(localStorage.getItem('users_db')) || [];
        const userExist = register_users.some((u) => u.email === email);

        if (userExist) {
            throw new Error(`Account with this email ${email} already exists.`);
        }

        const newUser = {
            id: crypto.randomUUID(),
            fullname,
            email,
            password,
            role: "member",
            createdAt: new Date().toISOString(),

        };

        register_users.push(newUser);
        localStorage.setItem('users_db', JSON.stringify(register_users));

        const { password: _, ...sessionUser } = newUser;
        setUser(sessionUser);
        localStorage.setItem("active_user", JSON.stringify(sessionUser));
        return sessionUser;
    };

  const signin = (email, password) => {
    const register_users = JSON.parse(localStorage.getItem("users_db")) || [];

    if (register_users.length === 0) {
        throw new Error("No accounts found. Please sign up first.");
    }

    const foundUser = register_users.find((u) => u.email === email && u.password === password);

    if (!foundUser) {
        throw new Error("Invalid email or password.");
    }

    const { password: _, ...sessionUser } = foundUser;
    setUser(sessionUser);
    localStorage.setItem("active_user", JSON.stringify(sessionUser));
    return sessionUser;
};

    const logout = () => {
        setUser(null);
        localStorage.removeItem("active_user");
    };

    return (
        <AuthContext.Provider value={{ user, loading, signin, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}