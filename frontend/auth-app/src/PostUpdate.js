import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Button, Card, Spinner, Form } from "react-bootstrap";
import ReactQuill from "react-quill-new"; // Importar la versión compatible con React 19
import "react-quill-new/dist/quill.snow.css"; // Estilos de Quill
import ROUTES from "./routes";

function PostUpdate() {
    const { postId } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newTitle, setNewTitle] = useState("");
    const [newContent, setNewContent] = useState("");

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

    useEffect(() => {
        const fetchPostDetail = async () => {
            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/");
                return;
            }

            try {
                const response = await fetch(`http://${ROUTES.POSTPATH}/posts/${postId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch post");
                }

                const data = await response.json();
                setPost(data);
                setNewTitle(data.titulo);
                setNewContent(data.contenido);
            } catch (error) {
                console.error(error);
                navigate("/protected");
            } finally {
                setLoading(false);
            }
        };

        fetchPostDetail();
    }, [postId, navigate]);

    const handleUpdatePost = async () => {
        const token = localStorage.getItem("token");

        try {
            const response = await fetch(`http://${ROUTES.POSTPATH}/posts/${postId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ titulo: newTitle, contenido: newContent }),
            });

            if (!response.ok) throw new Error("Failed to update post");

            const updatedPost = await response.json();
            setPost(updatedPost);
            alert("Post updated successfully!");
            navigate("/protected");
        } catch (error) {
            console.error("Error updating post:", error);
        }
    };

    if (loading) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" />
                <p>Loading post...</p>
            </Container>
        );
    }

    if (!post) {
        return (
            <Container className="text-center mt-5">
                <h3>Post not found</h3>
                <Button onClick={() => navigate("/protected")} variant="primary">Go Back</Button>
            </Container>
        );
    }

    return (
        <Container className="mt-4">
            <Card>
                <Card.Body>
                    <Card.Title> {post.titulo}</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">
                        Published on {new Date(post.fechaPublicacion).toLocaleString()}
                    </Card.Subtitle>

                    {/* 🔹 Vista previa con formato */}
                    <div className="mb-3">
                        <h5>Vista Previa del Contenido:</h5>
                        <div 
                            className="border p-2 rounded"
                            dangerouslySetInnerHTML={{ __html: post.contenido }} 
                        />
                    </div>

                    {/* 🔹 Campo para editar el título */}
                    <Form.Group className="mb-3">
                        <Form.Label>Editar Título</Form.Label>
                        <Form.Control
                            type="text"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                        />
                    </Form.Group>

                    {/* 🔹 Editor WYSIWYG usando la nueva versión de `react-quill` */}
                    <Form.Group className="mb-3">
                        <Form.Label>Editar Contenido</Form.Label>
                        <ReactQuill 
                            theme="snow"
                            value={newContent}
                            onChange={setNewContent}
                        />
                    </Form.Group>

                    <Button onClick={handleUpdatePost} variant="success">Actualizar Post</Button>
                    <Button onClick={() => navigate("/protected")} variant="secondary" className="ms-2">Atrás</Button>
                </Card.Body>
            </Card>
        </Container>
    );
}

export default PostUpdate;
