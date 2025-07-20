require('dotenv').config();
const DiscordBot = require('./client/DiscordBot');

const fs = require('fs');
if (!fs.existsSync('./data')) {
  fs.mkdirSync('./data');
}

fs.writeFileSync('./terminal.log', '', 'utf-8');
const client = new DiscordBot();

module.exports = client;

client.connect();

process.on('unhandledRejection', console.error);
process.on('uncaughtException', console.error);
