const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.commands = new Collection();

// Load commands
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    client.commands.set(command.data.name, command);
}

// Handle interactions
client.on('interactionCreate', async interaction => {
    if (interaction.isStringSelectMenu()) {
        const command = client.commands.get('orders');
        if (command) {
            try {
                await command.handleSelectMenu(interaction);
            } catch (error) {
                console.error(error);
                await interaction.reply({
                    content: 'There was an error processing your selection.',
                    ephemeral: true
                });
            }
        }
    }
});

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN);