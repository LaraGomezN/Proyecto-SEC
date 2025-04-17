import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Button, Form, InputGroup } from "react-bootstrap";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import ROUTES from "./routes";

function CreatePost() {
    const navigate = useNavigate();
    const [titulo, setTitulo] = useState("");
    const [contenido, setContenido] = useState("");
    const [tags, setTags] = useState([]);
    const [selectedTag, setSelectedTag] = useState("");
    const [newTag, setNewTag] = useState("");

    useEffect(() => {
        const verifyToken = async () => {
            const token = localStorage.getItem("token");

            try {
                const response = await fetch(`http://${ROUTES.USERPATH}/auth/verify-token/${token}`);
                if (!response.ok) throw new Error("Token verification failed");
            } catch (error) {
                localStorage.removeItem("token");
                navigate("/");
            }
        };

        verifyToken();

        // Cargar tags con validación
        fetch(`http://${ROUTES.TAGPATH}/tags/`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`
            },
        })
            .then(response => response.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setTags(data);
                } else {
                    console.error("Respuesta inesperada de tags:", data);
                    setTags([]);
                }
            })
            .catch(error => {
                console.error("Error cargando tags:", error);
                setTags([]); // fallback seguro
            });
    }, [navigate]);

    const handleCreateTag = async () => {
        if (!newTag.trim()) return;

        const token = localStorage.getItem("token");

        try {
            const response = await fetch(`http://${ROUTES.TAGPATH}/tags/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ topic: newTag }),
            });

            if (!response.ok) throw new Error("Error al crear el tag");

            const createdTag = await response.json();
            setTags(prev => Array.isArray(prev) ? [...prev, createdTag] : [createdTag]);
            setSelectedTag(createdTag.id);
            setNewTag("");
        } catch (error) {
            console.error("Error al crear el tag:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newPost = { titulo, contenido };

        try {
            const response = await fetch(`http://${ROUTES.POSTPATH}/posts`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify(newPost)
            });

            if (!response.ok) throw new Error("Error al crear el post");

            const jsonResponse = await response.json();
            const valueReturned = Number(jsonResponse.id);
            const tagId = Number(selectedTag);

            const responseTag = await fetch(`http://${ROUTES.POSTPATH}/posts/${valueReturned}/tags/${tagId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });

            if (!responseTag.ok) throw new Error("Error al asociar el tag con el post");

            navigate("/protected");
        } catch (error) {
            console.error("Error:", error);
        }
    };

    return (
        <Container className="mt-4">
            <h2>Crear un Nuevo Post</h2>
            <Form onSubmit={handleSubmit}>
                <Form.Group controlId="titulo">
                    <Form.Label>Titulo</Form.Label>
                    <Form.Control
                        type="text"
                        value={titulo}
                        onChange={(e) => setTitulo(e.target.value)}
                        required
                    />
                </Form.Group>

                <Form.Group controlId="contenido" className="mt-3">
                    <Form.Label>Contenido</Form.Label>
                    <ReactQuill
                        theme="snow"
                        value={contenido}
                        onChange={setContenido}
                        placeholder="Escribe aquí tu post..."
                    />
                </Form.Group>

                <Form.Group controlId="crear-tag" className="mt-3">
                    <Form.Label>Crear un Nuevo Tag</Form.Label>
                    <InputGroup>
                        <InputGroup.Text>#</InputGroup.Text>
                        <Form.Control
                            type="text"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            placeholder="Escribe el nombre del tag"
                        />
                        <Button variant="primary" onClick={handleCreateTag}>
                            Crear Tag
                        </Button>
                    </InputGroup>
                </Form.Group>

                <Form.Group controlId="tags" className="mt-3">
                    <Form.Label>Selecciona un Tag</Form.Label>
                    <Form.Control
                        as="select"
                        value={selectedTag}
                        onChange={(e) => setSelectedTag(e.target.value)}
                        required
                    >
                        <option value="">Selecciona una opción...</option>
                        {Array.isArray(tags) && tags.map(tag => (
                            <option key={tag.id} value={tag.id}>
                                {tag.topic}
                            </option>
                        ))}
                    </Form.Control>
                </Form.Group>

                <Button variant="success" type="submit" className="mt-3 me-3">
                    Publicar Post
                </Button>

                <Button variant="secondary" className="mt-3" onClick={() => navigate(`/protected`)}>
                    Atrás
                </Button>
            </Form>
        </Container>
    );
}

export default CreatePost;
