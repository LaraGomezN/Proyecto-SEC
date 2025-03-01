import { Card, Button, Row, Col, Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";

const PostCards = () => {
    const [posts, setPosts] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetch("http://localhost:8080/users/posts", {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        })
        .then(response => response.json())
        .then(data => {
            setPosts(data);
        })
        .catch(error => {
            console.error("Error con fetch():", error);
        });
    }, [navigate]);

    // Función para formatear la fecha
    const formatFecha = (fechaISO) => {
        const fecha = new Date(fechaISO);
        return new Intl.DateTimeFormat("es-ES", {
            dateStyle: "long",
            timeStyle: "short"
        }).format(fecha);
    };

    return (
        <Container className="mt-4">
            <Row>
                {posts.map((post) => (
                    <Col key={post.id} md={4} className="mb-4">
                        <Card>
                            <Card.Body>
                                {console.log(post)}
                                <Card.Title>{post.titulo}</Card.Title>
                                <Card.Text>{post.contenido}</Card.Text>
                                <Card.Text>Publicado el {formatFecha(post.fechaPublicacion)}</Card.Text>
                                <Button variant="success" className="me-3" onClick={() => navigate(`/post/${post.id}`)}>
                                    Ver más
                                </Button>
                                <Button variant="primary" className="me-3" onClick={() => navigate(`/updatePost/${post.id}`)}>
                                    Actualizar
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
    );
};

export default PostCards;
