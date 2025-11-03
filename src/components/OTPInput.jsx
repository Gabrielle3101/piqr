import { useRef } from "react";
import '../styles/OTPInput.css'

export default function OTPInput({ length = 6, onChange }) {
    const inputsRef = useRef([]);

    const handleChange = (e, index) => {
        const value = e.target.value;
        if (!/^\d?$/.test(value)) return;
    
        e.target.value = value;
        if (value && index < length - 1) {
            inputsRef.current[index + 1].focus();
        }
    
        const otp = inputsRef.current.map((input) => input.value).join("");
        onChange?.(otp);
    };
    
    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !e.target.value && index > 0) {
            inputsRef.current[index - 1].focus();
        }
    };
    
    return (
        <div className="otp-container">
            {Array.from({ length }).map((_, i) => (
            <input
                key={i}
                type="text"
                maxLength={1}
                className="otp-input"
                ref={(el) => (inputsRef.current[i] = el)}
                onChange={(e) => handleChange(e, i)}
                onKeyDown={(e) => handleKeyDown(e, i)}
            />
            ))}
        </div>
    );
}  