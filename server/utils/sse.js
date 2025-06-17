let clients = [];

function eventsHandler(req, res) {
  res.set({
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache',
  });

  res.flushHeaders();
  clients.push(res);

  req.on('close', () => {
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
