import React, { useState } from 'react';
import axios from 'axios';
import '../styles/index.css';

interface CompilationResult {
  id: string;
  status: string;
  appId?: string;
  config?: any;
  metrics?: any;
  error?: string;
}

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CompilationResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCompile = async () => {
    if (!prompt.trim()) {
      alert('Please enter a prompt');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/compile`,
        { prompt }
      );
      setResult(response.data);
    } catch (error: any) {
      setResult({
        id: '',
        status: 'error',
        error: error.response?.data?.error || String(error),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyConfig = () => {
    if (result?.config) {
      navigator.clipboard.writeText(JSON.stringify(result.config, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1>🔧 App Compiler</h1>
        <p className="subtitle">Natural Language → Production-Ready Applications</p>
      </header>

      <div className="content">
        <div className="input-section">
          <h2>Describe Your App</h2>
          <textarea
            className="prompt-input"
            placeholder="Example: Build a CRM with login, contacts, dashboard, role-based access, and premium plan with payments. Admins can see analytics."
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            rows={6}
          />
          <button
            className={`compile-btn ${loading ? 'loading' : ''}`}
            onClick={handleCompile}
            disabled={loading}
          >
            {loading ? 'Compiling...' : '⚡ Compile'}
          </button>
        </div>

        {result && (
          <div className={`result-section result-${result.status}`}>
            <h2>Compilation Result</h2>

            {result.status === 'success' ? (
              <div className="success-result">
                <div className="status-badge success">✓ Success</div>
                <div className="info-block">
                  <p>
                    <strong>App ID:</strong> {result.appId}
                  </p>
                  <p>
                    <strong>Status:</strong> {result.status}
                  </p>
                </div>

                <div className="metrics-block">
                  <h3>Performance Metrics</h3>
                  <div className="metrics-grid">
                    {result.metrics?.stages &&
                      Object.entries(result.metrics.stages).map(([stage, data]: any) => (
                        <div key={stage} className="metric-card">
                          <p className="metric-label">{stage}</p>
                          <p className="metric-value">{data.duration}ms</p>
                        </div>
                      ))}
                    <div className="metric-card highlight">
                      <p className="metric-label">Total Time</p>
                      <p className="metric-value">{result.metrics?.totalDuration}ms</p>
                    </div>
                  </div>
                </div>

                <div className="config-block">
                  <h3>Generated Configuration</h3>
                  <button className="copy-btn" onClick={handleCopyConfig}>
                    {copied ? '✓ Copied!' : 'Copy JSON'}
                  </button>
                  <pre className="config-output">
                    {JSON.stringify(result.config, null, 2).substring(0, 500)}...
                  </pre>
                </div>

                <div className="files-info">
                  <h3>Generated Files</h3>
                  <ul>
                    <li>✓ Next.js app with pages</li>
                    <li>✓ API routes</li>
                    <li>✓ Database migrations</li>
                    <li>✓ Docker setup</li>
                    <li>✓ Environment config</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="error-result">
                <div className="status-badge error">✗ Failed</div>
                <p className="error-message">{result.error}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <footer className="footer">
        <p>
          API: <code>{process.env.NEXT_PUBLIC_API_URL}</code>
        </p>
      </footer>
    </div>
  );
}
