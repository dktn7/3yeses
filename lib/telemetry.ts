export async function sendTelemetryEvent(event: any) {
  try {
    // Fire-and-forget telemetry POST
    void fetch('/api/analytics/ingest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });
  } catch (e) {
    // swallow errors to avoid affecting player
    // eslint-disable-next-line no-console
    console.warn('Telemetry failed', e);
  }
}

export default sendTelemetryEvent;
