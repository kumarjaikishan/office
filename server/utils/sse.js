const jwt = require("jsonwebtoken");
let clients = [];

function eventsHandler(req, res) {
  res.set({
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache',
  });

  res.flushHeaders();

  const token = req.query.token;
  if (!token) {
    res.status(401).end();
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_Key);
    console.log("sse - ", decoded)
    const companyId = decoded.companyId; // adjust based on your JWT payload
    const userId = decoded.id;

    const client = { res, companyId, userId };
    clients.push(client);

    const heartbeat = setInterval(() => {
      res.write(`: ping\n\n`); // comment-only ping keeps connection alive
    }, 25000); // 25 seconds is a good balance

    req.on('close', () => {
      clearInterval(heartbeat);
      clients = clients.filter(client => client !== res);
    });

  } catch (error) {
    console.error("Invalid token", error);
    res.status(403).end();
  }
}


function sendToClients(data, companyId) {
  clients
    .filter((c) => c.companyId === companyId) // send only to same company
    .forEach((client) => {
      client.res.write(`data: ${JSON.stringify(data)}\n\n`);
    });
}


module.exports = {
  eventsHandler,
  sendToClients
};
