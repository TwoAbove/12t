const the = require('./l.json');

class Generator {
  constructor(options) {
    this.lyricsPos = 0;
    this.rsmq = options.rsmq;
    this.queue = options.queue;
    this.sendInterval = options.sendInterval;
  }

  _sendMessage() {
    const message = the.lyrics[this.lyricsPos];
    this.lyricsPos += 1;
    if (!message) {
      this.lyricsPos = 0;
      return this._sendMessage();
    }
    this.rsmq.sendMessage({ qname: this.queue, message }, (err, resp) => {
      if (err) {
        console.log(err);
      }
    });
  }

  startGenerating() {
    if (this.intervalId) return;
    this.intervalId = setInterval(() => this._sendMessage(), this.sendInterval);
  }

  stopGenerating() {
    if (!this.intervalId) return;
    clearInterval(this.intervalId);
    this.intervalId = null;
  }
}

module.exports = Generator;
