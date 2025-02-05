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
                ephemeral: true 
            });
            return;
        }

        // Add user to queue
        queue.push(userId);
        await interaction.reply({ 
            content: 'You have been added to the queue!',
            ephemeral: true 
        });

        // Check for match
        if (queue.length >= 2) {
            const user1 = queue.shift();
            const user2 = queue.shift();

            // Send match notifications
            const channel = interaction.channel;
            await channel.send(`Match found! <@${user1}> and <@${user2}> have been matched!`);

            // DM the matched users
            try {
                const user1DM = await client.users.fetch(user1);
                const user2DM = await client.users.fetch(user2);
                
                await user1DM.send(`You've been matched with <@${user2}>!`);
                await user2DM.send(`You've been matched with <@${user1}>!`);
            } catch (error) {
                console.error('Error sending DMs:', error);
            }
        }
    }
});

client.login(process.env.DISCORD_TOKEN);