import React, { useState, useEffect, useCallback } from 'react';
import AgentComponent from './AgentComponent';
import { bootAgentContainer } from './agentSdk';

function removeAnsiCodes(str) {
  return str.replace(/\u001b\[[0-9;]*m/g, '');
}

function App() {
  const [iframeUrl, setIframeUrl] = useState('');
  const [status, setStatus] = useState({ agentServer: 'closed', agentUI: 'closed' });
  const [logs, setLogs] = useState({ agentServer: [], agentUI: [], container: [] });

  const addLog = useCallback((source, msg) =>
    setLogs(prev => ({ ...prev, [source]: [...prev[source], removeAnsiCodes(msg)] })), []);

  const makeWritable = useCallback((source) =>
    new WritableStream({ write(chunk) { addLog(source, chunk.toString()); } }), [addLog]);

  useEffect(() => {
    async function init() {
      try {
        const wc = await bootAgentContainer();
        addLog('container', 'WebContainer booted. Agent runtime uploaded.');

        wc.on('port', (port, type, url) => {
          addLog('container', `Port ${port} ${type}${url ? ` → ${url}` : ''}`);
          if (port === 3111) setStatus(prev => ({ ...prev, agentServer: type }));
          if (port === 3000) {
            setStatus(prev => ({ ...prev, agentUI: type }));
            if (type === 'open') setIframeUrl(url);
          }
        });

        // Install & start agent-server (port 3111)
        addLog('container', 'Installing agent-server dependencies…');
        const installServer = await wc.spawn('npm', ['install'], { cwd: 'agent-server' });
        installServer.output.pipeTo(makeWritable('agentServer'));
        await installServer.exit;

        addLog('container', 'Starting agent-server…');
        const serverProc = await wc.spawn('npm', ['start'], { cwd: 'agent-server' });
        serverProc.output.pipeTo(makeWritable('agentServer'));

        // Install & start agent-ui (port 3000)
        addLog('container', 'Installing agent-ui dependencies…');
        const installUI = await wc.spawn('npm', ['install'], { cwd: 'agent-ui' });
        installUI.output.pipeTo(makeWritable('agentUI'));
        await installUI.exit;

        addLog('container', 'Starting agent-ui…');
        const uiProc = await wc.spawn('npm', ['run', 'dev'], { cwd: 'agent-ui' });
        uiProc.output.pipeTo(makeWritable('agentUI'));
      } catch (err) {
        addLog('container', `Error: ${err.message}`);
      }
    }
    init();
  }, [addLog, makeWritable]);

  return <AgentComponent iframeUrl={iframeUrl} status={status} logs={logs} />;
}

export default App;
