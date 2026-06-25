import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

const api = axios.create({ baseURL: API_URL });
api.interceptors.request.use(req => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

const ACCENT = "#6366f1";
const PRI = {
  high:   { label: "High",   bg: "#2d1a1a", text: "#f87171", bd: "#7f1d1d" },
  medium: { label: "Medium", bg: "#2a1f0a", text: "#fbbf24", bd: "#78350f" },
  low:    { label: "Low",    bg: "#0f2a1a", text: "#4ade80", bd: "#14532d" },
};
const STA = {
  todo:          { label: "To do",       bg: "#1e2030", text: "#94a3b8" },
  "in-progress": { label: "In progress", bg: "#0f2340", text: "#60a5fa" },
  done:          { label: "Done",        bg: "#0f2a1a", text: "#4ade80" },
};

const bi = { width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid #2d3148", background: "#0d0f1a", color: "#e2e8f0", fontSize: 16, outline: "none", boxSizing: "border-box", fontFamily: "inherit" };
const bb = { padding: "12px 20px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 15, transition: "all 0.15s", fontFamily: "inherit" };

function Badge({ bg, color, bd, children }) {
  return <span style={{ background: bg, color, border: `1px solid ${bd || "transparent"}`, padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 500 }}>{children}</span>;
}
function Field({ label, children }) {
  return <div style={{ display: "flex", flexDirection: "column", gap: 6 }}><label style={{ color: "#94a3b8", fontSize: 13, fontWeight: 500 }}>{label}</label>{children}</div>;
}
function Logo({ size = "lg" }) {
  const big = size === "lg";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: big ? 10 : 8, justifyContent: "center" }}>
      <div style={{ width: big ? 44 : 32, height: big ? 44 : 32, borderRadius: big ? 12 : 9, background: ACCENT, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <span style={{ fontSize: big ? 22 : 16 }}>✓</span>
      </div>
      <span style={{ color: "#e2e8f0", fontWeight: 700, fontSize: big ? 24 : 18 }}>TaskFlow</span>
    </div>
  );
}
function ErrBanner({ msg }) {
  return <div style={{ background: "#2d1a1a", border: "1px solid #7f1d1d", color: "#f87171", padding: "10px 14px", borderRadius: 10, fontSize: 13 }}>{msg}</div>;
}
function Overlay({ children, onClose }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 100 }}>
      <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 560 }}>{children}</div>
    </div>
  );
}
function ModalCard({ children }) {
  return <div style={{ background: "#0d0f1a", border: "1px solid #2d3148", borderRadius: "18px 18px 0 0", overflow: "hidden" }}>{children}</div>;
}
function ModalHeader({ title, onClose }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px", borderBottom: "1px solid #1e2240" }}>
      <h2 style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 16, margin: 0 }}>{title}</h2>
      <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#64748b", cursor: "pointer", fontSize: 24, lineHeight: 1, padding: 4 }}>×</button>
    </div>
  );
}

function LoginPage({ onLogin, onSwitch }) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const submit = async e => {
    e.preventDefault();
    setErr(""); setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password: pw });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      onLogin(data.user);
    } catch (err) {
      setErr(err.response?.data?.message || "Login failed");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#080a12", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ width: "100%", maxWidth: 420, background: "#0d0f1a", border: "1px solid #1e2240", borderRadius: 20, padding: "32px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}><Logo /><p style={{ color: "#94a3b8", marginTop: 8, fontSize: 14 }}>Sign in to your workspace</p></div>
        {err && <div style={{ marginBottom: 16 }}><ErrBanner msg={err} /></div>}
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Field label="Email"><input style={bi} type="email" value={email} onChange={e => { setEmail(e.target.value); setErr(""); }} placeholder="you@example.com" required /></Field>
          <Field label="Password">
            <div style={{ position: "relative" }}>
              <input style={{ ...bi, paddingRight: 60 }} type={showPw ? "text" : "password"} value={pw} onChange={e => { setPw(e.target.value); setErr(""); }} placeholder="••••••••" required />
              <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 13, fontWeight: 500 }}>{showPw ? "Hide" : "Show"}</button>
            </div>
          </Field>
          <button type="submit" disabled={loading} style={{ ...bb, background: ACCENT, color: "#fff", marginTop: 4, width: "100%", opacity: loading ? 0.7 : 1 }}>{loading ? "Signing in..." : "Sign in"}</button>
        </form>
        <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "#94a3b8" }}>No account? <span onClick={onSwitch} style={{ color: ACCENT, cursor: "pointer", fontWeight: 600 }}>Create one</span></p>
      </div>
    </div>
  );
}

