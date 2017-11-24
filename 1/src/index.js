const argv = require('yargs').argv;
const Redis = require('redis');
const RedisSMQ = require('rsmq');
const NRP = require('node-redis-pubsub');

const config = require('./config');

const redis = Redis.createClient({ host: config.redis.host, prot: config.redis.port });
const rsmq = new RedisSMQ({ redis });

const neededQueues = ['roll', 'rickErrors'];
const setUpEnv = () => Promise.all(neededQueues.map(qname => new Promise(res => {
  rsmq.createQueue({ qname }, (err, resp) => {
    res();
  });
})));

if (argv.getErrors) {
  require('./flushQueue')(rsmq, 'rickErrors').then(() => {
    console.log('done');
    process.exit();
  });
  return;
}

const Generator = require('./generator');
const Worker = require('./consumer');

class RickRoller {
  constructor({ redis, rsmq, sendInterval = 500, generator, queueName }) {
    this.redis = redis;
    this.rsmq = rsmq;
    this.sendInterval = sendInterval;
    this.queueName = queueName;

    this.messages = new NRP({ host: config.redis.host, prot: config.redis.port });

    if (generator) {
      this.startGenerating();
    } else {
      this.startConsuming();
    }
  }

  startGenerating() {
    const generator = new Generator({
      rsmq: this.rsmq,
      queue: this.queueName,
      sendInterval: this.sendInterval
    });
    generator.startGenerating();
    this.startHeartbeat();
  }

  startHeartbeat() {
    this.hbId = setInterval(() => { this.messages.emit('beep', ''); }, 500);
  }

  startConsuming() {
    this.worker = new Worker({
      rsmq: this.rsmq,
      queue: this.queueName,
      consumeMessage: (msg, next, id) => {
        if (Math.random() <= 0.05) {
          this.rsmq.sendMessage({
            qname: 'rickErrors',
            message: JSON.stringify({ msg, time: +new Date() }),
          }, (err, resp) => {
            if (err) {
              console.log(err);
            }
          });
        } else {
          console.log(msg);
        }
        next();
      },
    });
    this.worker.startConsuming();
    this.listenForHeartBeat();
  }

  stopConsuming() {
    this.worker.stopConsuming();
  }

  swichToGenerator() {
    console.log('Switching to generation');
    this.messages.emit('beep', '');
    this.stopConsuming();
    this.startGenerating();
  }

  listenForHeartBeat() {
    this.lastHB = +new Date();
    const hbtId = setInterval(() => {
      const now = +new Date();
      if (now - this.lastHB < 2000) {
        return;
      }
      this.hbListener();
      clearInterval(hbtId);
      this.swichToGenerator();
    }, 1000);
    this.hbListener = this.messages.on('beep', () => {
      this.lastHB = +new Date();
    });
  }
}

setUpEnv().then(() => {
  const rickRoller = new RickRoller({ redis, rsmq, generator: argv.generator, queueName: 'roll' });
});
