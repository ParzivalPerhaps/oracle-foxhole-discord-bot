
import { InferSchemaType, model, Schema } from "mongoose";

const ticket = new Schema({
    guildId : { type: String, required: true },
    ticketId: {type: String, required: true},
    channelId: {type: String, required: true},
    ticketRoleId: {type: String, required: true}, 
    author: {type: String, required: true},
    transcript: {type: [String], required: true},
    data: {type: [Number], required: false},
    logisticsTypes: {type: [String], required: false},
    location: {type: String, required: false},
    demanded: {type: [Number], required: false},
    delivered: {type: [Number], required: false},
    notes: {type: String, required: false},
    complete: {type: Boolean, required: true},
    updateEmbed: {type: String, required: true},
});

type TicketType = InferSchemaType<typeof ticket>;

export default model<TicketType>("Ticket", ticket);