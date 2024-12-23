import { model, Schema } from "mongoose";

const postSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    thumbnailUrl: {
      type: String,
      required: true,
    },
    videoUrl: {
      type: String,
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    likedBy: [
      {
        type: Schema.Types.ObjectId,
        require: true,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

postSchema.set("toJSON", {
  transform: function (doc, ret, options) {
    return {
      id: ret._id,
      user: ret.user,
      title: ret.title,
      thumbnailUrl: ret.thumbnailUrl,
      videoUrl: ret.videoUrl,
      likedBy: ret.likedBy,
      createdAt: ret.createdAt,
      updatedAt: ret.updatedAt,
    };
  },
});

class PostClass {}
postSchema.loadClass(PostClass);

export const Post = model("Post", postSchema);
