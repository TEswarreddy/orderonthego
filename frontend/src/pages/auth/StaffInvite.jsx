import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../../api/axios";

const StaffInvite = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      alert("Please provide a username and password");
      return;
    }

    try {
      setLoading(true);
      await axios.post(`/staff/invites/${token}/complete`, {
        username,
        password,
      });
      alert("✅ Account created. Awaiting owner approval.");
      navigate("/login");
    } catch (err) {
      alert("❌ " + (err.response?.data?.message || "Invite could not be completed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Complete Staff Invite</h2>
        <p className="text-sm text-gray-600 mb-4 text-center">
          Set your username and password to activate your staff account.
        </p>
        <input
          type="text"
          placeholder="Username"
          className="w-full p-2 mb-3 border"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 mb-4 border"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          disabled={loading}
          className="w-full bg-black text-white p-2 disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Create Account"}
        </button>
      </form>
    </div>
  );
};

export default StaffInvite;
