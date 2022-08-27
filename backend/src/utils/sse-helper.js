module.exports = {
  init: function(res) {
    res.writeHead(200, {
      'Connection': 'keep-alive',
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache'
    });
    res.flushHeaders();
  },

  send: function(res, data, status = 'success') {
    pushUpdate(res, 'message', status, data);
  },

  close: function(res, data = 'close', status = 'success') {
    pushUpdate(res, 'close', status, data);
    res.end();
  }
}

function pushUpdate(res, type, status, data) {
  res.write(`data: ${JSON.stringify({ type, status, data })}\n\n`)
}
