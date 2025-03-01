import { Card, Button, Row, Col, Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import axios from "axios";


const PostCards = () => {
    const [posts, setPosts] = useState([]); // Estado para almacenar los posts
    const navigate = useNavigate();
    useEffect(() => {
        console.log("Probando con fetch()...");
    
        fetch("http://localhost:8080/users/posts", {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log("Respuesta fetch:", data);
            setPosts(data);
        })
        .catch(error => {
            console.error("Error con fetch():", error);
        });
    }, [navigate]);

    return (
        <Container className="mt-4">
            <Row>
                {posts.map((post) => (
                    <Col key={post.id} md={4} className="mb-4">
                        <Card>
                            <Card.Body>
                                <Card.Text>{post.titulo}</Card.Text>
                                <Card.Text>{post.fechaPublicacion}</Card.Text>
                                <Button 
                                variant="primary"
                                onClick={() => navigate(`/post/${post.id}`)}
                            >
                                Ver más
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