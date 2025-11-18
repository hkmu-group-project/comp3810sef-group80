import Link from "next/link";

export default function Index() {
    return (
        <div style={{ 
            height: '100vh', 
            display: 'flex', 
            flexDirection: 'column',
            backgroundColor: '#EBE5E5' // Fixed: added # for hex colors
        }}>
            {/* 頂部導航欄 */}
            <div style={{
                backgroundColor: '#E8E8E8', // Fixed: added # for hex colors
                color: '#FFFFFF', // Fixed: added # for hex colors
                padding: '1rem 2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
                <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#FFFFFF', fontFamily: "'Segoe UI', sans-serif", fontWeight: '300' }}>💬 Chat System</h1>
            </div>

            {/* 主內容 - 介紹頁面 */}
            <div style={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                padding: '2rem',
                textAlign: 'center'
            }}>
                <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: '#2c3e50' }}>
                    Welcome to Chat System
                </h1>
                <p style={{ 
                    fontSize: '1.2rem', 
                    marginBottom: '3rem', 
                    color: '#666',
                    maxWidth: '600px'
                }}>
                    Connect with friends and colleagues in real-time. 
                    Secure, fast, and easy-to-use messaging platform.
                </p>

                {/* 功能特色 */}
                <div style={{
                    display: 'flex',
                    gap: '2rem',
                    marginBottom: '3rem',
                    flexWrap: 'wrap',
                    justifyContent: 'center'
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '1.5rem',
                        borderRadius: '8px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                        minWidth: '200px'
                    }}>
                        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔒</div>
                        <h3 style={{fontFamily: "'Segoe UI', sans-serif"}}>Secure</h3>
                        <p style={{ color: '#666', fontFamily:"'Andale Mono', monospace" }}>End-to-end encryption</p>
                    </div>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '1.5rem',
                        borderRadius: '8px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                        minWidth: '200px'
                    }}>
                        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚡</div>
                        <h3 style={{fontFamily: "'Segoe UI', sans-serif"}}>Fast</h3>
                        <p style={{ color: '#666', fontFamily:"'Andale Mono', monospace" }}>Real-time messaging</p>
                    </div>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '1.5rem',
                        borderRadius: '8px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                        minWidth: '200px'
                    }}>
                        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🎯</div>
                        <h3 style={{fontFamily: "'Segoe UI', sans-serif"}}>Easy</h3>
                        <p style={{ color: '#666', fontFamily:"'Andale Mono', monospace" }}>User-friendly interface</p>
                    </div>
                </div>

                {/* 行動按鈕 */}
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <Link 
                        href="/auth/login" // Changed from 'to' to 'href'
                        style={{
                            padding: '12px 24px',
                            backgroundColor: '#3498db',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '4px',
                            fontSize: '16px',
                            fontWeight: 'bold'
                        }}
                    >
                        Sign In
                    </Link>
                    <Link 
                        href="/auth/register" // Changed from 'to' to 'href'
                        style={{
                            padding: '12px 24px',
                            backgroundColor: '#27ae60',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '4px',
                            fontSize: '16px',
                            fontWeight: 'bold'
                        }}
                    >
                        Create Account
                    </Link>
                </div>

                {/* 額外資訊 */}
                <div style={{ 
                    marginTop: '3rem',
                    padding: '1.5rem',
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    maxWidth: '500px'
                }}>
                    <h3 style={{ marginBottom: '1rem' }}>Get Started</h3>
                    <p style={{ color: '#666', marginBottom: '1rem' }}>
                        Join thousands of users already connected on our platform. 
                        Start chatting in seconds!
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <span style={{ color: '#3498db' }}>✓ No installation required</span>
                        <span style={{ color: '#3498db' }}>✓ Free to use</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
