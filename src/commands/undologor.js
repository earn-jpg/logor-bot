// src/commands/undo-logor.js
const { SlashCommandBuilder } = require('discord.js');
const storedRoles = require('../stores/roleStore.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('undo-logor')
    .setDescription('Restore all previously removed roles (defaults to yourself) and remove the punishment role.')
    .addUserOption(opt =>
      opt.setName('target')
         .setDescription('Which member to restore')
         .setRequired(false)
    ),
  async execute(interaction) {
    const targetMember = interaction.options.getMember('target') || interaction.member;
    const prev = storedRoles.get(targetMember.id) || [];

    if (prev.length) {
      await targetMember.roles.add(prev);
      storedRoles.delete(targetMember.id);
    }
    await targetMember.roles.remove(interaction.client.config.punishmentRoleId);

    const name = targetMember.id === interaction.member.id ? 'Your' : `${targetMember.user.tag}’s`;
    return interaction.reply({
      content: `${name} has been unlogored.`,
      ephemeral: true
    });
  }
};
