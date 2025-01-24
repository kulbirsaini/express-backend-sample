import { model, Schema } from "mongoose";

const ticketSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  { timestamps: true }
);

ticketSchema.set("toJSON", {
  transform: function (doc, ret, options) {
    return {
      id: ret._id,
      user: ret.user,
      title: ret.title,
      description: ret.description,
      createdAt: ret.createdAt,
      updatedAt: ret.updatedAt,
    };
  },
});

class TicketClass {}
ticketSchema.loadClass(TicketClass);

export const Ticket = model("Ticket", ticketSchema);