function SignupPage({ onLogin, onSwitch }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async e => {
    e.preventDefault();
    setErr(""); setLoading(true);
    try {
      const { data } = await api.post("/auth/signup", { name, email, password: pw });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      onLogin(data.user);
    } catch (err) {
      setErr(err.response?.data?.message || "Signup failed");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#080a12", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ width: "100%", maxWidth: 420, background: "#0d0f1a", border: "1px solid #1e2240", borderRadius: 20, padding: "32px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}><Logo /><p style={{ color: "#94a3b8", marginTop: 8, fontSize: 14 }}>Create your free account</p></div>
        {err && <div style={{ marginBottom: 16 }}><ErrBanner msg={err} /></div>}
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Field label="Full name"><input style={bi} value={name} onChange={e => setName(e.target.value)} placeholder="Jane Smith" required /></Field>
          <Field label="Email"><input style={bi} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required /></Field>
          <Field label="Password"><input style={bi} type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="At least 6 characters" required /></Field>
          <button type="submit" disabled={loading} style={{ ...bb, background: ACCENT, color: "#fff", marginTop: 4, width: "100%", opacity: loading ? 0.7 : 1 }}>{loading ? "Creating account..." : "Create account"}</button>
        </form>
        <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "#94a3b8" }}>Already have an account? <span onClick={onSwitch} style={{ color: ACCENT, cursor: "pointer", fontWeight: 600 }}>Sign in</span></p>
      </div>
    </div>
  );
}

function TaskCard({ task, onEdit, onDelete, onShare, onStatusChange }) {
  const [hov, setHov] = useState(false);
  const p = PRI[task.priority] || PRI.medium;
  const s = STA[task.status] || STA.todo;
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: "#0d0f1a", border: `1px solid ${hov ? "#3d4268" : "#1e2240"}`, borderRadius: 16, padding: "16px", transition: "all 0.15s", display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <h3 style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 15, margin: 0, lineHeight: 1.4, flex: 1 }}>{task.title}</h3>
        <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
          <button onClick={onEdit} style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: 16, padding: "4px 6px", borderRadius: 6 }}>✏️</button>
          <button onClick={onShare} style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: 16, padding: "4px 6px", borderRadius: 6 }}>🔗</button>
          <button onClick={onDelete} style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: 16, padding: "4px 6px", borderRadius: 6 }}>🗑️</button>
        </div>
      </div>
      {task.description && <p style={{ color: "#64748b", fontSize: 13, margin: 0, lineHeight: 1.6 }}>{task.description}</p>}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <Badge bg={p.bg} color={p.text} bd={p.bd}>{p.label}</Badge>
        <Badge bg={s.bg} color={s.text}>{s.label}</Badge>
        {task.due_date && <Badge bg="#1a1f35" color="#94a3b8">📅 {new Date(task.due_date).toLocaleDateString()}</Badge>}
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        {Object.entries(STA).map(([key, val]) => (
          <button key={key} onClick={() => onStatusChange(key)} style={{ flex: 1, padding: "6px 0", borderRadius: 8, border: `1px solid ${task.status === key ? "transparent" : "#1e2240"}`, cursor: "pointer", fontSize: 11, fontWeight: 600, background: task.status === key ? val.bg : "transparent", color: task.status === key ? val.text : "#374151", transition: "all 0.15s", fontFamily: "inherit" }}>
            {val.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function TaskModal({ task, onClose, onSave }) {
  const [title, setTitle] = useState(task.title || "");
  const [desc, setDesc] = useState(task.description || "");
  const [status, setStatus] = useState(task.status || "todo");
  const [priority, setPriority] = useState(task.priority || "medium");
  const [dueDate, setDueDate] = useState(task.due_date ? task.due_date.split("T")[0] : "");
  const submit = e => { e.preventDefault(); if (!title.trim()) return; onSave({ title: title.trim(), description: desc.trim(), status, priority, dueDate: dueDate || null }); };
  return (
    <Overlay onClose={onClose}>
      <ModalCard>
        <ModalHeader title={task.id ? "Edit task" : "New task"} onClose={onClose} />
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14, padding: "16px 20px 24px" }}>
          <Field label="Title *"><input style={bi} value={title} onChange={e => setTitle(e.target.value)} placeholder="What needs to be done?" required autoFocus /></Field>
          <Field label="Description"><textarea style={{ ...bi, resize: "vertical", minHeight: 80 }} value={desc} onChange={e => setDesc(e.target.value)} placeholder="Add more details..." /></Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Status">
              <select style={bi} value={status} onChange={e => setStatus(e.target.value)}>
                <option value="todo">To do</option>
                <option value="in-progress">In progress</option>
                <option value="done">Done</option>
              </select>
            </Field>
            <Field label="Priority">
              <select style={bi} value={priority} onChange={e => setPriority(e.target.value)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </Field>
          </div>
          <Field label="Due date"><input style={bi} type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} /></Field>
          <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
            <button type="button" onClick={onClose} style={{ ...bb, flex: 1, background: "transparent", border: "1px solid #2d3148", color: "#94a3b8" }}>Cancel</button>
            <button type="submit" style={{ ...bb, flex: 1, background: ACCENT, color: "#fff" }}>{task.id ? "Save" : "Create task"}</button>
          </div>
        </form>
      </ModalCard>
    </Overlay>
  );
}

function ShareModal({ task, token, onClose }) {
  const [copied, setCopied] = useState(false);
  const link = `${window.location.origin}${window.location.pathname}#/shared/${token}`;
  const copy = () => { navigator.clipboard.writeText(link).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); };
  return (
    <Overlay onClose={onClose}>
      <ModalCard>
        <ModalHeader title="Share task" onClose={onClose} />
        <div style={{ padding: "16px 20px 24px" }}>
          <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: 16, lineHeight: 1.6 }}>Anyone with this link can view <strong style={{ color: "#e2e8f0" }}>"{task.title}"</strong> without signing in.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input readOnly value={link} style={{ ...bi, color: "#64748b", fontSize: 12 }} />
            <button onClick={copy} style={{ ...bb, background: copied ? "#14532d" : ACCENT, color: "#fff", width: "100%" }}>{copied ? "✓ Copied!" : "Copy link"}</button>
          </div>
        </div>
      </ModalCard>
    </Overlay>
  );
}

