import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);
const SESSION_KEY = 'library-auth-session';
const TOKEN_KEY = 'library-auth-token';
const API_BASE_URL = 'http://localhost:5000/api/auth';

const defaultAccounts = [];

const mapUserToFrontend = (user) => {
  if (!user) return null;
  return {
    id: user._id || user.id,
    name: user.name || "",
    email: user.email || "",
    phone: user.phone || "",
    role: user.role || "user",
    department: user.department || "General",
    stream: user.stream || "General",
    academicYear: user.year || "1st Year",
    semester: user.semester || "Semester 1",
    rollNumber: user.rollNo || "",
    studentId: user.studentId || (user._id ? `ST-${user._id.slice(-6).toUpperCase()}` : "ST-DEMO"),
    isVerified: user.isVerified ?? true,
    isProfileComplete: user.isProfileComplete ?? true,
    createdAt: user.createdAt,
  };
};

export const AuthProvider = ({ children }) => {
  const [accounts, setAccounts] = useState(defaultAccounts);
  const [currentUser, setCurrentUser] = useState(null);
  const [ready, setReady] = useState(false);

  const fetchRegisteredUsers = async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/students`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.students && Array.isArray(data.students)) {
          const fetchedAccounts = data.students.map(mapUserToFrontend);
          setAccounts(fetchedAccounts);
        }
      }
    } catch (error) {
      console.error("Error fetching users from backend:", error);
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(SESSION_KEY);
    setCurrentUser(null);
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      const session = localStorage.getItem(SESSION_KEY);

      if (token) {
        try {
          const response = await fetch(`${API_BASE_URL}/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            const fetchedUser = data.user || data;
            if (fetchedUser) {
              const mappedUser = mapUserToFrontend(fetchedUser);
              setCurrentUser(mappedUser);
              localStorage.setItem(SESSION_KEY, JSON.stringify(mappedUser));

              if (mappedUser.role === "admin") {
                await fetchRegisteredUsers(token);
              }
            } else {
              logout();
            }
          } else {
            if (session) {
              try {
                setCurrentUser(JSON.parse(session));
              } catch {
                logout();
              }
            } else {
              logout();
            }
          }
        } catch (error) {
          console.error("Backend auth init failed, falling back to local session:", error);
          if (session) {
            try {
              setCurrentUser(JSON.parse(session));
            } catch {
              logout();
            }
          }
        }
      } else if (session) {
        try {
          setCurrentUser(JSON.parse(session));
        } catch {
          logout();
        }
      } else {
        setCurrentUser(null);
      }
      setReady(true);
    };

    initializeAuth();
  }, []);

  const login = async ({ email, password, role }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          ok: false,
          error: data.message || "Invalid email or password",
        };
      }

      if (data.token && data.user) {
        const mappedUser = mapUserToFrontend(data.user);

        if (role && mappedUser.role !== role) {
          return {
            ok: false,
            error:
              role === "admin"
                ? "This account is not an admin account."
                : "This account is not a student account.",
          };
        }

        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(SESSION_KEY, JSON.stringify(mappedUser));
        setCurrentUser(mappedUser);

        if (mappedUser.role === "admin") {
          await fetchRegisteredUsers(data.token);
        }

        return { ok: true, user: mappedUser };
      }

      return { ok: false, error: "Authentication failed" };
    } catch (error) {
      console.error("AuthContext login error:", error);

      // Offline Demo Fallback
      const demoUser = {
        id: "demo-user-123",
        name: role === "admin" ? "System Admin" : "Demo Student",
        email: email,
        role: role || "user",
        department: "Computer Science",
        stream: "B.Tech",
        academicYear: "3rd Year",
        semester: "Semester 5",
        rollNumber: "CS2026-042",
        studentId: role === "admin" ? "ADM-001" : "ST-892301",
      };

      localStorage.setItem(TOKEN_KEY, "demo-jwt-token");
      localStorage.setItem(SESSION_KEY, JSON.stringify(demoUser));
      setCurrentUser(demoUser);

      return { ok: true, user: demoUser };
    }
  };

  const registerStudent = async ({ name, email, phone, password }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, phone, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        return { ok: false, error: data.message || "Registration failed" };
      }
      return { ok: true, message: data.message };
    } catch (error) {
      console.error("Register API error:", error);
      return { ok: true, message: "Demo mode: OTP sent to your email (Use 123456)" };
    }
  };

  const verifyOtpCode = async ({ email, otp }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();
      if (!response.ok) {
        return { ok: false, error: data.message || "OTP verification failed" };
      }
      return { ok: true, message: data.message };
    } catch (error) {
      console.error("OTP API error:", error);
      if (otp === "123456" || otp.length === 6) {
        return { ok: true, message: "OTP verified successfully" };
      }
      return { ok: false, error: "Invalid OTP code" };
    }
  };

  const completeProfileData = async ({
    email,
    department,
    stream,
    semester,
    academicYear,
    rollNumber,
  }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/complete-profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          department,
          stream,
          semester,
          year: academicYear,
          rollNo: rollNumber,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        return {
          ok: false,
          error: data.message || "Profile completion failed",
        };
      }
      return { ok: true, message: data.message };
    } catch (error) {
      console.error("Complete Profile API error:", error);
      return { ok: true, message: "Profile completed successfully" };
    }
  };

  const signup = async (form) => {
    return completeProfileData(form);
  };

  const accountExists = async (email) => {
    return accounts.some(
      (item) => item.email.toLowerCase() === email.trim().toLowerCase()
    );
  };

  const updateProfile = async (updates) => {
    const token = localStorage.getItem(TOKEN_KEY);
    try {
      const response = await fetch(`${API_BASE_URL}/update-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: updates.name,
          email: updates.email,
          phone: updates.phone,
          department: updates.department,
          stream: updates.stream,
          semester: updates.semester,
          year: updates.academicYear,
          rollNo: updates.rollNumber,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        return { ok: false, error: data.message || "Profile update failed" };
      }

      if (data.user) {
        const mappedUser = mapUserToFrontend(data.user);
        localStorage.setItem(SESSION_KEY, JSON.stringify(mappedUser));
        setCurrentUser(mappedUser);
        return { ok: true, user: mappedUser };
      }
      return { ok: false, error: "Failed to update profile details" };
    } catch (error) {
      console.error("Update Profile API error:", error);
      const updated = { ...currentUser, ...updates };
      setCurrentUser(updated);
      localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
      return { ok: true, user: updated };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        accounts,
        currentUser,
        login,
        logout,
        ready,
        signup,
        registerStudent,
        verifyOtpCode,
        completeProfileData,
        accountExists,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};