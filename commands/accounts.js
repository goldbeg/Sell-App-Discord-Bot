const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { hasPermission } = require('../utils/permissions');
const googleSheets = require('../utils/googlesheets');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('accounts')
        .setDescription('Manage and search accounts')
        .addSubcommand(subcommand =>
            subcommand
                .setName('search')
                .setDescription('Search for accounts with multiple criteria')
                .addStringOption(option =>
                    option.setName('id')
                        .setDescription('Account ID')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('username')
                        .setDescription('Username (partial match)')
                        .setRequired(false))
                .addIntegerOption(option =>
                    option.setName('minhours')
                        .setDescription('Minimum hours')
                        .setRequired(false))
                .addIntegerOption(option =>
                    option.setName('maxhours')
                        .setDescription('Maximum hours')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('lookup')
                .setDescription('Look up an account by ID')
                .addStringOption(option =>
                    option.setName('id')
                        .setDescription('Account ID')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('hours')
                .setDescription('Find accounts within hour range')
                .addIntegerOption(option =>
                    option.setName('min')
                        .setDescription('Minimum hours')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('max')
                        .setDescription('Maximum hours')
                        .setRequired(true))),

    async execute(interaction) {
        if (!hasPermission(interaction.member, 'accounts')) {
            return interaction.reply({
                content: 'You do not have permission to use this command.',
                ephemeral: true
            });
        }

        await interaction.deferReply({ ephemeral: true });
        const subcommand = interaction.options.getSubcommand();

        try {
            switch (subcommand) {
                case 'search': {
                    const criteria = {
                        id: interaction.options.getString('id'),
                        username: interaction.options.getString('username'),
                        minHours: interaction.options.getInteger('minhours'),
                        maxHours: interaction.options.getInteger('maxhours')
                    };

                    const accounts = await googleSheets.searchAccounts(criteria);
                    
                    if (accounts.length === 0) {
                        return interaction.editReply('No accounts found matching your criteria.');
                    }

                    const embed = new EmbedBuilder()
                        .setTitle('Account Search Results')
                        .setColor('#0099ff')
                        .setDescription(`Found ${accounts.length} account(s)`);

                    accounts.slice(0, 10).forEach(account => {
                        embed.addFields({
                            name: `ID: ${account.id}`,
                            value: `Username: ${account.username}\nHours: ${account.hours}`,
                            inline: true
                        });
                    });

                    if (accounts.length > 10) {
                        embed.setFooter({ text: 'Showing first 10 results' });
                    }

                    await interaction.editReply({ embeds: [embed] });
                    break;
                }

                case 'lookup': {
                    const id = interaction.options.getString('id');
                    const account = await googleSheets.getAccountById(id);

                    if (!account) {
                        return interaction.editReply('Account not found.');
                    }

                    const embed = new EmbedBuilder()
                        .setTitle('Account Details')
                        .setColor('#0099ff')
                        .addFields(
                            { name: 'ID', value: account.id, inline: true },
                            { name: 'Username', value: account.username, inline: true },
                            { name: 'Hours', value: account.hours.toString(), inline: true }
                        );

                    await interaction.editReply({ embeds: [embed] });
                    break;
                }

                case 'hours': {
                    const min = interaction.options.getInteger('min');
                    const max = interaction.options.getInteger('max');
                    
                    const accounts = await googleSheets.getAccountsByHourRange(min, max);
                    
                    if (accounts.length === 0) {
                        return interaction.editReply(`No accounts found with ${min}-${max} hours.`);
                    }

                    const embed = new EmbedBuilder()
                        .setTitle(`Accounts with ${min}-${max} Hours`)
                        .setColor('#0099ff')
                        .setDescription(`Found ${accounts.length} account(s)`);

                    accounts.slice(0, 10).forEach(account => {
                        embed.addFields({
                            name: `ID: ${account.id}`,
                            value: `Username: ${account.username}\nHours: ${account.hours}`,
                            inline: true
                        });
                    });

                    if (accounts.length > 10) {
                        embed.setFooter({ text: 'Showing first 10 results' });
                    }

                    await interaction.editReply({ embeds: [embed] });
                    break;
                }
            }
        } catch (error) {
            console.error(error);
            await interaction.editReply('An error occurred while processing your request.');
        }
    },
};