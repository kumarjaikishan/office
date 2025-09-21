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
    // console.log("sse - ", decoded)
    const companyId = decoded.companyId; // adjust based on your JWT payload
    const userId = decoded.id;
    const branchId = decoded?.branchIds;
    const role = decoded?.role;

    const client = { res, companyId, userId, branchId, role };
    clients.push(client);

    const heartbeat = setInterval(() => {
      res.write(`: ping\n\n`); // comment-only ping keeps connection alive
    }, 25000); // 25 seconds is a good balance

    // req.on('close', () => {
    //   clearInterval(heartbeat);
    //   clients = clients.filter(client => client !== res);
    // });

    req.on('close', () => {
      clearInterval(heartbeat);
      clients = clients.filter(c => c.res !== res);
    });

  } catch (error) {
    console.error("Invalid token", error);
    res.status(403).end();
  }
}

//checkOut , checkin
function sendToClients(data, companyId, branchId = '') {
  // console.log("send to call reacieved:", data, companyId, branchId)
  // console.log("clients", clients)
  clients 
    .filter((c) => c.companyId === companyId)
    .forEach((client) => {
      // console.log(client.role, client.branchId, branchId)
      if (client.role == "manager") {
        if (client.branchId.includes(branchId.toString())) {
          client.res.write(`data: ${JSON.stringify(data)}\n\n`);
        }
      } else {
        client.res.write(`data: ${JSON.stringify(data)}\n\n`);
      }
    });
}

module.exports = {
  eventsHandler,
  sendToClients
};
