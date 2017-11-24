const RSMQWorker = require('rsmq-worker');

class Worker {
  constructor(options) {
    this.rsmq = options.rsmq;
    this.queue = options.queue;
    this._consumeMessage = options.consumeMessage;
  }

  get worker() {
    if (!this._worker) {
      this._worker = new RSMQWorker(this.queue, { rsmq: this.rsmq });
      this._worker.on('message', this._consumeMessage);
    }
    return this._worker;
  }

  stopConsuming() {
    this.worker.stop();
  }

  startConsuming() {
    this.worker.start();
  }

  deinit() {
    this.worker.quit();
  }
}

module.exports = Worker;
