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
            }
        } catch(error){
            setLoading(false);
            setError("Un error ha ocurrido. Por favor intente de nuevo más tarde")
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Username:</label>
                    <input
                        type = 'text'
                        value = {username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div>
                <label>Password:</label>
                    <input
                        type = 'password'
                        value = {password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button type = 'submit' disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>
                {error && <p style={{color:'red'}}>{error}</p>}
            </form>
        </div>
    );
}

export default Login;