import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import PostCards from "./PostCards";
import ROUTES from "./routes";

function ProtectedPage() {
    const navigate = useNavigate();

    useEffect(() => {
        const verifyToken = async () => {
            const token = localStorage.getItem("token");

            try {
                const response = await fetch(`http://${ROUTES.USERPATH}/auth/verify-token/${token}`);

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
                    <Navbar.Brand href="#">Mis Posts</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            
                            <Nav.Link href="/protectedAll">Posts</Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            {/* Contenido de la Página */}
            <Container className="mt-4">
                <h2>Bienvenido a tus posts</h2>
                <p>Solo los usuarios autenticados pueden ver esta página.</p>
                <PostCards />
                <Button variant="btn btn-success" onClick={() => navigate(`/createPosts`)}
>               Agregar Posts                
                </Button>
            </Container>
        </>
    );
}

export default ProtectedPage;
