const { EmbedBuilder } = require('discord.js');

module.exports = {
    createErrorEmbed(message) {
        return new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('Error')
            .setDescription(message)
            .setTimestamp();
    },

    createSuccessEmbed(title, description) {
        return new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle(title)
            .setDescription(description)
            .setTimestamp();
    }
};