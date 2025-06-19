let clients = [];

function eventsHandler(req, res) {
  res.set({
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache',
  });

  res.flushHeaders();
  clients.push(res);

  const heartbeat = setInterval(() => {
    res.write(`: ping\n\n`); // comment-only ping keeps connection alive
  }, 25000); // 25 seconds is a good balance

  req.on('close', () => {
    clearInterval(heartbeat);
    clients = clients.filter(client => client !== res);
  });
}


function sendToClients(data) {
  clients.forEach(client =>
    client.write(`data: ${JSON.stringify(data)}\n\n`)
  );
}

module.exports = {
  eventsHandler,
  sendToClients
};