function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <Overlay onClose={onCancel}>
      <ModalCard>
        <div style={{ padding: "20px 20px 24px" }}>
          <p style={{ color: "#e2e8f0", fontSize: 15, marginBottom: 24, lineHeight: 1.6 }}>{message}</p>
          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={onCancel} style={{ ...bb, flex: 1, background: "transparent", border: "1px solid #2d3148", color: "#94a3b8" }}>Cancel</button>
            <button onClick={onConfirm} style={{ ...bb, flex: 1, background: "#7f1d1d", color: "#fca5a5" }}>Delete</button>
          </div>
        </div>
      </ModalCard>
    </Overlay>
  );
}

function Dashboard({ user, onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [taskModal, setTaskModal] = useState(null);
  const [shareModal, setShareModal] = useState(null);
  const [delConfirm, setDelConfirm] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const fetchTasks = async () => {
    try {
      const { data } = await api.get("/tasks");
      setTasks(data);
    } catch (err) {
      if (err.response?.status === 401) onLogout();
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchTasks(); }, []);

  const filtered = tasks.filter(t => {
    const mf = filter === "all" || t.status === filter;
    const ms = !search || t.title.toLowerCase().includes(search.toLowerCase()) || (t.description || "").toLowerCase().includes(search.toLowerCase());
    return mf && ms;
  });

  const stats = { total: tasks.length, done: tasks.filter(t => t.status === "done").length, inProgress: tasks.filter(t => t.status === "in-progress").length, todo: tasks.filter(t => t.status === "todo").length };

  const handleSave = async data => {
    try {
      if (taskModal?.id) {
        await api.put(`/tasks/${taskModal.id}`, data);
        showToast("Task updated");
      } else {
        await api.post("/tasks", data);
        showToast("Task created");
      }
      setTaskModal(null);
      fetchTasks();
    } catch { showToast("Failed to save task", "error"); }
  };

  const handleDelete = async id => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(prev => prev.filter(t => t.id !== id));
      setDelConfirm(null);
      showToast("Task deleted", "error");
    } catch { showToast("Failed to delete", "error"); }
  };

  const handleShare = async task => {
    try {
      const { data } = await api.post(`/tasks/${task.id}/share`);
      setShareModal({ task, token: data.token });
    } catch { showToast("Failed to generate link", "error"); }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/tasks/${id}`, { status });
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
      showToast("Status updated");
    } catch { showToast("Failed to update", "error"); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#080a12", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <nav style={{ background: "#0d0f1a", borderBottom: "1px solid #1e2240", padding: "0 16px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 30 }}>
        <Logo size="sm" />
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ color: "#94a3b8", fontSize: 13 }}>Hi, <strong style={{ color: "#e2e8f0" }}>{user.name.split(" ")[0]}</strong></span>
          <button onClick={onLogout} style={{ ...bb, padding: "6px 14px", background: "transparent", border: "1px solid #2d3148", color: "#94a3b8", fontSize: 13 }}>Sign out</button>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 16px 100px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 20 }}>
          {[{ label: "Total", value: stats.total, color: "#e2e8f0" }, { label: "To do", value: stats.todo, color: "#94a3b8" }, { label: "In progress", value: stats.inProgress, color: "#60a5fa" }, { label: "Done", value: stats.done, color: "#4ade80" }].map(s => (
            <div key={s.label} style={{ background: "#0d0f1a", border: "1px solid #1e2240", borderRadius: 14, padding: "14px 16px" }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ position: "relative", marginBottom: 14 }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 16, pointerEvents: "none" }}>🔍</span>
          <input style={{ ...bi, paddingLeft: 40 }} placeholder="Search tasks..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 16, overflowX: "auto", paddingBottom: 4 }}>
          {["all", "todo", "in-progress", "done"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ ...bb, padding: "8px 14px", background: filter === f ? ACCENT : "transparent", color: filter === f ? "#fff" : "#94a3b8", border: filter === f ? "none" : "1px solid #2d3148", fontSize: 13, whiteSpace: "nowrap", flexShrink: 0 }}>
              {f === "in-progress" ? "In progress" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748b" }}>Loading tasks...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
            <p style={{ color: "#64748b", fontSize: 16, marginBottom: 20 }}>{search ? "No tasks match your search" : "No tasks here yet"}</p>
            {!search && <button onClick={() => setTaskModal({})} style={{ ...bb, background: ACCENT, color: "#fff" }}>Create your first task</button>}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
            {filtered.map(task => (
              <TaskCard key={task.id} task={task}
                onEdit={() => setTaskModal(task)}
                onDelete={() => setDelConfirm(task.id)}
                onShare={() => handleShare(task)}
                onStatusChange={s => handleStatusChange(task.id, s)}
              />
            ))}
          </div>
        )}
      </div>

      <button onClick={() => setTaskModal({})} style={{ position: "fixed", bottom: 24, right: 24, width: 56, height: 56, borderRadius: "50%", background: ACCENT, color: "#fff", border: "none", fontSize: 28, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 20px rgba(99,102,241,0.5)", zIndex: 40 }}>+</button>

      {taskModal !== null && <TaskModal task={taskModal} onClose={() => setTaskModal(null)} onSave={handleSave} />}
      {shareModal && <ShareModal task={shareModal.task} token={shareModal.token} onClose={() => setShareModal(null)} />}
      {delConfirm && <ConfirmModal message="Delete this task?" onConfirm={() => handleDelete(delConfirm)} onCancel={() => setDelConfirm(null)} />}

      {toast && (
        <div style={{ position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)", background: toast.type === "error" ? "#7f1d1d" : "#14532d", color: "#fff", padding: "12px 24px", borderRadius: 50, fontSize: 14, fontWeight: 500, zIndex: 1000, whiteSpace: "nowrap" }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const u = localStorage.getItem("user");
    return u ? JSON.parse(u) : null;
  });
  const [view, setView] = useState("login");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setCurrentUser(null);
  };

  if (currentUser) return <Dashboard user={currentUser} onLogout={handleLogout} />;
  if (view === "login") return <LoginPage onLogin={setCurrentUser} onSwitch={() => setView("signup")} />;
  return <SignupPage onLogin={setCurrentUser} onSwitch={() => setView("login")} />;
}


