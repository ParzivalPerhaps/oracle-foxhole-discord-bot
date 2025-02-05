
import { InferSchemaType, model, Schema } from "mongoose";

const ticket = new Schema({
    guildId : { type: String, required: true },
    channelId: {type: String, required: true},
    ticketRoleId: {type: String, required: true}, 
    transcript: {tyep: [String], required: true},
    data: {type: [Number], required: false},
});

type TicketType = InferSchemaType<typeof ticket>;

export default model<TicketType>("Ticket", ticket);