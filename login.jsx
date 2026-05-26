// =========================================================
// Login Screen
// =========================================================

const LoginScreen = ({ onLogin }) => {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [rememberMe, setRememberMe] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const toast = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!username.trim()) {
      setError("กรุณากรอกชื่อผู้ใช้งาน");
      return;
    }
    if (!password.trim()) {
      setError("กรุณากรอกรหัสผ่าน");
      return;
    }

    setLoading(true);
    // Simulate login API call
    setTimeout(() => {
      // Mock user validation
      if (username && password.length >= 4) {
        if (rememberMe) {
          localStorage.setItem("rememberMe", "true");
          localStorage.setItem("username", username);
        } else {
          localStorage.removeItem("rememberMe");
          localStorage.removeItem("username");
        }
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("currentUser", username);
        setLoading(false);
        toast.push("เข้าสู่ระบบสำเร็จ");
        onLogin();
      } else {
        setError("ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง");
        setLoading(false);
      }
    }, 600);
  };

  React.useEffect(() => {
    const remembered = localStorage.getItem("rememberMe");
    if (remembered) {
      const savedUsername = localStorage.getItem("username");
      if (savedUsername) {
        setUsername(savedUsername);
        setRememberMe(true);
      }
    }
  }, []);

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      padding: 20,
    }}>
      <div style={{
        width: "100%",
        maxWidth: 380,
        background: "white",
        borderRadius: 12,
        boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
        padding: 40,
      }}>
        {/* Logo */}
        <div style={{
          textAlign: "center",
          marginBottom: 32,
        }}>
          <div style={{
            width: 60,
            height: 60,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            fontSize: 28,
            fontWeight: 700,
            color: "white",
          }}>
            🏥
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 8px", color: "#1a202c" }}>
            Smart Hospital
          </h1>
          <p style={{ fontSize: 13, color: "#718096", margin: 0 }}>
            Management System
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Error message */}
          {error && (
            <div style={{
              padding: 12,
              background: "#fed7d7",
              color: "#c53030",
              borderRadius: 6,
              fontSize: 13,
              lineHeight: 1.4,
            }}>
              {error}
            </div>
          )}

          {/* Username field */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#2d3748" }}>
              ชื่อผู้ใช้งาน
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="กรอกชื่อผู้ใช้งาน"
              style={{
                padding: "10px 12px",
                border: "1px solid #cbd5e0",
                borderRadius: 6,
                fontSize: 14,
                fontFamily: "inherit",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => e.target.style.borderColor = "#667eea"}
              onBlur={(e) => e.target.style.borderColor = "#cbd5e0"}
              disabled={loading}
            />
          </div>

          {/* Password field */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#2d3748" }}>
              รหัสผ่าน
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="กรอกรหัสผ่าน"
              style={{
                padding: "10px 12px",
                border: "1px solid #cbd5e0",
                borderRadius: 6,
                fontSize: 14,
                fontFamily: "inherit",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => e.target.style.borderColor = "#667eea"}
              onBlur={(e) => e.target.style.borderColor = "#cbd5e0"}
              disabled={loading}
            />
          </div>

          {/* Remember Me */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{ width: 16, height: 16, cursor: "pointer" }}
              disabled={loading}
            />
            <label htmlFor="rememberMe" style={{ fontSize: 13, color: "#4a5568", cursor: "pointer" }}>
              จำชื่อผู้ใช้งาน
            </label>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "10px 16px",
              background: loading ? "#cbd5e0" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              border: "none",
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              marginTop: 8,
            }}
            onMouseEnter={(e) => !loading && (e.target.style.transform = "translateY(-1px)")}
            onMouseLeave={(e) => !loading && (e.target.style.transform = "translateY(0)")}
          >
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>

        {/* Links */}
        <div style={{
          marginTop: 20,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          borderTop: "1px solid #e2e8f0",
          paddingTop: 20,
        }}>
          <button
            onClick={() => alert("ฟีเจอร์ Forgot Password อยู่ระหว่างพัฒนา")}
            style={{
              padding: 0,
              background: "none",
              border: "none",
              fontSize: 13,
              color: "#667eea",
              cursor: "pointer",
              textAlign: "center",
              fontWeight: 500,
            }}
          >
            ลืมรหัสผ่าน?
          </button>
          <button
            onClick={() => alert("ฟีเจอร์ Sign Up อยู่ระหว่างพัฒนา")}
            style={{
              padding: "8px 16px",
              background: "transparent",
              border: "1px solid #cbd5e0",
              borderRadius: 6,
              fontSize: 13,
              color: "#4a5568",
              cursor: "pointer",
              fontWeight: 500,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = "#667eea";
              e.target.style.color = "#667eea";
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = "#cbd5e0";
              e.target.style.color = "#4a5568";
            }}
          >
            สร้างบัญชีใหม่
          </button>
        </div>

        {/* Footer */}
        <div style={{
          marginTop: 20,
          textAlign: "center",
          fontSize: 11,
          color: "#a0aec0",
        }}>
          © 2024 Smart Hospital Management. All rights reserved.
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { LoginScreen });
