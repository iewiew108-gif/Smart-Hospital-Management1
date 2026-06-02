// =========================================================
// Login Screen — Email + ชื่อเล่น (nickname) auth
// =========================================================

const LoginScreen = ({ onLogin }) => {
  const [email, setEmail]         = React.useState("");
  const [password, setPassword]   = React.useState("");
  const [rememberMe, setRememberMe] = React.useState(false);
  const [loading, setLoading]     = React.useState(false);
  const [loadingTeam, setLoadingTeam] = React.useState(false);
  const [error, setError]         = React.useState("");
  const [teamData, setTeamData]   = React.useState([]);

  // โหลดข้อมูลทีมจาก Supabase สำหรับตรวจสอบ login
  React.useEffect(() => {
    if (window.SupabaseDB?.isConfigured) {
      setLoadingTeam(true);
      window.SupabaseDB.loadAll()
        .then(({ team }) => { setTeamData(team); })
        .catch(() => {})
        .finally(() => setLoadingTeam(false));
    }
    // โหลดค่า remember me
    const saved = localStorage.getItem("loginEmail");
    if (saved) { setEmail(saved); setRememberMe(true); }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim())    { setError("กรุณากรอก Email"); return; }
    if (!password.trim()) { setError("กรุณากรอกรหัสผ่าน"); return; }

    setLoading(true);

    setTimeout(() => {
      const emailLower = email.trim().toLowerCase();

      // ค้นหาสมาชิกทีมที่ email ตรง
      const member = teamData.find(t =>
        (t.email1 && t.email1.trim().toLowerCase() === emailLower) ||
        (t.email2 && t.email2.trim().toLowerCase() === emailLower)
      );

      const isValid = member
        ? password.trim() === member.nick
        : (!window.SupabaseDB?.isConfigured && email && password.length >= 4); // fallback dev mode

      if (isValid) {
        if (rememberMe) localStorage.setItem("loginEmail", email.trim());
        else localStorage.removeItem("loginEmail");

        const userInfo = member
          ? { id: member.id, name: `${member.fname} ${member.lname}`, nick: member.nick,
              email: emailLower, avatar: member.avatar, posShort: member.posShort }
          : { name: email, nick: email };

        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("currentUser", JSON.stringify(userInfo));
        setLoading(false);
        onLogin();
      } else {
        if (member) {
          setError("รหัสผ่านไม่ถูกต้อง — ใช้ชื่อเล่นของท่านเป็นรหัสผ่าน");
        } else {
          setError("ไม่พบ Email นี้ในระบบ — กรุณาติดต่อ Admin");
        }
        setLoading(false);
      }
    }, 500);
  };

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      padding: 20,
      fontFamily: "Sarabun, IBM Plex Sans Thai, sans-serif",
    }}>
      <div style={{
        width: "100%", maxWidth: 420,
        background: "#fff", borderRadius: 20,
        boxShadow: "0 24px 60px rgba(0,0,0,0.18)",
        padding: "44px 40px",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: 16, margin: "0 auto 16px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 30, boxShadow: "0 8px 20px rgba(102,126,234,0.4)",
          }}>🏥</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#1a202c", lineHeight: 1.2 }}>
            Smart Hospital
          </div>
          <div style={{ fontSize: 13, color: "#718096", marginTop: 4 }}>
            Implementation Hub
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {error && (
            <div style={{
              padding: "10px 14px", background: "#fff5f5",
              border: "1px solid #feb2b2", color: "#c53030",
              borderRadius: 8, fontSize: 13, lineHeight: 1.5,
            }}>
              {error}
            </div>
          )}

          {/* Email */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#2d3748" }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="email@bms-hosxp.com"
              autoComplete="email"
              disabled={loading}
              style={{
                padding: "11px 14px", border: "1.5px solid #e2e8f0",
                borderRadius: 8, fontSize: 15, fontFamily: "inherit",
                outline: "none", transition: "border-color 0.15s",
              }}
              onFocus={e => e.target.style.borderColor = "#667eea"}
              onBlur={e => e.target.style.borderColor = "#e2e8f0"}
            />
          </div>

          {/* Password */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#2d3748" }}>
                รหัสผ่าน
              </label>
              <span style={{ fontSize: 11, color: "#a0aec0" }}>
                ใช้ชื่อเล่นของท่าน
              </span>
            </div>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="ชื่อเล่น เช่น อิ๋ว, เนย, นุ๊ก"
              autoComplete="current-password"
              disabled={loading}
              style={{
                padding: "11px 14px", border: "1.5px solid #e2e8f0",
                borderRadius: 8, fontSize: 15, fontFamily: "inherit",
                outline: "none", transition: "border-color 0.15s",
              }}
              onFocus={e => e.target.style.borderColor = "#667eea"}
              onBlur={e => e.target.style.borderColor = "#e2e8f0"}
            />
          </div>

          {/* Remember me */}
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={e => setRememberMe(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: "#667eea", cursor: "pointer" }}
              disabled={loading}
            />
            <span style={{ fontSize: 13, color: "#4a5568" }}>จำ Email ไว้</span>
          </label>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || loadingTeam}
            style={{
              padding: "12px 16px", marginTop: 4,
              background: (loading || loadingTeam) ? "#cbd5e0"
                : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "#fff", border: "none", borderRadius: 8,
              fontSize: 15, fontWeight: 600, cursor: (loading || loadingTeam) ? "not-allowed" : "pointer",
              fontFamily: "inherit", letterSpacing: 0.3,
              boxShadow: (loading || loadingTeam) ? "none" : "0 4px 14px rgba(102,126,234,0.4)",
              transition: "all 0.2s",
            }}
          >
            {loadingTeam ? "กำลังโหลดข้อมูล…" : loading ? "กำลังเข้าสู่ระบบ…" : "เข้าสู่ระบบ"}
          </button>
        </form>

        {/* Info */}
        <div style={{
          marginTop: 24, padding: "12px 16px",
          background: "#ebf8ff", borderRadius: 8, border: "1px solid #bee3f8",
        }}>
          <div style={{ fontSize: 12, color: "#2c5282", lineHeight: 1.7 }}>
            <strong>วิธีเข้าสู่ระบบ:</strong><br />
            • Email: ใช้ email ที่ลงทะเบียนในระบบทีมงาน<br />
            • รหัสผ่าน: ชื่อเล่นของท่าน (เช่น อิ๋ว, เนย, นุ๊ก)
          </div>
        </div>

        <div style={{ marginTop: 20, textAlign: "center", fontSize: 11, color: "#cbd5e0" }}>
          © {new Date().getFullYear()} Smart Hospital Management
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { LoginScreen });
