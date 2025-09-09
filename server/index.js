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

app.use(errorHandle);

app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found, kindly Re-Check api End point' });
});

app.listen(PORT,()=>{
   console.log(`Server is running at port: ${PORT}`)
})