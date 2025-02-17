const mongoose = require('mongoose');
require('dotenv').config();

const { setTimeout } = require('timers/promises');
import { Client, IntentsBitField, EmbedBuilder, PermissionsBitField, ActivityType, Channel, Message, Interaction, User, GuildMemberRoleManager, ChannelType, PermissionOverwrites, time } from "discord.js";
import OGuildData from "./models/OGuildData";
import { registerCommands } from "./commands";
import { Types } from "mongoose";
import Ticket from "./models/Ticket";
const token = process.env.TOKEN;

const version = "0.1.25";

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
            newUserTicketChannel : " ",
            currentWar : currentWarNumber.toString(),
            tickets: [],
            lastUsedVersion: version,
            logisticsTicketChannel : " ",
            activeRole: " ",
            inactiveRole: " ",
            ticketCategory: " ",
        })
    } else if (oData && context.guildId && oData.lastUsedVersion != version){
        await registerCommands(context.guildId);

        await oData.updateOne({
            lastUsedVersion: version
        })

        /*

        if (oData && oData.activityReminderRoles && oData.activityReminderIds && oData.activityReminderChannel && oData.activityReminderResettable && oData.activityReminderTimeStarted && oData.activityReminderRolesTimeLimit){
            for (let i = 0; i < oData.activityReminderRoles.length; i++) {
                const rl = oData.activityReminderRoles[i];
    
                
                async function f(targetTime: Date) {
                    while (targetTime > new Date()) {
    
                    }
    
                    const w = await OGuildData.findById(oData?.id);
                    
                    if (!w || !oData || !oData.activityReminderIds || !oData.activityReminderChannel || oData.activityReminderResettable || !oData.activityReminderRolesTimeLimit) return;
    
                    if (!w.activityReminderIds?.includes(oData.activityReminderIds[i])){
                        console.log("Reminder ID Not Found: Cancelling reminder (" + oData.activityReminderIds[i] + ")");
                        
                        return;
                    }
    
                    let j = w.activityReminderTimeStarted;
    
                    if (!j) return;
    
                    j[w.activityReminderIds.indexOf(oData.activityReminderIds[i])] = new Date().getTime();
    
                    await w.updateOne({
                        activityReminderTimeStarted: j
                    })
    
                    const reminderEmbed = createOracleEmbed('Activity Reminder' , "Go be active and stuff!", [
                        {name: 'Next Reminder', value: `<t:${Math.round(new Date(new Date().getTime() + (3600000 * oData.activityReminderRolesTimeLimit[i])).getTime() / 1000)}:t>`},
                        {name: 'Last Reset By', value: "No one"}
                    ] , "");
    
                    const u = await c.channels.fetch(oData.activityReminderChannel[i]);
    
                    if (u && u.isTextBased() && rl && oData.activityReminderResettable){
                        console.log("Sending reminder message");
                        
                        await u.send({
                            content: "<@&" + rl + ">",
                            embeds: [
                                reminderEmbed
                            ],
                            components: oData.activityReminderResettable[i] ? [{
                                type: 1,
                                components: [
                                    {
                                        type: 2,
                                        style: 2,
                                        label: "Reset Timer",
                                        custom_id: "reset_reminder_" + oData.activityReminderIds[i]
                                    }
                                ]
                            }] : []
                        })
                    }
    
                    f(new Date(new Date().getTime() + (3600000 * oData.activityReminderRolesTimeLimit[i]))); 
                }
    
                if (oData.activityReminderTimeStarted){
                    f(new Date(oData.activityReminderTimeStarted[i] + (3600000 * oData.activityReminderRolesTimeLimit[i])))
                }
                
            }
        }
            */
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
                .setColor('#1c3627')
                .setTitle(header)
                .setAuthor({ name: 'Oracle Foxhole Bot'})
                .setDescription(text)
                .setThumbnail('https://i.imghippo.com/files/GvV6040sj.png')
                .setTimestamp()
                .setFooter({ text: 'Message generated by Oracle Bot, forward any concerns to: parzival63', iconURL: 'https://i.imghippo.com/files/GvV6040sj.png' });
                
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

    console.log('Oracle Started...');

    let currentWarNumber: number = 0;

    try {
        let wr = (await (await fetch('https://war-service-live.foxholeservices.com/api/worldconquest/war')).json()).warNumber;

        currentWarNumber = wr;
    } catch (error) {
        
    }

    c.user.setPresence({ 
        activities: [{ 
            name: currentWarNumber != 0 ? `War ${currentWarNumber}A` : 'The Good Fight', 
            type: ActivityType.Competing, 
        }], 
        status: 'online' 
    });
});

c.on('guildMemberAdd', async member => {
    try {
        let oData = await OGuildData.findOne({ guildId: member.guild.id });

        if (!oData) return;

        let t = await Ticket.findOne({
            author: member.user.username,
            newUserTicket: true
        })

        if (t){
            member.roles.add(t.ticketRoleId);
            return;
        }

        let cat = member.client.channels.cache.find((v) => {return v.type == ChannelType.GuildCategory && v.name == "Oracle Logi Tickets"});

            if (!cat){
                cat = await member.guild.channels.create({
                    name: "Oracle User Tickets",
                    type: ChannelType.GuildCategory,
                    // your permission overwrites or other options here
                });
            }

            let ticketId = Math.random().toString(36).slice(2, 6);

            while ((await Ticket.findOne({ticketId: ticketId}))){
                ticketId = Math.random().toString(36).slice(2, 6);
            }

            const rl = await member.guild.roles.create({
                name: "user-ticket-" + ticketId
            });

            const perms = (member.guild.roles.cache.map((v) => {
                if (v.permissions.has("ManageRoles")){
                    return {id: v.id, allow: ["ViewChannel"]}
                }else{
                    return {id: v.id, deny: ["ViewChannel"]}
                }

            }) as any[]).concat([{
                id: member.guild.roles.everyone.id, 
                deny: ["ViewChannel"]
            },
            {
                id: rl.id, 
                allow: ["ViewChannel"]
            }] as any[])

            const chnl = await member.guild.channels.create({
                name: "user-ticket-" + ticketId,
                type: ChannelType.GuildText,
                parent: cat.id,
                permissionOverwrites: perms
                // your permission overwrites or other options here
            });

        t = await Ticket.create({
            author: member.user.username,
            newUserTicket: true,
            transcript: [],
            guildId: member.guild.id,
            channelId: chnl.id,
            ticketRoleId: rl.id,
            ticketId: ticketId,
            complete: true,
            closed: false
        });

        const newUserEmbed = createOracleEmbed("Welcome to the 105th!", "We appreciate your patience! Please drop your F1 Screenshot so we can confirm you are a colonial, not a baby-eating warden. Please also read ⁠facility-intro ⁠tanks ⁠artillery while you wait to speed up the process. We require our new members to read those articles. OFFICERS, PLEASE ONLY GIVE THEM THE ENLISTED ROLE WHEN VETTED THEY WILL HAVE 105th Certified WHEN READY TO VETT.", []
                , "");

        chnl.send({ embeds: [newUserEmbed], components: [
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        style: 2,
                        label: "Resolve Ticket",
                        custom_id: "resolve_user_ticket_" + t.ticketId
                    }
                ]
            }
        ]})

        if (oData.newUserTicketChannel){
            const ticketChannel = await c.channels.fetch(oData.newUserTicketChannel);

            if (ticketChannel && ticketChannel.isTextBased()){
                const newUserTicketEmbed = createOracleEmbed("New User: Active Ticket (" + (t.ticketId) + ")", "A new user has joined and a new ticket has been started <#" + (t.channelId) + ">.", []
                    , "");

                await ticketChannel.send({
                    embeds: [newUserTicketEmbed]
                })
            }
        }
    } catch (error) {
        
    }
});


