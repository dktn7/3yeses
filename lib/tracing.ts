import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

const traceExporter = new OTLPTraceExporter({
  url: 'http://localhost:4318/v1/traces',
});

const sdk: any = new NodeSDK({
  // Omit explicit resource creation to avoid type-only import issues in some environments
  traceExporter,
  instrumentations: [getNodeAutoInstrumentations()],
});

(sdk.start() as Promise<void>)
  .then(() => {
    console.log('Tracing initialized');
  })
  .catch((error: any) => {
    console.error('Error initializing tracing', error);
  });

process.on('SIGTERM', () => {
  (sdk.shutdown() as Promise<void>)
    .then(() => console.log('Tracing terminated'))
    .catch(console.error)
    .finally(() => process.exit(0));
});