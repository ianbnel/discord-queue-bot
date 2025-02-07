require('dotenv').config();
const { Client, GatewayIntentBits, SlashCommandBuilder } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Queue storage
const queue = [];

// Create slash command
const commands = [
    new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Join the matching queue')
];

client.once('ready', async () => {
    console.log(`Bot is ready! Logged in as ${client.user.tag}`);
    
    // Register slash command
    try {
        console.log('Started refreshing application (/) commands.');
        await client.application.commands.set(commands);
        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === 'queue') {
        const userId = interaction.user.id;
        
        // Check if user is already in queue
        if (queue.includes(userId)) {
            await interaction.reply({ 
                content: 'You are already in the queue!',
                flags: ['Ephemeral'] 
            });
            return;
        }

        // Add user to queue
        queue.push(userId);
        await interaction.reply({ 
            content: 'You have been added to the queue!',
            flags: ['Ephemeral']
        });

        // Check for match
        if (queue.length >= 2) {
            const user1 = queue.shift();
            const user2 = queue.shift();

            // send private match notifications
            await interaction.followUp({
                content: `You've been matched with <@${user2}>!`,
                flags: ['Ephemeral']
            });

            // Find the other user's interaction to send them a notification
            const user2Member = interaction.guild.members.cache.get(user2);
            if (user2Member) {
                await interaction.followUp({
                    content: `<@${user2}>, you've been matched with <@${user1}>!`,
                    flags: ['Ephemeral']
                });
            }

            // Public announcement in channel
            await interaction.channel.send(`A match has been made!`);
        }
    }
});

client.login(process.env.DISCORD_TOKEN);