c.on('messageCreate', async (msg: Message) => {
    if (msg.author.bot || !msg.guildId) return;

    
    checkGuild(msg);
    
    const q = await Ticket.findOne({
        channelId: msg.channelId
    })

    if (q){
        await q.updateOne({
            $push: {transcript: msg.author.username + " (" + msg.createdAt.toTimeString() + "): " + msg.content}
        })
    }
});

c.on('interactionCreate', async (interaction: Interaction) => {
    if (!(interaction.isChatInputCommand() || interaction.isButton()) || !interaction.guildId) return;

    console.log(interaction);
    

    await checkGuild(interaction);
    let oData = await OGuildData.findOne({ guildId: interaction.guildId });

    if (interaction.isButton()){
        
        if (interaction.customId.startsWith('resolve_user_ticket_') && oData){
            let ticketId = interaction.customId.substring(interaction.customId.length - 4, interaction.customId.length);

            if ((interaction.member?.permissions as Readonly<PermissionsBitField>).has("ManageChannels")){
                const t = await Ticket.findOne({
                    ticketId: interaction.customId.substring(interaction.customId.length - 4, interaction.customId.length)
                })
    
                if (!t){
                    interaction.reply({content: "*Error finding ticket*", ephemeral: true})
                    return
                }

                const q = c.channels.cache.get(t.channelId);

               if (q && q.type == ChannelType.GuildText){

                const logiChannelEmbed = createOracleEmbed('User Ticket Resolved (' + t.author + ") - " + t.ticketId , "**New User Ticket resolved, order has been marked resolved by officer (" + interaction.user.username + ")", 
                    t.logisticsTypes?.map((v, i) => {
                        if (!t || !t.demanded || !t.delivered) return {name: "A", value: "A"};
                        return {name: v.toString(), value: t.delivered[i].toString() + " / " + t.demanded[i].toString()}
                    }) as {value: string, name: string}[] , "");
                

                if (t.ticketPostEmbed && t.ticketPostChannel){
                    const p = await c.channels.fetch(t.ticketPostChannel);
                    if (!p || !p.isTextBased()) return;

                    await p.messages.fetch(t.ticketPostEmbed).then(async msg => {
                        if (!msg) return;
    
                        await (msg as any).edit({embeds: [logiChannelEmbed], components: []})
                    });    
                }
               
               }

               if (!interaction.guild) return;

               const users = await interaction.guild.members.list();

               const transcriptEmbed = createOracleEmbed('New User Ticket (' + t.ticketId + ") - Transcript" , "This ticket was recently closed, here's a transcript of the discussion:\n\n" + (t.transcript.length > 0 ? t.transcript.join("\n\n") : "*No messages were sent*"), 
                        [] , "");

                for (let i = 0; i < users.size; i++) {
                    if (users.at(i)?.roles.cache.some((v) => {return v.id == t.ticketRoleId})) {
                        await users.at(i)?.send({
                            embeds: [
                                transcriptEmbed
                            ]
                        })
                    }
                }

                if (oData.logChannel){
                    const b = await c.channels.fetch(oData.logChannel);

                    if (b && b.isTextBased()){
                        await b.send({
                            embeds: [
                                transcriptEmbed
                            ]
                        })
                    }
                }

                const rle = await interaction.guild.roles.fetch(t.ticketRoleId);

                if (rle){
                    await rle.delete();
                }
                
                if (q){
                    await q.delete()
                }

                await t.updateOne({
                    closed: true
                });
            }else{
                interaction.reply({content: "*Insufficient permissions - Manage Channel permissions required to force resolve ticket*", ephemeral: true})
            }
        } else if (interaction.customId.startsWith('join_logi_ticket_')){
            let ticketId = interaction.customId.substring(interaction.customId.length - 4, interaction.customId.length);

            const tckt = await Ticket.findOne({
                ticketId: ticketId
            });

            if (!tckt){
                interaction.reply({content: '*Error: Invalid Ticket ID*', ephemeral: true});
                return;
            }

            if (!interaction.member) return;

            (interaction.member.roles as GuildMemberRoleManager).add(tckt.ticketRoleId);

            const rplyEmbed = createOracleEmbed("Logistics Ticket Joined [" + tckt.ticketId + "]", "You have joined " + (tckt.author) + "'s logistics ticket at " + tckt.location + "\n\nRun the */deliver* command in <#" + tckt.channelId + "> to mark your contributions and use the channel to communicate with fellow soldiers.", tckt.logisticsTypes?.map((v, i) => {
                
                if (!tckt.demanded) return {name: "A", value: "A"};
                return {name: v.toString(), value: tckt.demanded[i].toString()}
            }) as {value: string, name: string}[], "");

            interaction.reply({embeds: [rplyEmbed], ephemeral: true});
        }else if (interaction.customId == 'enlist_btn' && oData){
            const activeRole = oData.activeRole;
            const inactiveRole = oData.inactiveRole;

            if (!activeRole) {
                interaction.reply({content: '*Error: Active Role has not been configured*', ephemeral: true});
                return;
            }

            if (!inactiveRole) {
                interaction.reply({content: '*Error: Inactive Role has not been configured*', ephemeral: true});
                return;
            }

            if (!interaction.member) return;

            if ((interaction.member.roles as GuildMemberRoleManager).cache.some((v) => {return v.id == activeRole})){
                interaction.reply({content: `*You've already enlisted! Get out there and fight*`, ephemeral: true});
                return;
            }else{
                (interaction.member.roles as GuildMemberRoleManager).add(activeRole);
                interaction.reply({content: '*Successfully signed up for war ' + (oData.currentWar) +' *', ephemeral: true});
                return;
            }
        }else if (interaction.customId.startsWith("cancel_logi_ticket_") && oData){
            const t = await Ticket.findOne({
                author: interaction.user.username,
                ticketId: interaction.customId.substring(interaction.customId.length - 4, interaction.customId.length),
                complete: false
            })

            if (!t){
                interaction.reply({content: "*No logistics request started, run **/create-logistics-ticket** to start builder*", ephemeral: true})
                return
            }

            await t.deleteOne();
            interaction.reply({content: "*Current builder discarded, start a new ticket by running the **/create-logistics-ticket** command*", ephemeral: true})
        }else if (interaction.customId.startsWith("force_resolve_logi_ticket_") && oData){
            if ((interaction.member?.permissions as Readonly<PermissionsBitField>).has("ManageChannels")){
                const t = await Ticket.findOne({
                    ticketId: interaction.customId.substring(interaction.customId.length - 4, interaction.customId.length)
                })
    
                if (!t){
                    interaction.reply({content: "*Error finding ticket*", ephemeral: true})
                    return
                }

                const q = c.channels.cache.get(t.channelId);

               if (q && q.type == ChannelType.GuildText){

                const logiChannelEmbed = createOracleEmbed('Logistics Ticket [COMPLETE] (' + t.location + ") - " + t.ticketId , "**Logistics order complete**, Logistics order has been marked resolved by officer (" + interaction.user.username + ")", 
                    t.logisticsTypes?.map((v, i) => {
                        if (!t || !t.demanded || !t.delivered) return {name: "A", value: "A"};
                        return {name: v.toString(), value: t.delivered[i].toString() + " / " + t.demanded[i].toString()}
                    }) as {value: string, name: string}[] , "");
                

                if (t.ticketPostEmbed && t.ticketPostChannel){
                    const p = await c.channels.fetch(t.ticketPostChannel);
                    if (!p || !p.isTextBased()) return;

                    await p.messages.fetch(t.ticketPostEmbed).then(async msg => {
                        if (!msg) return;
    
                        await (msg as any).edit({embeds: [logiChannelEmbed], components: []})
                    });    
                }
               
               }

               if (!interaction.guild) return;

               const users = await interaction.guild.members.list();

               const transcriptEmbed = createOracleEmbed('Logistics Ticket (' + t.ticketId + ") - Transcript" , "This ticket was recently closed, here's a transcript of the discussion:\n\n" + (t.transcript.length > 0 ? t.transcript.join("\n\n") : "*No messages were sent*"), 
                        [] , "");

                for (let i = 0; i < users.size; i++) {
                    if (users.at(i)?.roles.cache.some((v) => {return v.id == t.ticketRoleId})) {
                        await users.at(i)?.send({
                            embeds: [
                                transcriptEmbed
                            ]
                        })
                    }
                }

                if (oData.logChannel){
                    const b = await c.channels.fetch(oData.logChannel);

                    if (b && b.isTextBased()){
                        await b.send({
                            embeds: [
                                transcriptEmbed
                            ]
                        })
                    }
                }

                const rle = await interaction.guild.roles.fetch(t.ticketRoleId);

                if (rle){
                    await rle.delete();
                }
                
                if (q){
                    await q.delete()
                }

                await t.updateOne({
                    closed: true
                });
            }else{
                interaction.reply({content: "*Insufficient permissions - Manage Channel permissions required to force resolve ticket*", ephemeral: true})
            }
        }else if (interaction.customId == 'enlist' && oData && interaction.member){
            const activeRole = oData.activeRole;
            const inactiveRole = oData.inactiveRole;

            if (!activeRole) {
                interaction.reply({content: '*Error: Active Role has not been configured*', ephemeral: true});
                return;
            }

            if (!inactiveRole) {
                interaction.reply({content: '*Error: Inactive Role has not been configured*', ephemeral: true});
                return;
            }

            if ((interaction.member.roles as GuildMemberRoleManager).cache.some((v) => {return v.id == activeRole})){
                interaction.reply({content: `*You've already enlisted! Get out there and fight*`, ephemeral: true});
                return;
            }else{
                (interaction.member.roles as GuildMemberRoleManager).add(activeRole);
                interaction.reply({content: '*Successfully signed up for war ' + (oData.currentWar) +' *', ephemeral: true});
                return;
            }
        }else if (interaction.customId.startsWith('reset_reminder_') && oData && interaction.member){
            console.log(interaction);
            
            const reminderIndex = oData.activityReminderIds?.indexOf(interaction.customId.substring(15, interaction.customId.length));
            if (reminderIndex == -1 || !reminderIndex || !oData.activityReminderRoles) {
                interaction.reply({content: "Error finding reminder", ephemeral: true})
                return
            };

            console.log(oData);
            

            const rl = await interaction.guild?.roles.fetch(oData.activityReminderRoles[reminderIndex]);
            const newReminderId = Math.random().toString(36).slice(2, 21);

            if (rl && (interaction.member.roles as GuildMemberRoleManager).cache.has(rl.id)){
                let q = oData.activityReminderRoles;
                let z = oData.activityReminderRolesTimeLimit;
                let m = oData.activityReminderTimeStarted;
                let v = oData.activityReminderResettable;
                let e = oData.activityReminderChannel;
                let d = oData.activityReminderIds;

                if (!z || !d || !q || !m || !v || !e) {
                    interaction.reply({content: "Error verifying reminder information", ephemeral: true})
                    return
                }

                const indx = q.indexOf(rl.id);

                m[indx] = new Date().getTime(); 
                d[indx] = newReminderId;

                const reminderEmbed = createOracleEmbed('Activity Reminder' , "Go be active and stuff!", [
                    {name: 'Next Reminder', value: `<t:${Math.round(new Date(new Date().getTime() + (3600000 * z[indx])).getTime() / 1000)}:t>`},
                    {name: 'Last Reset By', value: interaction.user.username}
                ] , "");

                
                console.log(interaction.message.id);
                
                interaction.message.edit({
                    content: `<@&${q[indx]}>`,
                    embeds: [reminderEmbed],
                    components: v[indx] ? [{
                        type: 1,
                        components: [
                            {
                                type: 2,
                                style: 2,
                                label: "Reset Timer",
                                custom_id: "reset_reminder_" + newReminderId
                            }
                        ]
                    }] : []
                })

                interaction.reply({content: "**Timer Reset** by <@" + interaction.user.id + ">"})

                await oData.updateOne({
                    activityReminderRolesTimeLimit: z,
                    activityReminderTimeStarted: m,
                    activityReminderResettable: v,
                    activityReminderChannel: e,
                    activityReminderIds: d
                })
            }else{
                if (!rl){
                    interaction.reply({content: "Invalid role selected for reminder", ephemeral: true})
                }else{
                    interaction.reply({content: "You must have the mentioned role in order to reset the timer", ephemeral: true})
                }
                
            }
        }
    }
    

    if (!oData || !interaction.member || interaction.isButton()) return;
        
    try {

        if (interaction.commandName == 'start-new-war'){
            if ((interaction.member.permissions as Readonly<PermissionsBitField>).has((PermissionsBitField as any).ManageMessages)){
                if (!interaction.guild) return;

                const activeRole = oData.activeRole;
                const inactiveRole = oData.inactiveRole;

                const users = await interaction.guild.members.list();

                let membersOfCurrentWar = 0;

                for (let i = 0; i < users.size; i++) {
                   if (users.at(i)?.roles.cache.some((v) => {return v.id == activeRole})) membersOfCurrentWar += 1;
                }

                const voidEmbed = createOracleEmbed('New War!', `War ` + oData.currentWar + " has ended, please run **/enlist** to be reactivated for **War " + (interaction.options.getInteger("war-number")) + "**.", 
                [{name: `War ${oData.currentWar} Participants`, value: membersOfCurrentWar.toString()}], "");

                await oData.updateOne({currentWar: interaction.options.getInteger("war-number")});

                

                if (!activeRole) {
                    interaction.reply({content: '*Error: Active Role has not been defined, run /set-active-role [role] to change the active role*', ephemeral: true});
                    return;
                }

                if (!inactiveRole) {
                    interaction.reply({content: '*Error: Inactive Role has not been defined, run /set-inactive-role [role] to change the inactive role*', ephemeral: true});
                    return;
                }

                for (let i = 0; i < users.size; i++) {
                    users.at(i)?.roles.remove(activeRole);
                    users.at(i)?.roles.add(inactiveRole);
                }
                

                interaction.client.channels.fetch(interaction.options.getChannel("notification-channel")?.id || interaction.channelId).then((channel) => {
                    if (!channel) return;
                    (channel as any).send({embeds: [voidEmbed], components: [{
                        type: 1,
                        components: [
                            {
                                type: 2,
                                style: 2,
                                label: "Enlist!",
                                custom_id: "enlist"
                            }
                        ]
                    }] });
                });        

                interaction.reply({content: '*New War Started and Notification Sent to <#' + (interaction.options.getChannel("notification-channel")?.id || interaction.channelId) + '>*', ephemeral: true});
            }else{
                interaction.reply({content: '*Insufficient Permissions*', ephemeral: true});
            }
        }else if (interaction.commandName == 'set-active-role'){
            if ((interaction.memberPermissions?.has("ManageChannels"))){
                const rl = interaction.options.getRole("role");
                
                if (!rl){
                    interaction.reply({content: '*Invalid role provided, please try again*', ephemeral: true});
                    return;
                }

                await oData.updateOne({
                    activeRole: rl.id
                })

                interaction.reply({content: '*Active Role Set*', ephemeral: true});
            }else{
                interaction.reply({content: '*Insufficient Permissions*', ephemeral: true});
            }
        }else if (interaction.commandName == 'set-inactive-role'){
            if ((interaction.member.permissions as Readonly<PermissionsBitField>).has((PermissionsBitField as any).ManageMessages)){
                const rl = interaction.options.getRole("role");
                
                if (!rl){
                    interaction.reply({content: '*Invalid role provided, please try again*', ephemeral: true});
                    return;
                }

                await oData.updateOne({
                    inactiveRole: rl.id
                })

                interaction.reply({content: '*Inactive Role Set*', ephemeral: true});
            }else{
                interaction.reply({content: '*Insufficient Permissions*', ephemeral: true});
            }
        }else if (interaction.commandName == 'enlist'){
            const activeRole = oData.activeRole;
            const inactiveRole = oData.inactiveRole;

            if (!activeRole) {
                interaction.reply({content: '*Error: Active Role has not been configured*', ephemeral: true});
                return;
            }

            if (!inactiveRole) {
                interaction.reply({content: '*Error: Inactive Role has not been configured*', ephemeral: true});
                return;
            }

            

            if ((interaction.member.roles as GuildMemberRoleManager).cache.some((v) => {return v.id == activeRole})){
                interaction.reply({content: `*You've already enlisted! Get out there and fight*`, ephemeral: true});
                return;
            }else{
                (interaction.member.roles as GuildMemberRoleManager).add(activeRole);
                interaction.reply({content: '*Successfully signed up for war ' + (oData.currentWar) +' *', ephemeral: true});
                return;
            }

        }else if (interaction.commandName == 'create-logistics-ticket'){
            const activeRole = oData.activeRole;
            const inactiveRole = oData.inactiveRole;

            if (!activeRole) {
                interaction.reply({content: '*Error: Active Role has not been configured*', ephemeral: true});
                return;
            }

            if (!inactiveRole) {
                interaction.reply({content: '*Error: Inactive Role has not been configured*', ephemeral: true});
                return;
            }

            const r = await Ticket.findOne({
                author: interaction.user.username,
                complete: false
            })

            if (r){
                await r.deleteOne();
            }

            

            if (!(interaction.member.roles as GuildMemberRoleManager).cache.some((v) => {return v.id == activeRole})){
                interaction.reply({content: `*You must be enlisted to start a logistics ticket, enlist by running the **/enlist command***`, ephemeral: true});
                return;
            }

            if (!interaction.guild) return;

            let cat = interaction.guild.channels.cache.find((v) => {return v.type == ChannelType.GuildCategory && v.name == "Oracle Logi Tickets"});

            if (!cat){
                cat = await interaction.guild.channels.create({
                    name: "Oracle Logi Tickets",
                    type: ChannelType.GuildCategory,
                    // your permission overwrites or other options here
                });

                if (!cat){
                    interaction.reply({content:"*Error: Unable to create Logi Ticket Category*", ephemeral: true})
                }
            }

            let ticketId = Math.random().toString(36).slice(2, 6);

            while ((await Ticket.findOne({ticketId: ticketId}))){
                ticketId = Math.random().toString(36).slice(2, 6);
            }

            const rl = await interaction.guild.roles.create({
                name: "logi-support-" + ticketId
            });

            const perms = (interaction.guild.roles.cache.map((v) => {
                if (v.permissions.has("ManageRoles")){
                    return {id: v.id, allow: ["ViewChannel"]}
                }

            }) as any[]).concat([{
                id: interaction.guild.roles.everyone.id, 
                deny: ["ViewChannel"]
            },
            {
                id: rl.id, 
                allow: ["ViewChannel"]
            }] as any[])

            const prm: any[] = [{
                id: interaction.guild.roles.everyone.id, 
                deny: ["ViewChannel"]
            },
            {
                id: rl.id, 
                allow: ["ViewChannel"]
            }]

            const chnl = await interaction.guild.channels.create({
                name: "logi-ticket-" + ticketId,
                type: ChannelType.GuildText,
                parent: cat.id,
                permissionOverwrites: prm
                // your permission overwrites or other options here
            });

            const ticketEmbed = createOracleEmbed('Logistics Ticket ' + (interaction.options.getString('logi-type')) +' (' + interaction.options.getString('sub-type') + ') - ' + interaction.options.getString('location'), " ", 
            [], "");
            
            const msg = await chnl.send({embeds: [ticketEmbed]});

            const tckt = await Ticket.create({
                channelId: chnl.id,
                ticketRoleId: rl.id,
                data: [],
                guildId: interaction.guildId,
                ticketId: ticketId,
                author: interaction.user.username,
                delivered: [],
                location: interaction.options.getString('location'),
                transcript: [],
                notes: interaction.options.getString('notes'),
                complete: false,
                updateEmbed: msg.id,
                closed: false
            });

            await oData.updateOne({
                $push: {tickets: tckt.id}
            });

            


            


            interaction.client.channels.fetch(oData.logisticsTicketChannel || interaction.channelId).then(async (channel) => {
                if (!channel) return;
                /*
                await (channel as any).send({embeds: [ticketEmbed], components: [
                    {
                        type: 1,
                        components: [
                            {
                                type: 2,
                                style: 1,
                                label: "Join Ticket",
                                custom_id: "join_logi_ticket_" + ticketId
                            }
                        ]
                    }
                ],});
                */


                const logiChannelEmbed = createOracleEmbed('Logistics Ticket (' + tckt.location + ")" , "To add resources to the ticket run /lb-add\n\nTo remove resources from the ticket run /lb-remove\n\nIf you're done adding resource requirements, run /lb-complete.", 
                    tckt.logisticsTypes?.map((v, i) => {
                    if (!tckt || !tckt.demanded) return {name: "A", value: "A"};
                    return {name: v.toString(), value: tckt.demanded[i].toString()}
                }) as {value: string, name: string}[] , "");

                interaction.reply({embeds: [logiChannelEmbed], components: [
                    {
                        type: 1,
                        components: [
                            {
                                type: 2,
                                style: 2,
                                label: "Cancel Logi Request Builder",
                                custom_id: "cancel_logi_ticket_" + tckt.ticketId
                            }
                        ]
                    }
                ], ephemeral: true});
            });  


            
        }else if (interaction.commandName == 'lb-add'){
            let t = await Ticket.findOne({
                author: interaction.user.username,
                complete: false
            })

            if (!t || !t.logisticsTypes || !interaction.options.getString("resource")){
                interaction.reply({content: "*No logistics request started, run **/create-logistics-ticket** to start builder*", ephemeral: true})
                return
            }

            if (t.logisticsTypes.find((v) => {
                return (interaction.options.getString("resource") as string).toLowerCase() == v.toLowerCase()
            })){
                let w = t.demanded;

                if (!w) return;

                w[t.logisticsTypes.findIndex((v) => {
                    return (interaction.options.getString("resource") as string).toLowerCase() == v.toLowerCase()
                })] += interaction.options.getInteger("amount") || 0;

                await t.updateOne({
                    demanded: w
                })
            }else{
                await t.updateOne({
                    $push: {logisticsTypes : interaction.options.getString("resource"), demanded : interaction.options.getInteger("amount"), delivered : 0},
                })
            }
            
            t = await Ticket.findOne({
                author: interaction.user.username,
                complete: false
            })

            if (!t) return;

            const logiChannelEmbed = createOracleEmbed('Logistics Ticket (' + t.location + ")" , "To add resources to the ticket run /lb-add\n\nTo remove resources from the ticket run /lb-remove\n\nIf you're done adding resource requirements, run /lb-complete.", 
                t.logisticsTypes?.map((v, i) => {
                   
                    if (!t || !t.demanded) return {name: "A", value: "A"};
                    return {name: v.toString(), value: t.demanded[i].toString()}
                }) as {value: string, name: string}[] , "");

                interaction.reply({embeds: [logiChannelEmbed], components: [
                    {
                        type: 1,
                        components: [
                            {
                                type: 2,
                                style: 2,
                                label: "Cancel Logi Request Builder",
                                custom_id: "cancel_logi_ticket_" + t.ticketId
                            }
                        ]
                    }
                ], ephemeral: true});
        }else if (interaction.commandName == 'lb-remove'){
            let t = await Ticket.findOne({
                author: interaction.user.username,
                complete: false
            })

            if (!t || !t.logisticsTypes || !interaction.options.getString("resource")){
                interaction.reply({content: "*No logistics request started, run **/create-logistics-ticket** to start builder*", ephemeral: true})
                return
            }

            if (t.logisticsTypes.find((v) => {
                return (interaction.options.getString("resource") as string).toLowerCase() == v.toLowerCase();
            })){
                let w = t.demanded;

                if (!w) return;

                const o = t.logisticsTypes.findIndex((v) => {
                    return (interaction.options.getString("resource") as string).toLowerCase() == v.toLowerCase();
                });

                if (interaction.options.getInteger("amount")){
                    w[o] -= interaction.options.getInteger("amount") || 0;

                    w[o] = Math.max(0, w[t.logisticsTypes.findIndex((v) => {
                        return (interaction.options.getString("resource") as string).toLowerCase() == v.toLowerCase();
                    })]);
                }else{
                    w[o] = 0;
                }

                if (w[o] == 0){
                    let m = t.logisticsTypes;
                    let r = t.delivered;

                    w = w.filter((v, i) => {
                        return i != o;
                    })

                    m = m.filter((v, i) => {
                        return i != o;
                    })

                    if (r){
                        r = r.filter((v, i) => {
                            return i != o;
                        })
                    }
                    
                    await t.updateOne({
                        logisticsTypes: m,
                        delivered: r
                    })
                }

                await t.updateOne({
                    demanded: w
                });

                t = await Ticket.findOne({
                    author: interaction.user.username,
                    complete: false
                })

                if (!t) return;

                const logiChannelEmbed = createOracleEmbed('Logistics Ticket (' + t.location + ")" , "To add resources to the ticket run /lb-add\n\nTo remove resources from the ticket run /lb-remove\n\nIf you're done adding resource requirements, run /lb-complete.", 
                t.logisticsTypes?.map((v, i) => {
                    if (!t || !t.demanded) return {name: "A", value: "A"};
                    return {name: v.toString(), value: t.demanded[i].toString()}
                }) as {value: string, name: string}[] , "");

                interaction.reply({embeds: [logiChannelEmbed], components: [
                    {
                        type: 1,
                        components: [
                            {
                                type: 2,
                                style: 2,
                                label: "Cancel Logi Request Builder",
                                custom_id: "cancel_logi_ticket_" + t.ticketId
                            }
                        ]
                    }
                ], ephemeral: true});

            }else{
                interaction.reply({content: "*Resource not found within ticket, did you spell it correctly?*", ephemeral: true});
                return;
            }
            
        }else if (interaction.commandName == 'lb-view'){
            const t = await Ticket.findOne({
                author: interaction.user.username,
                complete: false
            })

            if (!t){
                interaction.reply({content: "*No logistics request started, run **/create-logistics-ticket** to start builder*", ephemeral: true})
                return
            }

            const logiChannelEmbed = createOracleEmbed('Logistics Ticket (' + t.location + ")" , "To add resources to the ticket run /lb-add\n\nTo remove resources from the ticket run /lb-remove\n\nIf you're done adding resource requirements, run /lb-complete.", 
                t.logisticsTypes?.map((v, i) => {
                    if (!t.demanded) return {name: "A", value: "A"};
                    return {name: v.toString(), value: t.demanded[i].toString()}
                }) as {value: string, name: string}[] , "");

                interaction.reply({embeds: [logiChannelEmbed], components: [
                    {
                        type: 1,
                        components: [
                            {
                                type: 2,
                                style: 2,
                                label: "Cancel Logi Request Builder",
                                custom_id: "cancel_logi_ticket_" + t.ticketId
                            }
                        ]
                    }
                ], ephemeral: true});
        }else if (interaction.commandName == 'lb-complete'){
            const t = await Ticket.findOne({
                author: interaction.user.username,
                complete: false
            })

            if (!t){
                interaction.reply({content: "*No logistics request started, run **/create-logistics-ticket** to start builder*", ephemeral: true})
                return
            }

            await (interaction.member.roles as GuildMemberRoleManager).add(t.ticketRoleId);

            const p = await c.channels.fetch(t.channelId)
            if (!p || !p.isTextBased()) {
                
                return
            }

            const logiChannelEmbed = createOracleEmbed('Logistics Ticket (' + t.location + ")" , `${t.author} is requesting logistics assistance, help them out by joining this ticket and marking your deliveries. \n\nRequested resources listed below.`, 
                t.logisticsTypes?.map((v, i) => {
                    
                    if (!t.demanded) return {name: "A", value: "A"};
                    return {name: v.toString(), value: t.demanded[i].toString()}
                }) as {value: string, name: string}[] , "");

                const ticketChannelEmbed = createOracleEmbed('Logistics Ticket (' + t.location + ")" , "Welcome to support ticket " + t.ticketId + ", help " + t.author  +" out by delivering the requested supplies and then running the **/deliver** command to report your work\n\nThe fields below are automatically updated as deliveries are reported\n\nThis channel will automatically lock when all requirements are fulfilled", 
                t.logisticsTypes?.map((v, i) => {
                    if (!t.demanded || !t.delivered) return {name: "A", value: "A"};
                    return {name: v.toString(), value: t.delivered[i].toString() + " / " + t.demanded[i].toString()}
                }) as {value: string, name: string}[] , "");

            
            await p.messages.fetch(t.updateEmbed).then(msg => (msg as any).edit({embeds: [ticketChannelEmbed], components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            style: 1,
                            label: "Force Resolve Ticket",
                            custom_id: "force_resolve_logi_ticket_" + t.ticketId
                        }
                    ]
                }
            ]}))

            await t.updateOne({
                complete: true
            })
            

            interaction.client.channels.fetch(oData.logisticsTicketChannel || interaction.channelId).then(async (channel) => {
                if (!channel || !oData) return;

                const v = await (channel as any).send({embeds: [logiChannelEmbed], components: [
                    {
                        type: 1,
                        components: [
                            {
                                type: 2,
                                style: 2,
                                label: "Join Ticket",
                                custom_id: "join_logi_ticket_" + t.ticketId
                            }
                        ]
                    }
                ]});

                await t.updateOne({
                    ticketPostEmbed: v.id,
                    ticketPostChannel: oData.logisticsTicketChannel || interaction.channelId
                })
            })


            interaction.reply({content: "Logistics ticket published to <#" + oData.logisticsTicketChannel || interaction.channelId + "> and accessible in <#" + t.channelId + ">", ephemeral: true})
        }else if (interaction.commandName == 'lb-discard'){
            const t = await Ticket.findOne({
                author: interaction.user.username,
                complete: false
            })

            if (!t){
                interaction.reply({content: "*No logistics request started, run **/create-logistics-ticket** to start builder*", ephemeral: true})
                return
            }

            await t.deleteOne();
            interaction.reply({content: "*Current builder discarded, start a new ticket by running the **/create-logistics-ticket** command*", ephemeral: true})
        }else if (interaction.commandName == 'deliver'){
            let t = await Ticket.findOne({
                complete: true,
                channelId: interaction.channelId
            })

            if (!t || !t.logisticsTypes){
                interaction.reply({content: "*Invalid channel, make sure the logistics request is complete and the command is being used in a ticket channel*", ephemeral: true})
                return
            }

            const o = t.logisticsTypes.findIndex((v) => {
                return (interaction.options.getString("resource") as string).toLowerCase() == v.toLowerCase();
            });

            if (o == -1) {
                interaction.reply({content: "*Unable to find resource, make sure you spelled it correctly (not case sensitive)*", ephemeral: true})
                return;
            }

            if (!t.delivered) return;

            let y = t.delivered;

            y[o] += interaction.options.getInteger("amount") || 0;

            await t.updateOne({
                delivered: y
            })

            t = await Ticket.findOne({
                complete: true,
                channelId: interaction.channelId
            })

            if (!t || !t.logisticsTypes) return;

            const ticketChannelEmbed = createOracleEmbed('Logistics Ticket (' + t.location + ")" , "Welcome to support ticket " + t.ticketId + ", help out by delivering the requested supplies and then running the **/deliver** command to report your work\n\nThe fields below are automatically updated as deliveries are reported\n\nThis channel will automatically lock when all requirements are fulfilled", 
                t.logisticsTypes?.map((v, i) => {
                    if (!t || !t.demanded || !t.delivered) return {name: "A", value: "A"};
                    return {name: v.toString(), value: t.delivered[i].toString() + " / " + t.demanded[i].toString()}
                }) as {value: string, name: string}[] , "");

            let fulfilled = true;

            for (let i = 0; i < t.logisticsTypes.length; i++) {
                if (!t.delivered || !t.demanded) continue;

                if (t.delivered[i] < t.demanded[i]){
                    fulfilled = false;
                    break;
                }
                
            }

            if (!interaction.channel || !interaction.channel.isTextBased()) return;

            if (fulfilled){
               const q = c.channels.cache.get(t.channelId);

               if (q && q.type == ChannelType.GuildText){

                const logiChannelEmbed = createOracleEmbed('Logistics Ticket [COMPLETE] (' + t.location + ") - " + t.ticketId , "**Logistics order complete**, all resources have been delivered to the appropriate location", 
                    t.logisticsTypes?.map((v, i) => {
                        if (!t || !t.demanded || !t.delivered) return {name: "A", value: "A"};
                        return {name: v.toString(), value: t.delivered[i].toString() + " / " + t.demanded[i].toString()}
                    }) as {value: string, name: string}[] , "");
                
                /*
                await interaction.guild?.channels.edit(q, {
                    permissionOverwrites: [
                        {
                            id: interaction.guild.roles.everyone.id, 
                            deny: ["ViewChannel"]
                        },
                        {
                            id: t.ticketRoleId, 
                            deny: ["ViewChannel"]
                        },
                        {
                            id: interaction.guild.roles.highest.id,
                            allow: ["ViewChannel"]
                        },
                    ]
                });
                */

                if (t.ticketPostEmbed && t.ticketPostChannel){
                    const p = await c.channels.fetch(t.ticketPostChannel);
                    if (!p || !p.isTextBased()) return;

                    await p.messages.fetch(t.ticketPostEmbed).then(async msg => {
                        if (!msg) return;
    
                        await (msg as any).edit({embeds: [logiChannelEmbed], components: []})
                    });    
                }
               
               }

               if (!interaction.guild) return;

               const users = await interaction.guild.members.list();

               const transcriptEmbed = createOracleEmbed('Logistics Ticket (' + t.ticketId + ") - Transcript" , "This ticket was recently closed, here's a transcript of the discussion:\n\n" + (t.transcript.length > 0 ? t.transcript.join("\n\n") : "*No messages were sent*"), 
                        [] , "");

                for (let i = 0; i < users.size; i++) {
                    if (users.at(i)?.roles.cache.some((v) => {return v.id == t.ticketRoleId})) {
                        await users.at(i)?.send({
                            embeds: [
                                transcriptEmbed
                            ]
                        })
                    }
                }

                if (oData.logChannel){
                    const b = await c.channels.fetch(oData.logChannel);

                    if (b && b.isTextBased()){
                        await b.send({
                            embeds: [
                                transcriptEmbed
                            ]
                        })
                    }
                }

                const rle = await interaction.guild.roles.fetch(t.ticketRoleId);

                if (rle){
                    await rle.delete();
                }
                
                if (q){
                    await q.delete()
                }

                await t.updateOne({
                    closed: true
                });
            }
            
            

            if (!fulfilled){
                await interaction.channel.messages.fetch(t.updateEmbed).then(msg => (msg as any).edit({embeds: [ticketChannelEmbed]}));

                interaction.reply({content: "**Logged delivery of " + interaction.options.getInteger("amount") + " " + interaction.options.getString("resource") + (interaction.options.getString("resource")?.endsWith("s") ? "" : "s") + " to " + t.location +" by <@" + (interaction.user.id) + ">**"})
            }else{
                interaction.reply({content:"Automatically resolving issue, all demands met"})
            }   

        }else if (interaction.commandName == 'start-activity-reminder'){
            if ((interaction.member.permissions as Readonly<PermissionsBitField>).has("ManageRoles")){
                if (!oData.activityReminderRoles || !oData.activityReminderRolesTimeLimit || !oData.activityReminderIds || !oData.activityReminderTimeStarted || !oData.activityReminderResettable || !oData.activityReminderChannel){
                    
                    await oData.updateOne({
                        activityReminderRoles: [],
                        activityReminderRolesTimeLimit: [],
                        activityReminderTimeStarted: [],
                        activityReminderResettable: [],
                        activityReminderChannel: [],
                        activityReminderIds: []
                    })
                    
                
                    oData = await OGuildData.findOne({
                        guildId: oData.guildId
                    });

                    if (!oData) return;
                }
                const a = interaction.options.getRole("ping-role");

                const timePeriod = Math.max(Math.abs(interaction.options.getNumber("reminder-period") || 6), 0.1);
                const reactToReset = interaction.options.getBoolean("react-to-reset") || false;
                const reminderChannel = interaction.options.getChannel("channel")?.id || interaction.channelId;

                if (!a) return;

                const newReminderId = Math.random().toString(36).slice(2, 21);

                if (oData.activityReminderRoles?.includes(a.id)){
                    let q = oData.activityReminderRoles;
                    let z = oData.activityReminderRolesTimeLimit;
                    let m = oData.activityReminderTimeStarted;
                    let v = oData.activityReminderResettable;
                    let e = oData.activityReminderChannel;
                    let d = oData.activityReminderIds;

                    if (!z || !d || !q || !m || !v || !e) return;

                    const indx = q.indexOf(a.id);

                    z[indx] = timePeriod * 1000 * 60 * 60;
                    m[indx] = new Date().getMilliseconds(); 
                    v[indx] = reactToReset;
                    e[indx] = reminderChannel;
                    d[indx] = newReminderId;


                    await oData.updateOne({
                        activityReminderRolesTimeLimit: z,
                        activityReminderTimeStarted: m,
                        activityReminderResettable: v,
                        activityReminderChannel: e,
                        activityReminderIds: d
                    })

                    interaction.reply({content: "*Current reminder for <@&" + a.id + "> changed*", ephemeral: true});
                }else{
                    let q = oData.activityReminderRoles;
                    let z = oData.activityReminderRolesTimeLimit;
                    let m = oData.activityReminderTimeStarted;
                    let v = oData.activityReminderResettable;
                    let e = oData.activityReminderChannel;
                    let d = oData.activityReminderIds;

                    if (!z || !d || !q || !m || !v || !e) return;

                    q.push(a.id);
                    z.push(timePeriod * 1000 * 60 * 60)
                    m.push(new Date().getMilliseconds());
                    v.push(reactToReset);
                    e.push(reminderChannel);
                    d.push(newReminderId)


                    await oData.updateOne({
                        activityReminderRoles: q,
                        activityReminderRolesTimeLimit: z,
                        activityReminderTimeStarted: m,
                        activityReminderResettable: v,
                        activityReminderChannel: e,
                        activityReminderIds: d
                    })

                    interaction.reply({content: "*New reminder for <@&" + a.id + "> created*", ephemeral: true});
                }

                

                async function f(targetTime: Date) {
                    while (targetTime > new Date()) {

                    }

                    const w = await OGuildData.findById(oData?.id);
                    
                    if (!w) return;

                    if (!w.activityReminderIds?.includes(newReminderId)){
                        console.log("Reminder ID Not Found: Cancelling reminder (" + newReminderId + ")");
                        
                        return;
                    }

                    let j = w.activityReminderTimeStarted;

                    if (!j) return;

                    j[w.activityReminderIds.indexOf(newReminderId)] = new Date().getTime();

                    await w.updateOne({
                        activityReminderTimeStarted: j
                    })

                    const reminderEmbed = createOracleEmbed('Activity Reminder' , "Go be active and stuff!", [
                        {name: 'Next Reminder', value: `<t:${Math.round(new Date(new Date().getTime() + (3600000 * timePeriod)).getTime() / 1000)}:t>`},
                        {name: 'Last Reset By', value: "No one"}
                    ] , "");

                    const u = await c.channels.fetch(reminderChannel);

                    if (u && u.isTextBased() && a){
                        console.log("Sending reminder message");
                        
                        await u.send({
                            content: "<@&" + a.id + ">",
                            embeds: [
                                reminderEmbed
                            ],
                            components: reactToReset ? [{
                                type: 1,
                                components: [
                                    {
                                        type: 2,
                                        style: 2,
                                        label: "Reset Timer",
                                        custom_id: "reset_reminder_" + newReminderId
                                    }
                                ]
                            }] : []
                        })
                    }

                    f(new Date(new Date().getTime() + (3600000 * timePeriod))); 
                }

                f(new Date());
            }else{
                interaction.reply({content: '*Invalid permissions to run this command*'});
            }
        } else if (interaction.commandName == 'stop-activity-reminder') {
            if (interaction.memberPermissions?.has("ManageChannels")){
                const rl = interaction.options.getRole('role');
                
                if (!rl) {
                    interaction.reply({content: "*Error: Unable to find role*", ephemeral: true})
                    return;
                }
                
                let q = oData.activityReminderRoles;
                let z = oData.activityReminderRolesTimeLimit;
                let m = oData.activityReminderTimeStarted;
                let v = oData.activityReminderResettable;
                let e = oData.activityReminderChannel;
                let d = oData.activityReminderIds;

                if (!z || !d || !q || !m || !v || !e) {
                    interaction.reply({content: "*Role is not currently assigned reminder*", ephemeral: true})
                    return
                };

                const index = q.indexOf(rl.id);

                q = q.filter((n, i) => {return i !== index});
                z = z.filter((n, i) => {return i !== index});
                m = m.filter((n, i) => {return i !== index});
                v = v.filter((n, i) => {return i !== index});
                e = e.filter((n, i) => {return i !== index});
                d = d.filter((n, i) => {return i !== index});
                


                await oData.updateOne({
                    activityReminderRoles: q,
                    activityReminderRolesTimeLimit: z,
                    activityReminderTimeStarted: m,
                    activityReminderResettable: v,
                    activityReminderChannel: e,
                    activityReminderIds: d
                })

                interaction.reply({content: "*Reminder for <@&" + rl.id + "> cancelled*", ephemeral: true});
            }else{
                interaction.reply({content: '*Invalid permissions to run this command*', ephemeral: true});
            }
        }else if (interaction.commandName == 'set-logi-ticket-channel'){
            if (interaction.memberPermissions?.has("ManageChannels")){
                const q = interaction.options.getChannel('channel');

                if (!q){
                    interaction.reply({content: "*Error: Invalid channel selected*", ephemeral: true});

                    return;
                }

                await oData.updateOne({
                    logisticsTicketChannel: q.id,
                });

                interaction.reply({content: "*Updated logi ticket channel to <# " + (q.id)  +">*", ephemeral: true});
            }else{
                interaction.reply({content: '*Invalid permissions to run this command*', ephemeral: true});
            }
        }else if (interaction.commandName == 'set-recruit-ticket-channel'){
            if (interaction.memberPermissions?.has("ManageChannels")){
                const q = interaction.options.getChannel('channel');

                if (!q){
                    interaction.reply({content: "*Error: Invalid channel selected*", ephemeral: true});

                    return;
                }

                await oData.updateOne({
                    newUserTicketChannel: q.id,
                });

                interaction.reply({content: "*Updated new user ticket channel to <# " + (q.id)  +">*", ephemeral: true});
            }else{
                interaction.reply({content: '*Invalid permissions to run this command*', ephemeral: true});
            }
        }
    } catch (error: any) {
        console.log(error);
        interaction.reply({content: "Error occured:\n\n" + error.message, ephemeral: true})
    }
});

c.login(token);
})