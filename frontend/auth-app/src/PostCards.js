import { Card, Button, Row, Col, Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import ROUTES from "./routes";

// 🔹 Función para eliminar etiquetas HTML y dejar solo el texto
const stripTags = (html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
};

const PostCards = () => {
    const [posts, setPosts] = useState([]);
    const [users, setUsers] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        fetch(`http://${ROUTES.POSTPATH}/users/posts`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        })
        .then(response => response.json())
        .then(data => {
            if (Array.isArray(data)) {
                setPosts(data);
            } else {
                console.error("Error: la respuesta del servidor no es un array", data);
            }
        })
        .catch(error => console.error("Error con fetch():", error));
    }, []);

    useEffect(() => {
        if (posts.length === 0) return;

        const idsUsuarios = [...new Set(posts.map(post => post.idUsuario).filter(id => Number.isInteger(id)))];
        const idsParaBuscar = idsUsuarios.filter(id => !users[id]);

        if (idsParaBuscar.length === 0) return;

        Promise.all(
            idsParaBuscar.map(id =>
                fetch(`http://${ROUTES.USERPATH}/users/${id}`, {
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

    // 🔹 Función para eliminar un post
    const handleDeletePost = async (postId) => {
        const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar este post?");
        if (!confirmDelete) return;

        try {
            const response = await fetch(`http://${ROUTES.POSTPATH}/posts/${postId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });

            if (!response.ok) {
                throw new Error("Error al eliminar el post");
            }

            // 🔹 Actualizar la lista de posts sin recargar la página
            setPosts(posts.filter(post => post.id !== postId));

        } catch (error) {
            console.error("Error eliminando el post:", error);
        }
    };

    return (
        <Container className="mt-4">
            <Row>
                {posts.length > 0 ? (
                    posts.map((post) => (
                        <Col key={post.id} md={4} className="mb-4">
                            <Card>
                                <Card.Body>
                                    <Card.Title>{post.titulo}</Card.Title>
                                    {/* 🔹 Mostrar contenido en texto plano sin etiquetas HTML */}
                                    <Card.Text>{stripTags(post.contenido)}</Card.Text>
                                    <Card.Text>Publicado el {formatFecha(post.fechaPublicacion)}</Card.Text>

                                    {/* 🔹 Botón para ver más detalles */}
                                    <Button 
                                        variant="success" 
                                        className="me-2" 
                                        onClick={() => navigate(`/post/${post.id}`)}
                                    >
                                        Ver más
                                    </Button>

                                    {/* 🔹 Botón para actualizar (editar) el post */}
                                    <Button 
                                        variant="primary" 
                                        className="me-2"
                                        onClick={() => navigate(`/updatePost/${post.id}`)}
                                    >
                                        Editar
                                    </Button>

                                    {/* 🔹 Botón para eliminar el post */}
                                    <Button 
                                        variant="danger" 
                                        onClick={() => handleDeletePost(post.id)}
                                    >
                                        Eliminar
                                    </Button>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))
                ) : (
                    <p>No hay posts disponibles.</p>
                )}
            </Row>
        </Container>
    );
};

export default PostCards;
