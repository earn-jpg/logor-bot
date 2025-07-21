// src/index.js
require('dotenv').config();  // harmless on Railway, needed locally if you use .env

const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, REST, Routes } = require('discord.js');
const config = require('./config.js');

console.log('🔍 ENV KEYS:', Object.keys(process.env));
console.log('🔍 config:', config);

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});
client.config = config;

// load command modules
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
for (const file of fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'))) {
  const cmd = require(path.join(commandsPath, file));
  client.commands.set(cmd.data.name, cmd);
}

client.once('ready', async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  if (!config.token || !config.clientId || !config.guildId) {
    console.error('❌ Missing one of token, clientId, or guildId—cannot register commands.');
    return;
  }

  const rest = new REST({ version: '10' }).setToken(config.token);
  const payload = client.commands.map(cmd => cmd.data.toJSON());

  try {
    console.log('🔄 Registering guild commands…');
    await rest.put(
      Routes.applicationGuildCommands(config.clientId, config.guildId),
      { body: payload }
    );
    console.log('✔️ Guild commands registered.');
  } catch (err) {
    console.error('❌ Command registration failed:', err);
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;
  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(err);
    await interaction.reply({ content: '❌ Error running command.', ephemeral: true });
  }
});

client.login(config.token);
