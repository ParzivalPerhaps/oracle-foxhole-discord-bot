require('dotenv').config();
require('discord.js');
const {REST, Routes, ApplicationCommandOptionType} = require('discord.js');

const c_startNewWar = {
    name: 'start-new-war',
    description: 'Start new war, resets all active roles and starts new signup process',
    options: [
        {
            name: 'war number',
            description: 'Number of war',
            type: ApplicationCommandOptionType.Integer,
            required: true
        }
    ]
}



const cList = [c_void, c_refreshFactions, c_assignFaction, c_removeAssignment, c_viewAllAssignments, c_accept, c_deny, c_setLogChannel, c_addFormattedChannel, c_addFaction, c_removeFaction, c_listAllFactions, c_editFaction, c_viewAllFormattedChannels, c_manualRoleUpdate, c_debug];


const rest = new REST({version: '10'}).setToken(process.env.TOKEN);

(async() => {
    try {
        console.log("Registering Commands...");
        console.log(cList);
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT, process.env.GUILD_ID),
            
            { body: cList },
        );

        console.log("Commands Registered");
    } catch (error) {
        console.log("ERR");
        console.log(error);
    }
})();