import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LoginModal.css';

function LoginModal() {
  const navigate = useNavigate();

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h1>😢</h1>
        <h2>Oops!</h2>
        <p>The feature you’re trying to access is not available till you login/signup</p>
        <div className="modal-actions">
          <button className="back" onClick={() => navigate(-1)}>
            ←
          </button>
          <button className="primary-btn" onClick={() => navigate('/auth')}>
            Proceed to Login →
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginModal;