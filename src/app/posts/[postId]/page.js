"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Button, Box, TextField } from "@mui/material";
import Layout from '../../Components/Layout';
import '../../css/modulePage.css';

const CommentPage = () => {
  const [moduleInfo, setModuleInfo] = useState({});
  const [posts, setPosts] = useState([]);
  const [username, setUsername] = useState('');
  const router = useRouter();
  const moduleId = localStorage.getItem('currentModuleId');
  const [comments, setComments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (router.query && router.query.moduleId) {
      const { moduleId } = router.query;
      setModuleId(moduleId);
      fetchPostsByModule(moduleId);
    }
  }, [router.query]);

  async function runDBCallAsync(url, formData) {
    try {
      const res = await fetch(url, {
        method: 'POST', // Use POST method
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error during fetch: ", error);
      throw error;
    }
  }

  useEffect(() => {
    const getUsernameFromCookies = () => {
      const allCookies = document.cookie.split('; ');
      const usernameCookie = allCookies.find(cookie => cookie.startsWith('username='));
      return usernameCookie ? decodeURIComponent(usernameCookie.split('=')[1]) : '';
    };
    const usernameFromCookies = getUsernameFromCookies();
    setUsername(usernameFromCookies);
  }, []);

  useEffect(() => {
    const fetchUserInfo = async () => {
      const userId = getUserIdFromCookies();
      if (!userId) {
        console.log("User ID not found.");
        return;
      }
      try {
        const res = await fetch(`/api/getUserInfo?userId=${userId}`);
        if (!res.ok) {
          throw new Error("Failed to fetch user information");
        }
        const { user } = await res.json();
        if (user && user.length > 0) {
          const userInfo = user[0];
          setEmail(userInfo.email);
        }
      } catch (error) {
        console.error("Error fetching user information:", error);
      }
    };
    fetchUserInfo();
  }, []);

  useEffect(() => {
    const fetchPostsForModule = async () => {
      if (!moduleId) return;
      try {
        const response = await fetch(`/api/getPostByModule?moduleId=${moduleId}`);
        if (!response.ok) throw new Error('Failed to fetch posts for module');
        const data = await response.json();
        setPosts(data.posts || []);
      } catch (error) {
        console.error('Error fetching posts for module:', error);
      }
    };
    fetchPostsForModule();
  }, [moduleId]);

  const getUserIdFromCookies = () => {
    const allCookies = document.cookie.split('; ');
    const userIdCookie = allCookies.find(cookie => cookie.startsWith('userId='));
    return userIdCookie ? decodeURIComponent(userIdCookie.split('=')[1]) : null;
  };

  const handleViewPost = (post) => {
    setSelectedPost(post);
    setIsModalOpen(true);
    fetch(`/api/getCommentsById?postId=${post._id}`)
      .then((res) => res.json())
      .then((comments) => {
        setComments(comments);
      })
      .catch((error) => {
        console.error('Error fetching comments:', error);
      });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPost(null);
    setComments([]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const content = event.target.content.value.trim();
    if (!content || !selectedPost || !selectedPost._id) return;

    if (!username) {
      console.error('Username is not available.');
      return;
    }

    const timestamp = new Date();

    try {
      const response = await fetch(`/api/createComment?poster=${username}&content=${content}&timestamp=${timestamp}&postId=${selectedPost._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to create comment');
      }
      const newComment = await response.json();
      setComments(prevComments => [...prevComments, newComment]);
      event.target.content.value = '';
    } catch (error) {
      console.error('Error creating comment:', error);
    }
  };

  return (
    <Layout>
      <div className='container'>
        {moduleInfo && moduleInfo.title ? (
          <div className='forum-container'>
            <center>
              <h1>{moduleInfo.title}</h1>
              <p>{moduleInfo.description}</p>
            </center>
            <br />
            <br />
            <center><h1>Posts</h1></center>
            {posts.length > 0 ? (
              posts.map((post, index) => (
                <div key={post._id || index} className="post" id={`post-${post._id || index}`}>
                  <h4>Creator: {post.poster}</h4>
                  <h4>{post.title}</h4>
                  <p>{post.content}</p>
                  <button onClick={() => handleViewPost(post)}>
                    View Comments
                  </button>
                </div>
              ))
            ) : (
              <center> <p>No posts to display</p></center>
            )}

            {isModalOpen && (
              <div className="modal-backdrop">
                <div className="modal-content">
                  <button onClick={closeModal} className="modal-close-button">X</button>
                  <h2>{selectedPost?.title}</h2>
                  <p>{selectedPost?.content}</p>
                  <hr />
                  <div className="forum-container">
                    <h3>Comments:</h3>
                    <div className="comment-list">
                      {comments.map((comment, index) => (
                        <div key={comment._id || index} className="comment" id={`comment-${comment._id || index}`}>
                          <h4>Poster: {comment.poster}</h4>
                          <p>{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                    <TextField
                      margin="normal"
                      name="content"
                      label="Content"
                      type="text"
                      id="content"
                    />
                    <Button type="submit" variant="contained" sx={{ mt: 3, mb: 2 }}>
                      Submit
                    </Button>
                  </Box>
                </div>
              </div>
            )}
          </div>
        ) : (
          <center><p>Loading module details...</p></center>
        )}
      </div>
    </Layout>
  );
};

export default CommentPage;

