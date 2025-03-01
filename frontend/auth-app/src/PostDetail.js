import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Button, Card, Spinner, Form, ListGroup, Badge } from "react-bootstrap";

function PostDetail() {
    const { postId } = useParams(); // Obtiene el ID del post desde la URL
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reviews, setReviews] = useState([]); // Estado para las reviews
    const [tags, setTags] = useState([]); // Estado para los tags del post
    const [score, setScore] = useState(0);
    const [comment, setComment] = useState("");

    useEffect(() => {
        const fetchPostDetail = async () => {
            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/");
                return;
            }

            try {
                // Obtener el post
                const response = await fetch(`http://localhost:8080/posts/${postId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch post");
                }

                const data = await response.json();
                setPost(data);

                // 🔹 Obtener solo las reviews del post actual
                const reviewsResponse = await fetch(`http://localhost:8082/posts/${postId}/reviews`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (reviewsResponse.ok) {
                    const reviewsData = await reviewsResponse.json();
                    setReviews(reviewsData);
                } else {
                    console.error("Failed to fetch reviews");
                }

                // 🔹 Obtener los tags del post actual
                const tagsResponse = await fetch(`http://localhost:8080/posts/${postId}/tags`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (tagsResponse.ok) {
                    const tagsData = await tagsResponse.json();
                    setTags(tagsData);
                } else {
                    console.error("Failed to fetch tags");
                }
            } catch (error) {
                console.error(error);
                navigate("/protected");
            } finally {
                setLoading(false);
            }
        };

        fetchPostDetail();
    }, [postId, navigate]);

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");

        try {
            const response = await fetch("http://localhost:8082/reviews/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    post_id: parseInt(postId),
                    user_id: 1, // El user_id debería obtenerse del token
                    score: parseFloat(score),
                    comment,
                }),
            });

            if (!response.ok) throw new Error("Failed to add review");

            const newReview = await response.json();
            setReviews([...reviews, newReview]); // Agregar la nueva review al estado
            setScore(0);
            setComment("");
        } catch (error) {
            console.error(error);
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
                    <Card.Title>{post.id}</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">
                        Published on {new Date(post.fechaPublicacion).toLocaleDateString()}
                    </Card.Subtitle>
                    <Card.Text>{post.titulo}</Card.Text>

                    {/* 🔹 Sección de Tags en forma de # */}
                    <div className="mb-3">
                        {tags.length > 0 ? (
                            tags.map((tag) => (
                                <Badge key={tag.id} pill bg="primary" className="me-2">
                                    #{tag.topic}
                                </Badge>
                            ))
                        ) : (
                            <p>No tags available</p>
                        )}
                    </div>

                    <Button onClick={() => navigate("/protected")} variant="secondary">Back</Button>
                </Card.Body>
            </Card>

            {/* Sección de Reviews */}
            <h3 className="mt-4">Reviews</h3>
            {reviews.length === 0 ? (
                <p>No reviews yet. Be the first to review!</p>
            ) : (
                <ListGroup className="mb-4">
                    {reviews.map((review) => (
                        <ListGroup.Item key={review.id}>
                            <strong>Score:</strong> {review.score}/5
                            <br />
                            <strong>Comment:</strong> {review.comment}
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            )}

            {/* Formulario para agregar una Review */}
            <h4>Add a Review</h4>
            <Form onSubmit={handleReviewSubmit}>
                <Form.Group className="mb-3">
                    <Form.Label>Score (0-5)</Form.Label>
                    <Form.Control
                        type="number"
                        min="0"
                        max="5"
                        step="0.1"
                        value={score}
                        onChange={(e) => setScore(e.target.value)}
                        required
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Comment</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        required
                    />
                </Form.Group>
                <Button variant="primary" type="submit">
                    Submit Review
                </Button>
            </Form>
        </Container>
    );
}

export default PostDetail;
