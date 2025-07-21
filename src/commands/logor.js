// src/commands/logor.js
const { SlashCommandBuilder } = require('discord.js');
const storedRoles = require('../stores/roleStore.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('logor')
    .setDescription('Remove all roles from a member (defaults to yourself) and give the punishment role.')
    .addUserOption(opt =>
      opt.setName('target')
         .setDescription('Which member to punish')
         .setRequired(false)
    ),
  async execute(interaction) {
    const targetMember = interaction.options.getMember('target') || interaction.member;

    // gather all roles except @everyone
    const toRemove = targetMember.roles.cache
      .filter(r => r.id !== interaction.guild.id)
      .map(r => r.id);

    // save their existing roles
    storedRoles.set(targetMember.id, toRemove);

    // remove them & add punishment
    if (toRemove.length) await targetMember.roles.remove(toRemove);
    await targetMember.roles.add(interaction.client.config.punishmentRoleId);

    const name = targetMember.id === interaction.member.id ? 'You have' : `${targetMember.user.tag} has`;
    return interaction.reply({
      content: `${name} has been logored (roles removed).`,
      ephemeral: true
    });
  }
};
