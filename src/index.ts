const mongoose = require('mongoose');
require('dotenv').config();

const { setTimeout } = require('timers/promises');
import { Client, IntentsBitField, EmbedBuilder, PermissionsBitField, ActivityType, Channel, Message, Interaction, User } from "discord.js";
import OGuildData from "./models/OGuildData";
import { registerCommands } from "./commands";
import { Types } from "mongoose";
const token = process.env.TOKEN;

mongoose.connect(process.env.MONGO_CONNECTION_URI).then(() => {

async function checkGuild(context: Interaction | Message) {
    let oData = await OGuildData.findOne({ guildId: context.guildId });

    if (!oData && context.guildId){
        await registerCommands(context.guildId);
        let currentWarNumber: number = 0;

        try {
            let wr = (await (await fetch('https://war-service-live.foxholeservices.com/api/worldconquest/war')).json()).warNumber;

            currentWarNumber = wr;
        } catch (error) {
            
        }

        oData = await OGuildData.create({
            guildId : context.guildId,
            managementRoles : [],
            newUserTicketChannel : "-1",
            currentWar : currentWarNumber,
            tickets: [],
        })
    }
}

let createTicket = async (type: "logistics" | "recruit", users: User[], interaction: Interaction) => {
    await checkGuild(interaction);

    let oData = await OGuildData.findOne({ guildId: interaction.guildId });

    if (!oData) return;

    if (type == 'logistics'){
        if (oData.logisticsTicketChannel){
            
        }
    }else if (type == 'recruit'){

    }
}

let isolateChannelId = (messageId: string) => {
    return messageId.split('/')[5];
};

let isolateMessageId = (messageId: string) => {
    return messageId.split('/')[6];
};

let createRole = async (name: string, color: string, context: any) => {
    context.guild.roles.create({name: name, color: color});
};

let createOracleEmbed = (header: string, text: string, fields: any[], link: string) => {
    const voidEmbed = new EmbedBuilder()
                .setColor('#EA7317')
                .setTitle(header)
                .setAuthor({ name: 'ORACLE FOXHOLE BOT'})
                .setDescription(text)
                .setThumbnail('https://i.imgur.com/sdreomT.png')
                .setTimestamp()
                .setFooter({ text: 'Message generated by ORACLE BOT, forward any concerns to: parzival63', iconURL: 'https://i.imgur.com/sdreomT.png' });
                
                if (fields){
                    for (let i = 0; i < fields.length; i++) {
                        voidEmbed.addFields({name: fields[i].name, value: fields[i].value});
                    }
                }

                if (link){
                    voidEmbed.setURL(link);
                }
                

    return voidEmbed;
};


const c = new Client({
    intents: [
        IntentsBitField.Flags.Guilds, 
        IntentsBitField.Flags.GuildMessages, 
        IntentsBitField.Flags.GuildMembers, 
        IntentsBitField.Flags.GuildModeration,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.GuildMessageReactions,
        IntentsBitField.Flags.GuildMessageTyping,
        IntentsBitField.Flags.DirectMessages]
});

if (!c) {
    console.error("Failed to start ORACLE client");
    return;
}

c.on('ready', async () => {
    if (!c.user) return;

    console.log('Oracle FX Started...');

    let currentWarNumber: number = 0;

    try {
        let wr = (await (await fetch('https://war-service-live.foxholeservices.com/api/worldconquest/war')).json()).warNumber;

        currentWarNumber = wr;
    } catch (error) {
        
    }

    c.user.setPresence({ 
        activities: [{ 
            name: currentWarNumber != 0 ? `War ${currentWarNumber}` : 'The Good Fight', 
            type: ActivityType.Competing, 
        }], 
        status: 'online' 
    });
});

c.on('messageCreate', async (msg: Message) => {
    if (msg.author.bot || !msg.guildId) return;

    
    getGuildData(msg);
    

});

c.on('interactionCreate', async (interaction: Interaction) => {
    if (!interaction.isChatInputCommand() || !interaction.guildId) return;

    let oData = await getGuildData(interaction);

    if (!interaction.member) return;

    try {

        if (interaction.commandName == 'start-new-war'){

        }

        /*
        if (interaction.commandName == 'void') {
            if ((interaction.member.permissions as Readonly<PermissionsBitField>).has(PermissionsBitField.ManageMessages)){
                const reason = await interaction.options.getString('reason');
            
                const staffName = interaction.user.username;
                let authorName = 'NUL';
                let channelName = 'NUL';

                let msg = 'NUL';

                const ch = await interaction.guild.channels.fetch(isolateChannelId(interaction.options.getString('message')));

                await ch.messages.fetch(isolateMessageId(interaction.options.getString('message'))).then((message) => {
                    console.log("NAME: " + message["author"]["username"]);
                    msg = message;
                    
                    authorName = message["author"]["username"];

                    try{
                        let str = "\n*Hi! Your message has been voided by a staff member. Please review the rules and try again.*";

                        if (reason) {
                            str += " \n **Reason:** " + reason;
                        }

                        message["author"].send(str);
                    } catch (err) {
                        console.log("User has DMs disabled");
                    }
                    
                    message.delete();
                });

                channelName = ch.name;

                console.log(authorName);
                console.log(channelName);
                console.log(staffName); 

                let fields = [{name: 'Voided Message', value: msg['content']}];

                if (reason) {
                    console.log(reason);
                    fields.push({name: 'Reason', value: reason});
                }

                const voidEmbed = createArgoEmbed('Voided Action', `**Staff:** ${staffName}\n**Author:** ${authorName}\n**Channel:** #${channelName}`, fields);

                interaction.client.channels.fetch(configData.logChannelId).then((channel) => {
                    channel.send({embeds: [voidEmbed]});
                });        

                interaction.reply({content: '*Message Voided, User Notified, Log Created*', ephemeral: true});
            }else{
                interaction.reply({content: '*You do not have permission to use this command*', ephemeral: true});
            }
            

        }else if (interaction.commandName == 'refreshfactions') {
            if (interaction.member.permissions.has(PermissionsBitField.ManageRoles)){

                

            }else{
                interaction.reply({content: '*You do not have permission to use this command*', ephemeral: true});
            }
        }else if (interaction.commandName == 'assignfaction') {
            if (interaction.member.permissions.has(PermissionsBitField.ManageRoles)){
                updateInfo();

                const user = await interaction.options.getUser('user');
                const faction = await interaction.options.getString('faction');

                let role = await interaction.guild.roles.fetch(factions[faction]["role"]);
                console.log(role);

                let removedFaction = "N/A";

                for (let i = 0; i < factionTags.length; i++) {
                    console.log(factionTags[i]);
                    console.log(factions[factionTags[i]]);

                    if (factions[factionTags[i]] == undefined) continue;

                    if (factions[factionTags[i]]["owner"] != user.id) continue;

                    await interaction.guild.members.fetch(user.id).then((member) => {
                        console.log(factions[factionTags[i]]["role"]);
                        member.roles.remove(factions[factionTags[i]]["role"]);
                    });

                    factions[factionTags[i]]["owner"] = "Null";
                    removedFaction = factionTags[i];
                }   

                let authorName = 'NUL';

                await interaction.guild.members.fetch(user.id).then((member) => {
                    member.roles.add(role.id);
                    factions[faction]["owner"] = user.id;
                    authorName = member.displayName;
                });

                const voidEmbed = createArgoEmbed(authorName + " Assigned to " + faction, `**Staff Member:** ` + interaction.user.displayName, [{name: 'Removed Roles', value: removedFaction}]);

                interaction.client.channels.fetch(configData.logChannelId).then((channel) => {
                    channel.send({embeds: [voidEmbed]});
                });  

                interaction.reply({content: '*Faction Assigned* | ' + user.displayName + " to " + faction, ephemeral: true});
                writeConfig();
            }else{
                interaction.reply({content: '*You do not have permission to use this command*', ephemeral: true});
            }
        }else if (interaction.commandName == 'removeassignment') {
            if (interaction.member.permissions.has(PermissionsBitField.ManageRoles)){
                let removedFaction = "N/A";
                for (let i = 0; i < factionTags.length; i++) {
                    if (factions[factionTags[i]]["owner"] != interaction.options.getUser('user').id) continue;

                    await interaction.guild.members.fetch(interaction.options.getUser('user').id).then((member) => {
                        member.roles.remove(factions[factionTags[i]]["role"]);
                    });

                    factions[factionTags[i]]["owner"] = "Null";
                    removedFaction = factionTags[i];
                }

                const voidEmbed = createArgoEmbed(interaction.options.getUser('user').displayName + " Faction Assignment Removed", `**Staff Member:** ` + interaction.user.displayName, [{name: 'Removed Roles', value: removedFaction}]);

                interaction.client.channels.fetch(configData.logChannelId).then((channel) => {
                    channel.send({embeds: [voidEmbed]});
                });

                writeConfig();

                interaction.reply({content: '*Faction Assignment Removed*', ephemeral: true});
            }else{
                interaction.reply({content: '*You do not have permission to use this command*', ephemeral: true});
            }
        }else if (interaction.commandName == 'viewall') {
            let str = "";
            for (let i = 0; i < factionTags.length; i++) {
                let faction = factions[factionTags[i]];

                console.log(faction);
                if (faction == undefined) continue;
                if (faction["owner"] == undefined || faction['owner'] == 'Null') continue;

                let user;
                let role;

                await interaction.guild.roles.fetch(faction["role"]).then((r) => {
                    role = r.name;
                });
                console.log(role);
                await interaction.guild.members.fetch(faction["owner"]).then((u) => {
                    user = u.displayName;
                });

                str += "\n\n**Faction:** " + faction["name"] + "\n**Tag:** " + factionTags[i] + "\n**Role:** " + role + "\n**Owner:** " + user;

                
            }

            const voidEmbed = createArgoEmbed("Faction Assignments Overview", str, null, null);

            interaction.channel.send({embeds: [voidEmbed]});
            interaction.reply({content: '*Faction Assignments Overview Processed*', ephemeral: true});
        }else if (interaction.commandName == 'accept'){
            let msg = interaction.options.getString('proposal');
            
            let authorName;
            let channelName;
            let channelF;

            

            await interaction.guild.channels.fetch(isolateChannelId(msg)).then((channel) => {
                channelName = channel.name;
                channelF = channel;
                
                channel.messages.fetch(isolateMessageId(msg)).then((message) => {
                    const voidEmbed = createArgoEmbed('Proposal Accepted', '**Channel:** #' + channelName, [{name: 'Accepted Proposal', value: message.content}], null);
                    message.author.send({embeds: [voidEmbed]})
                });
            });

            await channelF.messages.fetch(isolateMessageId(msg)).then((message) => {authorName = message.author.displayName;});

            const voidEmbed = createArgoEmbed('Proposal Accepted', '**Staff: **' + interaction.user.displayName + '\n**Author:** ' + authorName + '\n**Channel:** #' + channelName, [{name: 'Accepted Proposal', value: msg}]);

            interaction.client.channels.fetch(configData.logChannelId).then((channel) => {
                channel.send({embeds: [voidEmbed]});
            });

            interaction.reply({content: '*Proposal Accepted, User Notified, Log Created*', ephemeral: true});
        }else if (interaction.commandName == 'deny'){
            let msg = interaction.options.getString('proposal');
            
            let authorName;
            let channelName;
            let channelF;

            

            await interaction.guild.channels.fetch(isolateChannelId(msg)).then((channel) => {
                channelName = channel.name;
                channelF = channel;
                
                channel.messages.fetch(isolateMessageId(msg)).then((message) => {
                    const voidEmbed = createArgoEmbed('Proposal Denied', '**Channel:** #' + channelName, [{name: 'Denied Proposal', value: message.content}], null);
                    message.author.send({embeds: [voidEmbed]})
                });
            });

            await channelF.messages.fetch(isolateMessageId(msg)).then((message) => {authorName = message.author.displayName;});

            const voidEmbed = createArgoEmbed('Proposal Denied', '**Staff: **' + interaction.user.displayName + '\n**Author:** ' + authorName + '\n**Channel:** #' + channelName, [{name: 'Denied Proposal', value: msg}]);

            interaction.client.channels.fetch(configData.logChannelId).then((channel) => {
                channel.send({embeds: [voidEmbed]});
            });

            interaction.reply({content: '*Proposal Denied, User Notified, Log Created*', ephemeral: true});
        }else if (interaction.commandName == 'setlogchannel'){
            if (interaction.member.permissions.has(PermissionsBitField.ManageRoles)){
                const channel = await interaction.options.getChannel('channel');

                logChannelId = channel.id;

                interaction.reply({content: '*Log Channel Set*', ephemeral: true});
                writeConfig();
            }else{
                interaction.reply({content: '*You do not have permission to use this command*', ephemeral: true});
            }
        }else if (interaction.commandName == 'addformattedchannel'){
            if (interaction.member.permissions.has(PermissionsBitField.ManageRoles)){
                const channel = await interaction.options.getChannel('channel');

                formattedChannels.push(channel.name);

                interaction.reply({content: '*Channel Added To List*', ephemeral: true});
                writeConfig();
            }else{
                interaction.reply({content: '*You do not have permission to use this command*', ephemeral: true});
            }
        }else if (interaction.commandName == 'removeformattedchannel'){
            if (interaction.member.permissions.has(PermissionsBitField.ManageRoles)){
                const channel = await interaction.options.getChannel('channel');

                formattedChannels.splice(formattedChannels.indexOf(channel.name), 1);

                interaction.reply({content: '*Channel Removed From List*', ephemeral: true});
                writeConfig();
            }else{
                interaction.reply({content: '*You do not have permission to use this command*', ephemeral: true});
            }
        }else if(interaction.commandName == 'viewallformattedchannels'){
            let str = "";
            for (let i = 0; i < formattedChannels.length; i++) {
                str += "\n\n**Channel:** #" + formattedChannels[i];
            }

            const voidEmbed = createArgoEmbed("Formatted Channel List", str, null, null);

            interaction.channel.send({embeds: [voidEmbed]});
            interaction.reply({content: '*Formatted Channel List Processed*', ephemeral: true});
        } else if (interaction.commandName == 'addfaction'){
            if (interaction.member.permissions.has(PermissionsBitField.ManageRoles)){
                const name = await interaction.options.getString('name');
                const tag = await interaction.options.getString('tag');
                const color = await interaction.options.getString('color');

                factions[tag] = {name: name, color: color, owner: "Null"};

                interaction.reply({content: '*Faction Added*', ephemeral: true});
                factionTags.push(tag);
                factions["list"] = factionTags;
                writeConfig();
            }else{
                interaction.reply({content: '*You do not have permission to use this command*', ephemeral: true});
            }
        }else if (interaction.commandName == 'removefaction'){
            if (interaction.member.permissions.has(PermissionsBitField.ManageRoles)){
                const tag = await interaction.options.getString('tag');

                delete factions[tag];

                interaction.reply({content: '*Faction Removed*', ephemeral: true});
                writeConfig();
            }else{
                interaction.reply({content: '*You do not have permission to use this command*', ephemeral: true});
            }
        }else if (interaction.commandName == 'listfactions'){
            let str = "";
            for (let i = 0; i < factionTags.length; i++) {
                let faction = factions[factionTags[i]];

                if (faction == undefined) continue;

                str += "\n\n**Faction:** " + faction["name"] + "\n**Tag:** " + factionTags[i] + "\n**Color:** " + faction["color"];
            }

            const voidEmbed = createArgoEmbed("Faction List", str, null, null);

            interaction.channel.send({embeds: [voidEmbed]});
            interaction.reply({content: '*Faction List Processed*', ephemeral: true});
        }else if (interaction.commandName == 'editfaction'){
            const name = await interaction.options.getString('name');
            const tag = await interaction.options.getString('tag');
            const color = await interaction.options.getString('color');
            const description = await interaction.options.getString('description');

            if (name){
                factions[tag]["name"] = name;
            }

            if (color){
                factions[tag]["color"] = color;
            }

            if (description){
                factions[tag]["description"] = description;
            }

            interaction.reply({content: '*Faction Edited*', ephemeral: true});
            writeConfig();
            updateRoles(interaction);
        }else if (interaction.commandName == 'manualroleupdate'){ 
            let b  = false;
            let member = await interaction.guild.members.fetch(interaction.user.id);
            
            const list = await interaction.client.guilds.cache.get(process.env.GUILD_ID).members.fetch();

            for (u of list){
                for (let i = 0; i < factionTags.length; i++) {
                    if (factions[factionTags[i]]["owner"] == undefined) continue;
                    if (factions[factionTags[i]]["owner"] == "Null") continue;

                    let user = u[1].user;
    
                    console.log(factions[factionTags[i]]["owner"] + " | " + user.id);
                    if (factions[factionTags[i]]["owner"] == user.id) {
                        b = true;
                        console.log("ADD PLAYER ROLE");
                        
                        
                        await interaction.guild.members.fetch(user.id).then((member) => {
                            if (member.roles.cache.has(playerRole) && !member.roles.cache.has(spectatorRole)) return;
    
                            member.roles.add(playerRole);
                            member.roles.remove(spectatorRole);
                            
                            console.log(member.user.username);
                        });

                        
                    }
    
                    if (!b){
                        console.log("REMOVE PLAYER ROLE");

                        

                        await interaction.guild.members.fetch(user.id).then((member) => {
                            if (member.roles.cache.has(spectatorRole) && !member.roles.cache.has(playerRole)) return;
    
                            member.roles.add(spectatorRole);
                            member.roles.remove(playerRole);
                            
                        });

                        
                    }
                }
            }

            
        }else if(interaction.commandName == 'debug'){
            if (interaction.member.permissions.has(PermissionsBitField.ManageRoles)){
                let b  = false;
                let member = await interaction.guild.members.fetch(interaction.user.Id);
                console.log(member.roles);
                for (let i = 0; i < factionTags.length; i++) {
                    if (factions[factionTags[i]]["owner"] == undefined) continue;

                    console.log(factions[factionTags[i]]["owner"] + " | " + context.user.Id);
                    if (factions[factionTags[i]]["owner"] == context.user.Id) {
                        b = true;
                        await interaction.guild.members.fetch(interaction.user.Id).then((member) => {
                            if (member.roles.has(playerRole)) return;

                            member.roles.add(playerRole);
                            member.roles.remove(spectatorRole);
                        });
                    }

                    if (!b){
                        await interaction.guild.members.fetch(interaction.user.Id).then((member) => {
                            if (member.roles.has(spectatorRole)) return;

                            member.roles.add(spectatorRole);
                            member.roles.remove(playerRole);
                        });
                    }
                }
                
            }else{
                interaction.reply({content: '*You do not have permission to use this command*', ephemeral: true});
            }
        }
            */

    } catch (error) {
        console.log(error);
    }
});

c.login(token);
})