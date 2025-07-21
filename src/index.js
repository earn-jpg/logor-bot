// src/index.js
require('dotenv').config();                       // always safe, no .env on Railway
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, REST, Routes } = require('discord.js');
const config = require('./config.js');

console.log('🔍 ENV KEYS:', Object.keys(process.env));  
console.log('🔍 config.token:', config.token);
console.log('🔍 config.clientId:', config.clientId);
console.log('🔍 config.punishmentRoleId:', config.punishmentRoleId);

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});
client.config = config;

// load commands
client.commands = new Collection();
for (const file of fs.readdirSync(path.join(__dirname,'commands')).filter(f => f.endsWith('.js'))) {
  const cmd = require(`./commands/${file}`);
  client.commands.set(cmd.data.name, cmd);
}

client.once('ready', async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

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

  // only attempt to register if token & clientId are set
  if (!config.token || !config.clientId) {
    console.error('❌ Missing token or clientId—cannot register commands.');
    return;
  }

  const rest = new REST({ version: '10' }).setToken(config.token);
  const payload = client.commands.map(cmd => cmd.data.toJSON());

  try {
    console.log('🔄 Registering slash commands…');
    await rest.put(Routes.applicationCommands(config.clientId), { body: payload });
    console.log('✔️ Slash commands registered.');
  } catch (err) {
    console.error('❌ Failed to register commands:', err);
  };

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;
  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(err);
    interaction.reply({ content: '❌ Error running command.', ephemeral: true });
  }
});

client.login(config.token);
