const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { fetchData } = require('../utils/api');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('customers')
        .setDescription('Manage customers')
        .addSubcommand(subcommand =>
            subcommand
                .setName('search')
                .setDescription('Search for customers')
                .addStringOption(option =>
                    option.setName('email')
                        .setDescription('Customer email')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('top')
                .setDescription('View top customers')
                .addIntegerOption(option =>
                    option.setName('limit')
                        .setDescription('Number of customers to show')
                        .setMinValue(1)
                        .setMaxValue(10))),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const subcommand = interaction.options.getSubcommand();

        try {
            if (subcommand === 'search') {
                const email = interaction.options.getString('email');
                const { data: customers } = await fetchData('/customers/search', { email });
                
                const embed = new EmbedBuilder()
                    .setTitle(`Customer Search Results - ${email}`)
                    .setColor('#0099ff');

                customers.forEach(customer => {
                    embed.addFields({
                        name: `Customer ID: ${customer.id}`,
                        value: `Email: ${customer.email}\nTotal Orders: ${customer.total_orders}\nTotal Spent: $${customer.total_spent}\nLast Order: ${new Date(customer.last_order_date).toLocaleString()}\n`,
                        inline: false
                    });
                });

                await interaction.editReply({ embeds: [embed] });
            } else if (subcommand === 'top') {
                const limit = interaction.options.getInteger('limit') || 5;
                const { data: topCustomers } = await fetchData('/customers/top', { limit });
                
                const embed = new EmbedBuilder()
                    .setTitle(`Top ${limit} Customers`)
                    .setColor('#0099ff');

                topCustomers.forEach((customer, index) => {
                    embed.addFields({
                        name: `#${index + 1} - ${customer.email}`,
                        value: `Total Orders: ${customer.total_orders}\nTotal Spent: $${customer.total_spent}\nAverage Order Value: $${customer.average_order_value}\n`,
                        inline: false
                    });
                });

                await interaction.editReply({ embeds: [embed] });
            }
        } catch (error) {
            await interaction.editReply({
                content: 'Error processing customer command.',
                ephemeral: true
            });
        }
    },
};