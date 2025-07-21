// src/commands/logor.js
const { SlashCommandBuilder } = require('discord.js');

// In-memory store: userId → array of role IDs
const storedRoles = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('logor')
    .setDescription('Remove all your roles and give you a punishment role'),
  async execute(interaction) {
    const member = interaction.member;

    // Grab all current roles (except @everyone)
    const currentRoles = member.roles.cache
      .filter(r => r.id !== interaction.guild.id)
      .map(r => r.id);

    // Save to memory
    storedRoles.set(member.id, currentRoles);

    // Remove them & add the punishment role
    if (currentRoles.length) {
      await member.roles.remove(currentRoles);
    }
    await member.roles.add(interaction.client.config.punishmentRoleId);

    return interaction.reply({
      content: 'You have been logored: your roles are removed.',
      ephemeral: true
    });
  },
  // Expose the store so undo-logor can read it:
  storedRoles
};
