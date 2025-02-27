import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
    const [name, setName] = useState(""); // Cambiado de username a name
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
            const response = await fetch("http://localhost:8000/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name, // Usamos 'name' en lugar de 'username'
                    email,
                    password,
                }),
            });

            setLoading(false);

            if (response.ok) {
                navigate("/login");
            } else {
                const errorData = await response.json();
                setError(
                    typeof errorData.detail === "string"
                        ? errorData.detail
                        : "Registration failed"
                );
            }
        } catch (error) {
            setLoading(false);
            setError("An error occurred. Please try again later.");
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Name:</label> {/* Cambiado de Username a Name */}
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? "Registering..." : "Register"}
                </button>
                {error && <p style={{ color: "red" }}>{error}</p>}
            </form>
            <div>
                <p>Already registered? <a href="/login">Go to login</a></p>
            </div>
        </div>
    );
}

export default Register;
