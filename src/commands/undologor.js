// src/commands/undo-logor.js
const { SlashCommandBuilder } = require('discord.js');
const logorCommand = require('./logor.js');  // to get its storedRoles map

module.exports = {
  data: new SlashCommandBuilder()
    .setName('undo-logor')
    .setDescription('Restore all your previous roles and remove the punishment role'),
  async execute(interaction) {
    const member = interaction.member;
    const store = logorCommand.storedRoles;
    const prevRoles = store.get(member.id) || [];

    // Restore previous roles
    if (prevRoles.length) {
      await member.roles.add(prevRoles);
      store.delete(member.id);
    }

    // Remove punishment role
    await member.roles.remove(interaction.client.config.punishmentRoleId);

    return interaction.reply({
      content: 'Unlogored.',
      ephemeral: true
    });
  }
};
