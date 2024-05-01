"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Box, TextField } from "@mui/material";
import Layout from '../../Components/Layout';
import '../../css/modulePage.css';

const CommentPage = () => {
  const [username, setUsername] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const postId = router.query.postId; // Assuming postId is passed in the query params

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
    // Fetch comments for the selected post when postId changes
    if (postId) {
      fetchComments(postId);
    }
  }, [postId]);

  const fetchComments = async (postId) => {
    try {
      const response = await fetch(`/api/getCommentsById?postId=${postId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }
      const commentsData = await response.json();
      setComments(commentsData);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleViewPost = (post) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPost(null);
    setComments([]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent the default form submission behavior
    const content = event.target.content.value.trim();
    if (!content) return; // Basic validation to prevent empty comments

    // Check if username is available
    if (!username) {
      console.error('Username is not available.');
      return;
    }

    const timestamp = new Date();

    try {
      const response = await fetch(`/api/createComment?poster=${username}&content=${content}&timestamp=${timestamp}&postId=${postId}`, {
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
      event.target.content.value = ''; // Clear the comment input field
    } catch (error) {
      console.error('Error creating comment:', error);
    }
  };

  return (
    <Layout>
      <div className='container'>
        {selectedPost && (
          <div className="post">
            <h4>Creator: {selectedPost.poster}</h4>
            <h4>{selectedPost.title}</h4>
            <p>{selectedPost.content}</p>
          </div>
        )}
        {comments.map((comment, index) => (
          <div key={index} className="comment">
            <h4>Comment by: {comment.poster}</h4>
            <p>{comment.content}</p>
          </div>
        ))}
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{mt: 1}}>
          <TextField
            margin="normal"
            name="content"
            label="Content"
            type="text"
            id="content"
          />
          <Button type="submit" variant="contained" sx={{mt: 3, mb: 2}}>
            Submit
          </Button>
        </Box>
      </div>
    </Layout>
  );
};

export default CommentPage;
