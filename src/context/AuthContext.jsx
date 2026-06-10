import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

// ─── Storage helpers ────────────────────────────────────────────────────────
function safeGet(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`localStorage.set("${key}") failed:`, e);
  }
}

function safeRemove(key) {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.error(`localStorage.remove("${key}") failed:`, e);
  }
}

// ─── Session restore ─────────────────────────────────────────────────────────
// Supports BOTH the old key ("active_user") and the new key ("auth_session")
// so existing logged-in users are not thrown out after the upgrade.
function restoreSession() {
  // New-style session: { userId } → look up in users_db
  const newSession = safeGet("auth_session");
  if (newSession?.userId) {
    const users = safeGet("users_db", []);
    const found = users.find((u) => u.id === newSession.userId);
    if (found) {
      const { password: _, ...safeUser } = found;
      return safeUser;
    }
  }

  // Old-style session: full user object stored directly
  const oldSession = safeGet("active_user");
  if (oldSession?.id) {
    // Migrate: write new-style session, remove old key
    safeSet("auth_session", { userId: oldSession.id });
    safeRemove("active_user");
    return oldSession; // already has no password (it was stripped at signup/signin)
  }

  return null;
}

// ─────────────────────────────────────────────────────────────────────────────

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true); // kept as `loading` (old name)

  useEffect(() => {
    const restored = restoreSession();
    if (restored) setUser(restored);
    setLoading(false);
  }, []);

  // ── signup (old name) ─── positional args, matches old callers ─────────────
  const signup = (fullname, email, password) => {
    if (!fullname?.trim()) throw new Error("Full name is required.");
    if (!email?.trim())    throw new Error("Email is required.");
    if (!password)         throw new Error("Password is required.");
    if (password.length < 6) throw new Error("Password must be at least 6 characters.");

    const users = safeGet("users_db", []);
    const exists = users.some(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );
    if (exists) throw new Error(`Account with this email ${email} already exists.`);

    const newUser = {
      id:        crypto.randomUUID(),
      fullname:  fullname.trim(),
      email:     email.trim().toLowerCase(),
      password,                           // plain-text; hash in prod
      createdAt: new Date().toISOString(),
      // NOTE: no top-level `role` field — role lives inside team/project members
    };

    safeSet("users_db", [...users, newUser]);

    const { password: _, ...sessionUser } = newUser;
    safeSet("auth_session", { userId: newUser.id });
    safeRemove("active_user"); // clean up old key if present
    setUser(sessionUser);
    return sessionUser;
  };

  // ── signin (old name) ─── positional args, matches old callers ─────────────
  const signin = (email, password) => {
    if (!email?.trim()) throw new Error("Email is required.");
    if (!password)      throw new Error("Password is required.");

    const users = safeGet("users_db", []);
    if (users.length === 0) throw new Error("No accounts found. Please sign up first.");

    const found = users.find(
      (u) =>
        u.email.toLowerCase() === email.trim().toLowerCase() &&
        u.password === password
    );
    if (!found) throw new Error("Invalid email or password.");

    const { password: _, ...sessionUser } = found;
    safeSet("auth_session", { userId: found.id });
    safeRemove("active_user"); // clean up old key if present
    setUser(sessionUser);
    return sessionUser;
  };

  // ── Aliases so new code (register / login) also works ────────────────────
  // TeamContext, ProjectContext, TaskContext only use `user` — not these
  // functions — so aliases are purely for future UI convenience.
  const register = ({ fullname, email, password }) =>
    signup(fullname, email, password);

  const login = ({ email, password }) =>
    signin(email, password);

  // ── logout ────────────────────────────────────────────────────────────────
  const logout = () => {
    safeRemove("auth_session");
    safeRemove("active_user"); // belt-and-suspenders
    setUser(null);
  };

  // ── updateProfile ─────────────────────────────────────────────────────────
  const updateProfile = ({ fullname, email }) => {
    if (!user) throw new Error("Not logged in.");

    const users = safeGet("users_db", []);

    if (email && email.trim().toLowerCase() !== user.email) {
      const taken = users.some(
        (u) =>
          u.id !== user.id &&
          u.email.toLowerCase() === email.trim().toLowerCase()
      );
      if (taken) throw new Error("This email is already in use.");
    }

    const updated = users.map((u) =>
      u.id !== user.id
        ? u
        : {
            ...u,
            fullname:  fullname?.trim() || u.fullname,
            email:     email?.trim().toLowerCase() || u.email,
            updatedAt: new Date().toISOString(),
          }
    );

    safeSet("users_db", updated);

    const fresh = updated.find((u) => u.id === user.id);
    const { password: _, ...sessionUser } = fresh;
    setUser(sessionUser);
    return sessionUser;
  };

  // ── changePassword ────────────────────────────────────────────────────────
  const changePassword = ({ currentPassword, newPassword }) => {
    if (!user) throw new Error("Not logged in.");
    if (!currentPassword) throw new Error("Current password is required.");
    if (!newPassword)      throw new Error("New password is required.");
    if (newPassword.length < 6)
      throw new Error("New password must be at least 6 characters.");

    const users = safeGet("users_db", []);
    const found = users.find((u) => u.id === user.id);
    if (!found)                         throw new Error("User not found.");
    if (found.password !== currentPassword)
      throw new Error("Current password is incorrect.");

    safeSet(
      "users_db",
      users.map((u) => (u.id === user.id ? { ...u, password: newPassword } : u))
    );
  };

  // ── Derived helpers ───────────────────────────────────────────────────────
  const isLoading       = loading;       // alias for new-style consumers
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,          // ← old name  (keep for existing UI)
        isLoading,        // ← new alias (harmless extra)
        isAuthenticated,
        signin,           // ← old name
        signup,           // ← old name
        login,            // ← new alias
        register,         // ← new alias
        logout,
        updateProfile,
        changePassword,
      }}
    >
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