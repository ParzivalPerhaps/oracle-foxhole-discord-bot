require('dotenv').config();
require('discord.js');
import { ApplicationCommandOptionType, REST, Routes } from "discord.js";

export async function registerCommands(guildId: string) {
    const c_startNewWar = {
        name: 'start-new-war',
        description: 'Start new war, resets all active roles and starts new signup process',
        options: [
            {
                name: 'war-number',
                description: 'Number of war',
                type: ApplicationCommandOptionType.Integer,
                required: true
            },
            {
                name: 'notification-channel',
                description: 'Channel where announcement will be made',
                type: ApplicationCommandOptionType.Channel,
                required: true
            }
        ]
    }
    
    const c_addNewUserManagementRoles = {
        name: 'add-recruit-management-role',
        description: 'Give role permissions to access/resolve new user tickets',
        options: [
            {
                name: 'role',
                description: 'Role to grant access to',
                type: ApplicationCommandOptionType.Role,
                required: true
            }
        ]
    }
    
    
    const c_removeNewUserManagementRoles = {
        name: 'remove-recruit-management-role',
        description: 'Set who can access/resolve new user tickets',
        options: [
            {
                name: 'role',
                description: 'Role to revoke access from',
                type: ApplicationCommandOptionType.Role,
                required: true
            }
        ]
    }
    
    const c_setNewUserTicketChannel = {
        name: 'set-recruit-ticket-channel',
        description: 'Set the output channel for new user tickets',
        options: [
            {
                name: 'channel',
                description: 'Channel to be the output channel for new user tickets',
                type: ApplicationCommandOptionType.Channel,
                required: true
            }
        ]
    }
    
    const c_resolveNewUserTicket = {
        name: 'resolve-new-user-ticket',
        description: 'Mark resolved and archive new user ticket in channel (by default current channel)',
        options: [
            {
                name: 'channel',
                description: 'Ticket channel to be resolved',
                type: ApplicationCommandOptionType.Channel,
                required: false
            }
        ]
    }
    
    const c_setLogisticsTicketChannel = {
        name: 'set-logi-ticket-channel',
        description: 'Set the channel where new logistics tickets are sent',
        options: [
            {
                name: 'channel',
                description: 'Channel to be the output channel for new user tickets',
                type: ApplicationCommandOptionType.Channel,
                required: true
            }
        ]
    }
    
    const c_createNewLogisticsTicket = {
        name: 'create-logistics-ticket',
        description: 'Create new logistics ticket',
        options: [
            {
                name: 'logi-type',
                description: 'Type of logistics you need',
                type: ApplicationCommandOptionType.String,
                choices: [
                    { name: 'Equipment', value: 'equipment' },
                    { name: 'Ammo', value: 'ammo' },
                    { name: 'Resource', value: 'resources' },
                    { name: 'Delivery', value: 'delivery' },
                ],
                required: true
            },
            {
                name: 'quantity',
                description: 'How many units of selected logistics item you need',
                type: ApplicationCommandOptionType.Integer,
                required: true
            },
            {
                name: 'location',
                description: 'Location for delivery of logistics',
                type: ApplicationCommandOptionType.String,
                required: true
            },
        ]
    }
    
    const c_reportLogisticsDelivery = {
        name: 'report-logi-delivery',
        description: 'Report logistics delivery towards a ticket',
        options: [
            {
                name: 'quantity',
                description: 'How many units of selected logistics item were delivered',
                type: ApplicationCommandOptionType.Integer,
                required: true
            },
            {
                name: 'logi-ticket-channel',
                description: 'The channel of the logistics ticket (by default current channel is selected)',
                type: ApplicationCommandOptionType.Channel,
                required: false
            }
        ]
    }
    
    const c_editLogisticsTicket = {
        name: 'modify-logistics-ticket',
        description: 'Change logistics ticket details',
        options: [
            {
                name: 'ticket-channel',
                description: 'Channel of logistics ticket (defaults to current channel)',
                type: ApplicationCommandOptionType.Channel,
                required: false
            },
            {
                name: 'logi-type',
                description: 'Type of logistics required',
                type: ApplicationCommandOptionType.String,
                choices: [
                    { type:ApplicationCommandOptionType.String, name: 'Equipment', value: 'equipment' },
                    { type:ApplicationCommandOptionType.String, name: 'Ammo', value: 'ammo' },
                    { type:ApplicationCommandOptionType.String, name: 'Resource', value: 'resources' },
                    { type:ApplicationCommandOptionType.String, name: 'Delivery', value: 'delivery' },
                ],
                required: false
            },
            {
                name: 'quantity',
                description: 'How many units of selected logistics item required',
                type: ApplicationCommandOptionType.Integer,
                required: false
            },
            {
                name: 'location',
                description: 'Location for delivery of logistics',
                type: ApplicationCommandOptionType.String,
                required: false
            },
        ]
    }
    
    
    const c_resolveLogisticsTicket = {
        name: 'resolve-logistics-ticket',
        description: 'Resolve logistics ticket',
        options: [
            {
                name: 'note',
                description: 'Note to add to the archive log',
                type: ApplicationCommandOptionType.String,
                required: true
            },
            {
                name: 'ticket-channel',
                description: 'Channel of logistics ticket (defaults to current channel)',
                type: ApplicationCommandOptionType.Channel,
                required: false
            },
        ]
    }
    
    const c_startActivityReminder = {
        name: 'start-activity-reminder',
        description: 'Start activity reminder in channel (by default current channel)',
        options: [
            {
                name: 'ping-role',
                description: 'Role to ping when reminder runs',
                type: ApplicationCommandOptionType.Channel,
                required: true
            },
            {
                name: 'react-to-reset',
                description: 'Determines whether members of the assigned role can react to reset the timer',
                type: ApplicationCommandOptionType.Boolean,
                required: true
            },
            {
                name: 'reminder-period',
                description: 'Length (in hours) between reminder pings, defaults to 6',
                type: ApplicationCommandOptionType.Number,
                required: false
            },
            {
                name: 'channel',
                description: 'Channel to send reminder in',
                type: ApplicationCommandOptionType.Channel,
                required: false
            }
        ]
    }
    
    const c_stopActivityReminder = {
        name: 'stop-activity-reminder',
        description: 'Stop activity reminder in channel (by default current channel)',
        options: [
            {
                name: 'channel',
                description: 'Channel to stop reminders in',
                type: ApplicationCommandOptionType.Channel,
                required: false
            }
        ]
    }
    
    
    
    
    const cList: any[] = [
        c_startNewWar,
        c_addNewUserManagementRoles,
        c_setNewUserTicketChannel,
        c_resolveNewUserTicket,
        c_removeNewUserManagementRoles,
        c_setLogisticsTicketChannel,
        c_createNewLogisticsTicket,
        c_reportLogisticsDelivery,
        c_editLogisticsTicket,
        c_resolveLogisticsTicket,
        c_startActivityReminder,
        c_stopActivityReminder,
    ];
    
    if (!process.env.TOKEN || !process.env.CLIENT) {
        console.error("Please set TOKEN and CLIENT .env variables");
        return;
    }
    
    const rest = new REST({version: '10'}).setToken(process.env.TOKEN);
    
    (async() => {
        if (!process.env.TOKEN || !process.env.CLIENT) {
            console.error("Please set TOKEN and CLIENT .env variables");
            return;
        }
        
        try {
            console.log("Registering Commands...");
            console.log(cList);
            await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT, guildId),
                
                { body: cList },
            );
    
            console.log("Commands Registered");
        } catch (error) {
            console.log("ERR");
            console.log(error);
        }
    })();
}

