const getMessage = (rsmq, qname) => new Promise((res, rej) => {
  rsmq.receiveMessage({ qname }, (err, resp) => {
    if (err) return rej(err);
    if (resp.id) return res(resp);
    res();
  });
});

module.exports = async (rsmq, qname) => {
  let message = await getMessage(rsmq, qname);
  while (message) {
    console.log(message);
    message = await getMessage(rsmq, qname);
  }
};
