"use client";

import type * as React from "react";

import { useState } from "react";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!username.trim() || !password.trim()) {
            alert("Please enter username and password.");
            setLoading(false);
            return;
        }

        try {
            console.log("Attempting login...");

            const response = await fetch(
                "http://localhost:4001/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        username: username.trim(),
                        password: password.trim(),
                    }),
                },
            );

            const data = await response.json();

            if (response.ok) {
                console.log("Login successful:", data);
                // 保存 token
                if (data.token) {
                    localStorage.setItem("authToken", data.token);
                }
                alert(`Welcome ${username}! Entering chatroom...`);
                window.location.href = "/Room";
            } else {
                console.error("Login failed:", data);
                alert(data.error || "Login failed");
            }
        } catch (error) {
            console.error("Login error:", error);
            alert(
                "Network error - make sure the server is running on port 4001",
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                height: "100vh",
                display: "flex",
                flexDirection: "column",
                backgroundColor: "#EBE5E5",
            }}
        >
            {/* 頂部導航欄 */}
            <div
                style={{
                    backgroundColor: "#E8E8E8",
                    color: "#FFFFFF",
                    padding: "1rem 2rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
            >
                <h1
                    style={{
                        margin: 0,
                        fontSize: "1.5rem",
                        color: "#FFFFFF",
                        fontFamily: "'Segoe UI', sans-serif",
                        fontWeight: "300",
                    }}
                >
                    💬 Chat System
                </h1>
            </div>

            {/* 主內容 - 登入表單 */}
            <div
                style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "2rem",
                    textAlign: "center",
                }}
            >
                <div
                    style={{
                        backgroundColor: "white",
                        padding: "2.5rem",
                        borderRadius: "8px",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                        minWidth: "400px",
                        maxWidth: "500px",
                    }}
                >
                    <h1
                        style={{
                            fontSize: "2.5rem",
                            marginBottom: "1rem",
                            color: "#2c3e50",
                            fontFamily: "'Segoe UI', sans-serif",
                        }}
                    >
                        Welcome Back
                    </h1>
                    <p
                        style={{
                            fontSize: "1.1rem",
                            marginBottom: "2rem",
                            color: "#666",
                            fontFamily: "'Segoe UI', sans-serif",
                        }}
                    >
                        Sign in to continue to your chat account
                    </p>

                    <form
                        onSubmit={handleSubmit}
                        style={{
                            width: "100%",
                        }}
                    >
                        <div
                            style={{
                                marginBottom: "1.5rem",
                                textAlign: "left",
                            }}
                        >
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Please input your username"
                                disabled={loading}
                                style={{
                                    width: "100%",
                                    padding: "12px 16px",
                                    border: "1px solid #ddd",
                                    borderRadius: "4px",
                                    fontSize: "16px",
                                    fontFamily: "'Segoe UI', sans-serif",
                                    boxSizing: "border-box",
                                    opacity: loading ? 0.6 : 1,
                                }}
                            />
                        </div>
                        <div
                            style={{
                                marginBottom: "2rem",
                                textAlign: "left",
                            }}
                        >
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Please input your password"
                                disabled={loading}
                                style={{
                                    width: "100%",
                                    padding: "12px 16px",
                                    border: "1px solid #ddd",
                                    borderRadius: "4px",
                                    fontSize: "16px",
                                    fontFamily: "'Segoe UI', sans-serif",
                                    boxSizing: "border-box",
                                    opacity: loading ? 0.6 : 1,
                                }}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: "100%",
                                padding: "12px 24px",
                                backgroundColor: loading ? "#ccc" : "#3498db",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                fontSize: "16px",
                                fontWeight: "bold",
                                cursor: loading ? "not-allowed" : "pointer",
                                fontFamily: "'Segoe UI', sans-serif",
                                opacity: loading ? 0.7 : 1,
                            }}
                        >
                            {loading ? "Signing In..." : "Enter Chatroom"}
                        </button>
                    </form>

                    <div
                        style={{
                            marginTop: "1.5rem",
                            textAlign: "center",
                        }}
                    >
                        <p
                            style={{
                                color: "#666",
                                marginBottom: "1rem",
                            }}
                        >
                            Don't have an account?
                        </p>
                        <button
                            onClick={() =>
                                (window.location.href = "/auth/register")
                            }
                            style={{
                                padding: "8px 16px",
                                backgroundColor: "#27ae60",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                            }}
                        >
                            Create Account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
