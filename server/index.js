const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;
const errorHandle = require('./utils/error_util');
const route = require('./router/route');
const { eventsHandler, sendToClients } = require('./utils/sse'); // adjust path if needed
require('./conn/conn')

app.use(express.json());
app.use(cors());
app.use("/api", route);
app.get('/events', eventsHandler);

app.use((req, res, next) => {
  let raw = '';
  req.on('data', chunk => raw += chunk.toString());
  req.on('end', () => {
    req.bodyRaw = raw; // store raw body for later
    next();
  });
});

// Debug all requests
app.use((req, res, next) => {
  console.log(`📡 Incoming: ${req.method} ${req.url}`);
  // console.log("Headers:", req.headers);
  // if (req.bodyRaw) console.log("Raw Body:", req.bodyRaw);
  next();
});

// Mount ESSL routes from separate file
const esslRoutes = require('./essl');
app.use('/', esslRoutes);

app.use(errorHandle);

app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found, kindly Re-Check api End point' });
});

app.listen(PORT, () => {
  console.log(`Server is running at port: ${PORT}`)
})