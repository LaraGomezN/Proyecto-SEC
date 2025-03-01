import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import PostCardsAll from "./PostCardsAll";

function ProtectedPageAll() {
    const navigate = useNavigate();

    useEffect(() => {
        const verifyToken = async () => {
            const token = localStorage.getItem("token");

            try {
                const response = await fetch(`http://localhost:8000/auth/verify-token/${token}`);

                if (!response.ok) {
                    throw new Error("Token verification failed");
                }
            } catch (error) {
                localStorage.removeItem("token");
                navigate("/");
            }
        };

        verifyToken();
    }, [navigate]);

    return (
        <>
            {/* Navbar */}
            <Navbar bg="dark" variant="dark" expand="lg">
    <Container>
        <Nav className="d-flex align-items-center">
            <Nav.Link href="/protected" className="me-3">Mis Posts</Nav.Link>
            <Navbar.Brand href="#">Posts</Navbar.Brand>
        </Nav>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
    </Container>
</Navbar>

            {/* Contenido de la Página */}
            <Container className="mt-4">
                <h2>Bienvenido a todos los posts</h2>
                <p>Solo los usuarios autenticados pueden ver esta página.</p>
                <PostCardsAll />
            </Container>
        </>
    );
}

export default ProtectedPageAll;
