import { Card, Button, Row, Col, Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";

const PostCardsAll = () => {
    const [posts, setPosts] = useState([]);
    const [users, setUsers] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        fetch("http://localhost:8080/posts", {
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

        // Filtrar los IDs que aún no se han buscado
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
                    return { id, name: "Usuario desconocido" }; // Evita dejar el campo vacío
                })
            )
        ).then(usersData => {
            const nuevosUsuarios = usersData.reduce((acc, { id, name }) => {
                acc[id] = name;
                return acc;
            }, {});

            setUsers(prevUsers => ({ ...prevUsers, ...nuevosUsuarios }));
        });
    }, [posts]); // Se ejecuta cuando `posts` cambia

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
                ))}
            </Row>
        </Container>
    );
};

export default PostCardsAll;
