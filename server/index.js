const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

const errorHandle = require('./utils/error_util');
const route = require('./router/route');
const esslRoutes = require('./essl');
const { eventsHandler } = require('./utils/sse'); 
require('./conn/conn');

// Enable CORS
app.use(cors());

// ----------------------
// Normal API parsers
// ----------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ----------------------
// Raw-body middleware only for ESSL device routes
// ----------------------
// Raw-body only for ESSL device routes
app.use([
  '/essl/iclock/cdata',
  '/essl/iclock/cdata.aspx',
  '/essl/iclock/getrequest.aspx',
  '/essl/iclock/devicecmd'
], (req, res, next) => {
  let raw = '';
  req.on('data', chunk => raw += chunk.toString());
  req.on('end', () => {
    req.bodyRaw = raw; // store raw body
    next();
  });
});


// ----------------------
// Optional: log incoming requests
// ----------------------
app.use((req, res, next) => {
  console.log(`📡 Incoming: ${req.method} ${req.url}`);
  // if (req.bodyRaw) console.log('Raw Body:', req.bodyRaw);
  next();
});

// ----------------------
// Routes
// ----------------------
app.use('/api', route);
app.get('/events', eventsHandler);
app.use('/', esslRoutes);

// ----------------------
// 404 handler
// ----------------------
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found, kindly Re-Check api End point' });
});

// ----------------------
// Error handler
// ----------------------
app.use(errorHandle);

// ----------------------
// Start server
// ----------------------
app.listen(PORT, () => {
  console.log(`🚀 Server is running at port: ${PORT}`);
});
