import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import ProtectedPage from "./Protected";
import PostDetail from "./PostDetail";
import CreatePost from "./CreatePost";
import PostUpdate from "./PostUpdate";
import ProtectedPageAll from "./ProtectedAll"

function App() {
  return(
    <Router>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/protected" element={<ProtectedPage />} />
        <Route path="/post/:postId" element={<PostDetail />} />
        <Route path="/createPosts" element={<CreatePost />} />
        <Route path="/updatePost/:postId" element={<PostUpdate />} />
        <Route path="/protectedAll" element={<ProtectedPageAll />} />
      </Routes>
    </Router>
  );
}

export default App;

