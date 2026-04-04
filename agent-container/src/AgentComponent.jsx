import React from 'react';

function AgentComponent({ iframeUrl, status, logs }) {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ flex: 1, borderRight: '1px solid #ccc' }}>
        {iframeUrl ? (
          <iframe
            title="3yeses Agent UI"
            src={iframeUrl}
            style={{ width: '100%', height: '100%', border: 'none' }}
          />
        ) : (
          <div style={{ padding: '1rem', fontFamily: 'sans-serif' }}>
            <h2>3yeses Agent Inspector</h2>
            <p>Booting WebContainer and starting the agent server…</p>
          </div>
        )}
      </div>
      <div style={{ width: '320px', padding: '1rem', overflowY: 'auto', fontFamily: 'monospace', fontSize: '0.85rem' }}>
        <h3>Status</h3>
        <p>Agent Server: <strong>{status.agentServer}</strong></p>
        <p>Agent UI: <strong>{status.agentUI}</strong></p>
        <h3>Logs</h3>
        {['agentServer', 'agentUI', 'container'].map(src => (
          <details key={src} open={src === 'agentServer'}>
            <summary style={{ cursor: 'pointer', marginBottom: '4px' }}>{src}</summary>
            <ul style={{ paddingLeft: '1rem', margin: 0 }}>
              {logs[src].slice(-20).map((log, i) => <li key={i}>{log}</li>)}
            </ul>
          </details>
        ))}
      </div>
    </div>
  );
}

export default AgentComponent;
