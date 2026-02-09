import { useState, useContext } from "react";
import axios from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/auth/login", {
        email,
        password,
      });
      login(res.data);

      if (res.data.userType === "ADMIN") navigate("/admin");
      else if (res.data.userType === "RESTAURANT" || res.data.userType === "STAFF") navigate("/restaurant");
      else navigate("/");
    } catch (err) {
      alert(err.response.data.message);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow w-80"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 mb-3 border"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 mb-3 border"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="w-full bg-black text-white p-2">
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
