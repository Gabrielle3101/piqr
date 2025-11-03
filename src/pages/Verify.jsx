import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import OTPInput from "../components/OTPInput";
import '../styles/Verify.css'
import ThemeToggle from "../components/ThemeToggle";

function Verify() {
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email;
    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");

    const handleVerify = async () => {
        const response = await fetch("http://localhost:5000/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otp }),
        });

        const result = await response.json();
        if (result.valid) {
        navigate("/dashboard");
        } else {
        setError("Invalid or expired code");
        }
    };

    return (
        <div className="otp-verify">
        <div className="logo">
            <img src="../../public/assets/img/logo.png" alt="" />
        </div>
        <h1>Verify your email</h1>
        <p>Enter the 6 digit code we sent to your email</p>
        <OTPInput onChange={setOtp} />
        <button className="primary-btn" onClick={handleVerify}>Continue →</button>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <h5>Didn't receive code? <span onClick={() => fetch("http://localhost:5000/send-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        })}>Resend code</span></h5>
        <ThemeToggle />
        </div>
    );
}

export default Verify;