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
    
    const c_setNewUserTicketChannel = {
        name: 'set-recruit-ticket-channel',
        description: 'Set the output channel for new user tickets',
        options: [
            {
                name: 'channel',
                description: 'Set the channel where new user ticket notifications are sent',
                type: ApplicationCommandOptionType.Channel,
                required: true
            }
        ]
    }
    
    const c_setLogisticsTicketChannel = {
        name: 'set-logi-ticket-channel',
        description: 'Set the channel where new logistics ticket notifications are sent',
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
        description: 'Start logistics ticket builder',
        options: [
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
    
    
    const c_resolveTicket = {
        name: 'resolve-ticket',
        description: 'Resolve logistics/new-user ticket at specified channel (current channel by default)',
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

    const c_setActiveRole = {
        name: 'set-active-role',
        description: 'Set active role reference',
        options: [
            {
                name: 'role',
                description: 'Role to assign active members of a war',
                type: ApplicationCommandOptionType.Role,
                required: true
            }
        ]
    }

    const c_setInactiveRole = {
        name: 'set-inactive-role',
        description: 'Set active role reference',
        options: [
            {
                name: 'role',
                description: 'Role to assign inactive members of a war',
                type: ApplicationCommandOptionType.Role,
                required: true
            }
        ]
    }

    const c_enlist = {
        name: 'enlist',
        description: 'Enlist in current war',
    }

    const c_logisticsBuilderAddRequest = {
        name: 'lb-add',
        description: 'Add resource request to current logistics request',
        options: [
            {
                name: 'resource',
                description: 'Name of resource (people will have to type this out to mark deliveries so keep it short)',
                type: ApplicationCommandOptionType.String,
                required: true
            },
            {
                name: 'amount',
                description: 'Amount of resource required in total',
                type: ApplicationCommandOptionType.Integer,
                required: true
            },
        ]
    }

    const c_logisticsBuilderRemoveRequest = {
        name: 'lb-remove',
        description: 'Remove resource request from current logistics request',
        options: [
            {
                name: 'resource',
                description: 'Name of resource (not case-sensitive)',
                type: ApplicationCommandOptionType.String,
                required: true
            },
            {
                name: 'amount',
                description: 'Amount of resource request to remove (defaults to all)',
                type: ApplicationCommandOptionType.Integer,
                required: false
            },
        ]
    }

    const c_deliver = {
        name: 'deliver',
        description: 'Deliver resources to a logistics request ticket',
        options: [
            {
                name: 'resource',
                description: 'Name of resource (not case-sensitive)',
                type: ApplicationCommandOptionType.String,
                required: true
            },
            {
                name: 'amount',
                description: 'Amount of resources delivered',
                type: ApplicationCommandOptionType.Integer,
                required: true
            },
        ]
    }

    const c_logisticsBuilderCompleteRequest = {
        name: 'lb-complete',
        description: 'Complete logistics ticket',
    }

    const c_logisticsBuilderViewRequest = {
        name: 'lb-view',
        description: 'View current logistics request',
    }

    const c_logisticsBuilderDiscrdRequest = {
        name: 'lb-discard',
        description: 'Discard current logistics request',
    }
    
    
    
    
    const cList: any[] = [
        c_startNewWar,
        c_setNewUserTicketChannel,
        c_resolveTicket,
        c_setLogisticsTicketChannel,
        c_createNewLogisticsTicket,
        c_reportLogisticsDelivery,
        c_editLogisticsTicket,
        c_startActivityReminder,
        c_stopActivityReminder,
        c_setActiveRole,
        c_setInactiveRole,
        c_enlist,
        c_logisticsBuilderAddRequest,
        c_logisticsBuilderRemoveRequest,
        c_logisticsBuilderCompleteRequest,
        c_logisticsBuilderViewRequest,
        c_logisticsBuilderDiscrdRequest,
        c_deliver
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

