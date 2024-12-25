import { model, Schema } from "mongoose";
import { decodeToken, generateOtpToken, getTimeToLive, getToken } from "../lib/jwt.js";
import { toPng } from "jdenticon";
import { uploadFile } from "../lib/imagekit.js";
import { getAccountConfirmationEmail, sendEmail } from "../lib/mailer.js";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatarUrl: {
      type: String,
      required: false,
    },
    likedPosts: [
      {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Post",
      },
    ],
    tokens: [{ type: String, required: true }],
    confirmed: {
      type: Boolean,
      required: true,
      default: false,
    },
    confirmationToken: {
      type: String,
      required: false,
    },
    otp: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

userSchema.set("toJSON", {
  transform: function (doc, ret, options) {
    return {
      id: ret._id,
      name: ret.name,
      email: ret.email,
      avatarUrl: ret.avatarUrl,
      likedPosts: ret.likedPosts,
    };
  },
});

class UserClass {
  async createAvatar(salt = "") {
    const avatar = { originalname: `avatar-${this._id}.png`, buffer: toPng(`${this.name || this.email} ${salt}`, 196) };
    this.avatarUrl = await uploadFile(avatar);
    await this.save();
    return this;
  }

  async likePost(post) {
    // Add to liked posts
    this.likedPosts = [...this.likedPosts, post._id];
    await this.save();

    // Add user id to post's liked by
    post.likedBy = [...post.likedBy, this._id];
    await post.save();

    return this;
  }

  async unlikePost(post) {
    // Remove from liked posts
    const postIdStr = post._id.toString();
    this.likedPosts = this.likedPosts.filter((currentPostId) => currentPostId.toString() !== postIdStr);
    await this.save();

    // Remove user id from post's liked by
    const userIdStr = this._id.toString();
    post.likedBy = post.likedBy.filter((currentUserId) => currentUserId.toString() !== userIdStr);
    await post.save();

    return this;
  }

  async addAuthToken(authToken) {
    this.tokens = [...this.tokens, authToken];
    await this.save();
  }

  async removeAuthToken(authToken) {
    this.tokens = this.tokens.filter((t) => t !== authToken);
    await this.save();
  }

  async createAndSaveAuthToken() {
    const authToken = getToken({ id: this._id });
    if (!authToken) {
      throw new Error("Failed to generate authentication token.");
    }

    await this.addAuthToken(authToken);
    return authToken;
  }

  async generateConfirmationToken() {
    const confirmationToken = getToken({ id: this._id });
    if (!confirmationToken) {
      throw new Error("Failed to generate confirmation token");
    }

    this.otp = generateOtpToken();
    this.confirmationToken = confirmationToken;
    return await this.save();
  }

  getOtp() {
    if (this.otp) {
      const { otp, exp } = decodeToken(this.otp);
      if (getTimeToLive(exp) > 0 && otp) {
        return otp;
      }
    }

    return null;
  }

  getConfirmationUrl() {
    if (this.confirmationToken) {
      return new URL(`/auth/confirm/${this.confirmationToken}`, process.env.APP_BASE_URL).href;
    }
  }

  async sendConfirmationEmail() {
    const confirmationEmailParams = getAccountConfirmationEmail(this.name, this.getConfirmationUrl(), this.getOtp(), 15);
    await sendEmail({ ...confirmationEmailParams, to: this.email });
  }

  hasValidConfirmationToken() {
    if (this.confirmationToken) {
      const { id, exp } = decodeToken(this.confirmationToken);

      // If the token exists and expiring in another hour or later, no need to generate another token
      if (id === this._id.toString() && getTimeToLive(exp) > 3600) {
        return true;
      }
    }

    return false;
  }

  async confirm() {
    if (!this.confirmed || this.confirmationToken) {
      this.confirmed = true;
      this.otp = "";
      this.confirmationToken = "";
      await this.save();
    }

    return this;
  }

  static async findUserByConfirmationToken(token) {
    const { id, exp } = decodeToken(token);

    if (!id || getTimeToLive(exp) < 0) {
      throw new Error(`Invalid or expired token. Please request another confirmation email.`);
    }

    const user = await User.findById(id);
    // If the user is already confirmed, we don't need to do anything
    if (user && user.confirmed) {
      return user;
    }

    if (!user || user.confirmationToken !== token) {
      throw new Error("Invalid confirmation token.");
    }

    return user;
  }

  static async confirmUserWithConfirmationToken(token) {
    const user = await User.findUserByConfirmationToken(token);
    await user.confirm();
    return user;
  }

  static async confirmUserWithOtp(email, otp) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("User not found.");
    }

    // If the user is already confirmed, we don't need to do anything
    if (user && user.confirmed) {
      return user;
    }

    const storedOtp = this.getOtp();
    if (!storedOtp || storedOtp !== otp.trim()) {
      throw new Error("Invalid OTP");
    }

    await user.confirm();
    return user;
  }

  static async validateAuthToken(token) {
    const { id, exp } = decodeToken(token);
    if (!id || getTimeToLive(exp) < 0) {
      throw new Error(`Invalid or expired token.`);
    }

    const user = await User.findById(id);
    if (!user) {
      throw new Error("Could not find user.");
    }

    if (!user.tokens.includes(token)) {
      throw new Error("Invalid authorization token.");
    }

    return user;
  }
}

userSchema.loadClass(UserClass);

export const User = model("User", userSchema);
