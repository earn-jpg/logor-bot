const fs = require('fs');
module.exports = {
  data: { name: 'logor', description: 'Remove roles and give punishment role', options: [{ name: 'user', type: 6, required: true }] },
  async execute(interaction) {
    const target = interaction.options.getMember('user');
    const guild = interaction.guild;
    const ks = `${guild.id}-${target.id}.json`;
    const roles = target.roles.cache.filter(r => r.id !== guild.id && r.id !== process.env.PUNISH_ROLE_ID);
    fs.writeFileSync(`./data/${ks}`, JSON.stringify([...roles.keys()]));
    await target.roles.remove([...roles.keys()]);
    await target.roles.add(process.env.PUNISH_ROLE_ID);
    await interaction.reply(`Removed all roles and assigned punishment role to ${target}.`);
  }
};
