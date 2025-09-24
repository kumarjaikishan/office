const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;
const errorHandle = require('./utils/error_util');
const route = require('./router/route');
const esslRoutes = require('./essl');
const { eventsHandler } = require('./utils/sse'); 
require('./conn/conn');

app.use(cors());

// Middleware for both JSON and form-urlencoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Middleware to capture raw body
app.use((req, res, next) => {
    console.log(`📡 Incoming: ${req.method} ${req.url}`);
    // console.log("Headers:", req.headers);

    let raw = "";
    req.on("data", chunk => raw += chunk.toString());
    req.on("end", () => {
        if (raw) {
            console.log("Raw Body:", raw);
            req.bodyRaw = raw;
        }
        next(); // ✅ don’t forget this
    });
});

// Routes
app.use("/api", route);
app.get('/events', eventsHandler);
app.use('/', esslRoutes);

// 404
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found, kindly Re-Check api End point' });
});

// Error handler
app.use(errorHandle);

app.listen(PORT, () => {
  console.log(`🚀 Server is running at port: ${PORT}`);
});
