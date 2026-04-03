"use client";

import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useState } from "react";

import AuthPageShell from "../../components/AuthPageShell";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE;
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const saveUserAndRedirect = (data) => {
    localStorage.setItem("userId", String(data.id));
    if (data.name) {
      localStorage.setItem("userName", data.name);
    }
    if (data.email) {
      localStorage.setItem("userEmail", data.email);
    }
    window.location.href = "/dashboard";
  };

  const login = async () => {
    const res = await fetch(`${API_BASE}/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (data.error) {
      alert(data.error);
      return;
    }

    saveUserAndRedirect(data);
  };

  const handleGoogleLogin = async (credentialResponse) => {
    if (!credentialResponse.credential) {
      alert("Google login failed");
      return;
    }

    const decoded = jwtDecode(credentialResponse.credential);
    const res = await fetch(`${API_BASE}/google-login/`,  {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: decoded.email,
        name: decoded.name || "",
        google_id: decoded.sub || "",
      }),
    });

    const data = await res.json();

    if (data.error) {
      alert(data.error);
      return;
    }

    saveUserAndRedirect(data);
  };

  return (
    <>
      <AuthPageShell
        title="Login to your medication reminder."
        description="Track schedules, stay consistent, and keep every dose visible in one calm place."
        badge="Welcome back"
        formTitle="Sign in"
        formDescription="Use your email or continue with Google."
        footer={
          <>
            New here? <a href="/register">Create an account</a>
          </>
        }
      >
        <div className="field-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="field-group">
          <label htmlFor="password">Password</label>
          <div className="password-field">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {password && (
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M3 3l18 18" />
                    <path d="M10.58 10.58a2 2 0 0 0 2.83 2.83" />
                    <path d="M9.88 5.09A10.94 10.94 0 0 1 12 5c7 0 10 7 10 7a17.34 17.34 0 0 1-4.18 5.27" />
                    <path d="M6.61 6.61A17.32 17.32 0 0 0 2 12s3 7 10 7a10.94 10.94 0 0 0 4.09-.78" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>

        <button className="primary-button" onClick={login}>
          Continue to dashboard
        </button>

        <div className="divider">
          <span>or</span>
        </div>

        <div className="google-wrap">
          <GoogleLogin onSuccess={handleGoogleLogin} />
        </div>
      </AuthPageShell>

      <style jsx>{`
        .field-group {
          margin-bottom: 16px;
        }

        .field-group label {
          display: block;
          margin-bottom: 8px;
          color: #4c5578;
          font-size: 0.9rem;
          font-weight: 700;
          letter-spacing: 0.01em;
        }

        .field-group input {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid rgba(160, 170, 201, 0.34);
          border-radius: 16px;
          padding: 14px 15px;
          background: rgba(255, 255, 255, 0.92);
          color: #2f364f;
          outline: none;
          transition:
            transform 160ms ease,
            border-color 160ms ease,
            box-shadow 160ms ease,
            background-color 160ms ease;
        }

        .field-group input::placeholder {
          color: rgba(89, 99, 133, 0.55);
        }

        .field-group input:focus {
          border-color: rgba(80, 134, 255, 0.72);
          background: rgba(255, 255, 255, 1);
          box-shadow: 0 0 0 4px rgba(95, 146, 255, 0.18);
        }

        .password-field {
          position: relative;
          width: 100%;
        }

        .password-field input {
          padding-right: 50px;
        }

        .password-toggle {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          appearance: none;
          border: none;
          outline: none;
          width: 34px;
          height: 34px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          background: rgba(92, 122, 196, 0.12);
          color: #4860a5;
          cursor: pointer;
          transition: background-color 140ms ease, color 140ms ease;
        }

        .password-toggle:hover {
          background: rgba(92, 122, 196, 0.2);
        }

        .password-toggle:focus-visible {
          box-shadow: 0 0 0 3px rgba(95, 146, 255, 0.22);
        }

        .password-toggle svg {
          width: 18px;
          height: 18px;
          stroke: currentColor;
          fill: none;
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .password-toggle svg circle {
          fill: none;
        }

        .primary-button {
          width: 100%;
          margin-top: 8px;
          padding: 15px 18px;
          border: none;
          border-radius: 16px;
          background: linear-gradient(135deg, #ff9956 0%, #ff7a4e 100%);
          color: white;
          font-size: 0.98rem;
          font-weight: 700;
          letter-spacing: 0.01em;
          cursor: pointer;
          box-shadow: 0 18px 32px rgba(255, 122, 78, 0.3);
          transition:
            transform 160ms ease,
            box-shadow 160ms ease,
            filter 160ms ease;
        }

        .primary-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 22px 36px rgba(255, 122, 78, 0.34);
          filter: saturate(1.04);
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 24px 0 18px;
          color: rgba(89, 99, 133, 0.56);
          font-size: 0.9rem;
        }

        .divider::before,
        .divider::after {
          content: "";
          flex: 1;
          height: 1px;
          background: rgba(160, 170, 201, 0.32);
        }

        .google-wrap {
          display: flex;
          justify-content: center;
          min-height: 44px;
        }
      `}</style>
    </>
  );
}
