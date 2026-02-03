import { useState } from "react";
import axios from "../../api/axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    userType: "USER",
  });

  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/auth/register", form);
      alert("Registered successfully");
      navigate("/login");
    } catch (err) {
      alert(err.response.data.message);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <form className="bg-white p-6 rounded shadow w-80" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>
        <input
          name="username"
          placeholder="Username"
          className="w-full p-2 mb-2 border"
          onChange={handleChange}
        />
        <input
          name="email"
          placeholder="Email"
          className="w-full p-2 mb-2 border"
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          className="w-full p-2 mb-2 border"
          onChange={handleChange}
        />
        <select
          name="userType"
          className="w-full p-2 mb-3 border"
          onChange={handleChange}
        >
          <option value="USER">User</option>
          <option value="RESTAURANT">Restaurant</option>
        </select>
        <button className="w-full bg-black text-white p-2">
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;
