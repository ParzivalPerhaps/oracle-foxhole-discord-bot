import { InferSchemaType, Schema, model } from "mongoose";
import Ticket from "./Ticket";

const oGuildData = new Schema({
    guildId : { type: String, required: true },
    managementRoles : { type: [String], required: true },
    newUserTicketChannel : { type: String, required: true },
    currentWar : { type: Number, required: true },
    tickets: {type: [Schema.Types.ObjectId], required: true},
});

type OGuildData = InferSchemaType<typeof oGuildData>;

export default model<OGuildData>("OGuildData", oGuildData);