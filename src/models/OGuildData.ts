import { InferSchemaType, Schema, model } from "mongoose";
import Ticket from "./Ticket";

const oGuildData = new Schema({
    guildId : { type: String, required: true },
    managementRoles : { type: [String], required: true },
    newUserTicketChannel : { type: String, required: true },
    logisticsTicketChannel : { type: String, required: true },
    currentWar : { type: String, required: true },
    activeRole: {type: String, required: true},
    inactiveRole: {type: String, required: true},
    ticketCategory: {type: String, required: true},
    tickets: {type: [Schema.Types.ObjectId], required: true},
    lastUsedVersion: {type: String, required: false},
    logChannel: {type: String, required: false},
    activityReminderRoles: {type: [String], required: false},
    activityReminderRolesTimeLimit: {type: [Number], required: false},
    activityReminderTimeStarted: {type: [Number], required: false},
    activityReminderResettable: {type: [Boolean], required: false},
    activityReminderChannel: {type: [String], required: false},
    activityReminderIds: {type: [String], required: false},
});

type OGuildDataType = InferSchemaType<typeof oGuildData>;

export default model<OGuildDataType>("OGuildData", oGuildData);