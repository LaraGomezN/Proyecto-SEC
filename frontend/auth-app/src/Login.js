import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login(){
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const validateForm = () => {
        if (!username || !password){
            setError("Username and password are required");
            return false;
        }
        setError("");
        return true;
    };

    const handleSubmit = async(event) => {
        event.preventDefault();
        if (!validateForm()) return;
        setLoading(true);

        const formDetails = new URLSearchParams();
        formDetails.append("username", username);
        formDetails.append("password", password);

        try {
            const response = await fetch("http://localhost:8000/auth/token", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: formDetails,
            });

            setLoading(false)

            if (response.ok){
                const data = await response.json();
                localStorage.setItem("token", data.access_token);
                navigate("/protected");
            } else{
                const errorData = await response.json();
                setError(errorData.detail || "Autenticacion fallida");
                localStorage.setItem("token", "");
            }
        } catch(error){
            setLoading(false);
            setError("Un error ha ocurrido. Por favor intente de nuevo más tarde")
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg w-96">
                <h2 className="text-2xl font-bold text-center mb-6 text-gray-700">Login</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-600 font-medium">Username:</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-600 font-medium">Password:</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                    {error && <p className="text-red-500 text-center mt-2">{error}</p>}
                </form>
            </div>
        </div>
    );
}

export default Login;