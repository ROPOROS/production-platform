const express = require('express');
const client = require('prom-client');

const app = express();
const port = process.env.PORT || 3000;

/* -------------------- METRICS SETUP -------------------- */

// Collect default Node.js metrics (CPU, memory, event loop, etc.)
client.collectDefaultMetrics();

// Histogram for HTTP request duration
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status'],
});

/* -------------------- MIDDLEWARE -------------------- */

// Measure duration of every HTTP request
app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer({ method: req.method });

  res.on('finish', () => {
    end({ route: req.path, status: res.statusCode });
  });

  next();
});

/* -------------------- ROUTES -------------------- */

app.get('/health', (req, res) => {
  if (process.env.FAIL_HEALTH === 'true') {
    return res.status(500).json({ status: 'broken' });
  }

  res.status(200).json({ status: 'ok' });
});


app.get('/', (req, res) => {
  res.status(200).json({ message: 'DevOps platform service running' });
});

// Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

/* -------------------- SERVER -------------------- */

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Service listening on port ${port}`);
  });
}

module.exports = app;
