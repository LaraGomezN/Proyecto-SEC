import { Card, Button, Row, Col, Container, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";

const PostCardsAll = () => {
    const [posts, setPosts] = useState([]);
    const [users, setUsers] = useState({});
    const [tags, setTags] = useState([]); // Lista de tags disponibles
    const [selectedTag, setSelectedTag] = useState(null); // Tag seleccionado para el filtro
    const navigate = useNavigate();

    // Función para obtener los posts, con o sin filtro de tags
    const fetchPosts = async (tagId = null) => {
        let url = "http://localhost:8080/posts";
        if (tagId) {
            url = `http://localhost:8080/posts/tags/${tagId}`;
        }

        try {
            const response = await fetch(url, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });

            const data = await response.json();
            if (Array.isArray(data)) {
                setPosts(data);
            } else {
                console.error("Error: la respuesta del servidor no es un array", data);
                setPosts([]);
            }
        } catch (error) {
            console.error("Error al obtener posts:", error);
        }
    };

    // Función para obtener la lista de tags disponibles
    const fetchTags = async () => {
        try {
            const response = await fetch("http://localhost:8081/tags", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });

            const data = await response.json();
            if (Array.isArray(data)) {
                setTags(data);
            } else {
                console.error("Error: la respuesta del servidor no es un array", data);
            }
        } catch (error) {
            console.error("Error al obtener tags:", error);
        }
    };

    useEffect(() => {
        fetchPosts();
        fetchTags();
    }, []);

    useEffect(() => {
        fetchPosts(selectedTag);
    }, [selectedTag]);

    useEffect(() => {
        if (posts.length === 0) return;

        const idsUsuarios = [...new Set(posts.map(post => post.idUsuario).filter(id => Number.isInteger(id)))];
        const idsParaBuscar = idsUsuarios.filter(id => !users[id]);

        if (idsParaBuscar.length === 0) return;

        Promise.all(
            idsParaBuscar.map(id =>
                fetch(`http://localhost:8000/users/${id}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
                })
                .then(response => response.json())
                .then(data => ({ id, name: data.name }))
                .catch(error => {
                    console.error(`Error al obtener usuario ${id}:`, error);
                    return { id, name: "Usuario desconocido" };
                })
            )
        ).then(usersData => {
            const nuevosUsuarios = usersData.reduce((acc, { id, name }) => {
                acc[id] = name;
                return acc;
            }, {});

            setUsers(prevUsers => ({ ...prevUsers, ...nuevosUsuarios }));
        });
    }, [posts]);

    const formatFecha = (fechaISO) => {
        const fecha = new Date(fechaISO);
        return new Intl.DateTimeFormat("es-ES", {
            dateStyle: "long",
            timeStyle: "short"
        }).format(fecha);
    };

    return (
        <Container className="mt-4">
            {/* 🔹 Filtro de Tags - Estilo Blog */}
            <div className="mb-3">
                <h5>Filtrar por Tags:</h5>
                <Badge
                    pill
                    bg={!selectedTag ? "dark" : "secondary"}
                    className="me-2 tag-badge"
                    onClick={() => setSelectedTag(null)}
                    style={{ cursor: "pointer" }}
                >
                    Todos
                </Badge>
                {tags.map((tag) => (
                    <Badge
                        key={tag.id}
                        pill
                        bg={selectedTag === tag.id ? "primary" : "secondary"}
                        className="me-2 tag-badge"
                        onClick={() => setSelectedTag(tag.id)}
                        style={{ cursor: "pointer" }}
                    >
                        #{tag.topic}
                    </Badge>
                ))}
            </div>

            <Row>
                {posts.length > 0 ? (
                    posts.map((post) => (
                        <Col key={post.id} md={4} className="mb-4">
                            <Card>
                                <Card.Body>
                                    <Card.Title>{post.titulo}</Card.Title>
                                    <Card.Text>{post.contenido}</Card.Text>
                                    <Card.Text>Publicado el {formatFecha(post.fechaPublicacion)}</Card.Text>
                                    <Card.Text>Autor: {users[post.idUsuario] || "Cargando..."}</Card.Text>
                                    <Button variant="success" className="me-3" onClick={() => navigate(`/post/${post.id}`)}>
                                        Ver más
                                    </Button>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))
                ) : (
                    <p>No hay posts disponibles para este filtro.</p>
                )}
            </Row>
        </Container>
    );
};

export default PostCardsAll;

