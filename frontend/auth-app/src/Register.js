import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ROUTES from "./routes";

function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const validateForm = () => {
        if (!name || !email || !password) {
            setError("All fields are required");
            return false;
        }
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
            setError("Invalid email format");
            return false;
        }
        setError("");
        return true;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!validateForm()) return;
        setLoading(true);

        try {
            const response = await fetch(`http://${ROUTES.USERPATH}/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name, email, password }),
            });

            setLoading(false);

            if (response.ok) {
                navigate("/login");
            } else {
                const errorData = await response.json();
                setError(typeof errorData.detail === "string" ? errorData.detail : "Registration failed");
            }
        } catch (error) {
            setLoading(false);
            setError("An error occurred. Please try again later.");
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg w-96">
                <h2 className="text-2xl font-bold text-center mb-6">Register</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block font-medium">Name:</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
                        />
                    </div>
                    <div>
                        <label className="block font-medium">Email:</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
                        />
                    </div>
                    <div>
                        <label className="block font-medium">Password:</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
                    >
                        {loading ? "Registering..." : "Register"}
                    </button>
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                </form>
                <p className="text-center text-sm mt-4">
                    Already registered? <a href="/login" className="text-blue-500 hover:underline">Go to login</a>
                </p>
            </div>
        </div>
    );
}

export default Register;