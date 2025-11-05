import { useState, useEffect } from "react";
import '../styles/AuthPage.css';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile
} from "firebase/auth";
import { auth } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { createUserDocument } from '../firebaseUtils';
import ThemeToggle from "../components/ThemeToggle";

function AuthPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isLightMode = document.body.classList.contains('light');
  const imgPath = isLightMode ? '/assets/img/light/' : '/assets/img/';
  const [isSignUp, setIsSignUp] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const provider = new GoogleAuthProvider();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        await createUserDocument(userCredential.user);
        await fetch("http://localhost:5000/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        navigate("/verify", { state: { email } });
      } else {
        await signInWithEmailAndPassword(auth, email, password);

        await fetch("http://localhost:5000/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        navigate("/verify", { state: { email } });

      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, provider);
      await createUserDocument(auth.currentUser);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (user && !isSignUp) {
      navigate("/dashboard");
    }
  }, [user, isSignUp, navigate]);

  return (
    <>
      <div className="auth">
        <div className="auth-img">
          <img src="/assets/img/sign-up-img.png" alt="" />
        </div>
        <div className="form">
          <div className="logo">
            <img src={`${imgPath}logo.png`} alt="" />
            <span>Piqr</span>
          </div>
          <p className="cta">
            {isSignUp ? (
              <>
                Sign up to save your <span>Favorites</span> to your <span>Cookbook and Watchlist</span>
              </>
            ) : (
              <>
                Log in to your <span>Favorites</span> to your <span>Cookbook and Watchlist</span>
              </>
            )}
          </p>
          <form onSubmit={handleSubmit}>
            {isSignUp && (
              <>
                <label htmlFor="name">Full name</label>
                <div className="input-wrapper">
                  <img src="/assets/icons/sign-up-user.svg" alt="" className="input-icon" />
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </>
            )}
            <label htmlFor="email">Email</label>
            <div className="input-wrapper">
              <img src="/assets/icons/sign-up-mail.svg" alt="" className="input-icon" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <img src="/assets/icons/sign-up-lock.svg" alt="" className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password (min. 6 chars)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <img
                src={`/assets/icons/${showPassword ? "hide.png" : "eye.svg"}`}
                alt="Toggle visibility"
                className="toggle-icon"
                onClick={() => setShowPassword(prev => !prev)}
              />
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <input type="checkbox" id="checkbox" />
              <label style={{ cursor: "pointer", fontSize: "12px" }} htmlFor="checkbox">Remember me</label>
              <span style={{ marginLeft: "auto", cursor: "pointer", fontSize: "12px" }}>Forgotten password?</span>
            </div>
            <button className="primary-btn" type="submit">{isSignUp ? "Sign Up" : "Log In"}</button>
          </form>
          <div className="divider">
            <span>Or</span>
          </div>
          <button style={{ display: "flex", alignItems: "center", justifyContent: "center" }} className="secondary-btn" onClick={handleGoogleSignIn}>
            <img className="icon" src="/assets/icons/devicon_google.svg" alt="" /> &nbsp; Continue with Google
          </button>
          {error && <p style={{ color: "red" }}>{error}</p>}
          <p className="cta2">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <span className="cta2" onClick={() => setIsSignUp(!isSignUp)}>
              {isSignUp ? "Log in" : "Sign up"}
            </span>
          </p>
          {isSignUp && <p className="foot-text">By proceeding, you consent to our <span>Terms & Conditions</span></p>}
        </div>
      </div>
      <div className="theme">
        <ThemeToggle />
      </div>
    </>
  );
}

export default AuthPage;