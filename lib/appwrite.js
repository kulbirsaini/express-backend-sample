import { Account, Avatars, Client, Databases, ID, Query, Storage } from "node-appwrite";
import { configDotenv } from "dotenv";
import { InputFile } from "node-appwrite/file";
configDotenv({ path: [".env.local", ".env"] });

export const appwriteConfig = {
  apiKey: process.env.APPWRITE_API_KEY,
  baseUrl: process.env.APPWRITE_BASE_URL,
  projectId: process.env.APPWRITE_PROJECT_ID,
  databaseId: process.env.APPWRITE_DATABASE_ID,
  userCollectionId: process.env.APPWRITE_USER_COLLECTION_ID,
  videoCollectionId: process.env.APPWRITE_VIDEO_COLLECTION_ID,
  storageId: process.env.APPWRITE_STORAGE_ID,
};

// Init your React Native SDK
const client = new Client()
  .setEndpoint(appwriteConfig.baseUrl) // Your Appwrite Endpoint
  .setProject(appwriteConfig.projectId) // Your project ID
  .setKey(appwriteConfig.apiKey);

export const account = new Account(client);
export const avatars = new Avatars(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export const getUserByAccountId = async (accountId) => {
  if (!accountId) {
    return;
  }

  const currentUser = await databases.listDocuments(appwriteConfig.databaseId, appwriteConfig.userCollectionId, [
    Query.equal("accountId", accountId),
  ]);

  if (!currentUser || !currentUser.documents || !currentUser.documents.length || !currentUser.documents[0].$id) {
    return;
  }

  return currentUser.documents[0];
};

export const getUserByUserId = async (userId) => {
  if (!userId) {
    return;
  }

  const user = await databases.getDocument(appwriteConfig.databaseId, appwriteConfig.userCollectionId, userId);
  if (!user || !user.$id) {
    return;
  }

  return user;
};

export const getPostById = async (id) => {
  if (!id) {
    return;
  }

  const post = await databases.getDocument(appwriteConfig.databaseId, appwriteConfig.videoCollectionId, id);

  if (!post || !post.$id) {
    return;
  }

  return post;
};

const getFilePreview = async (fileId, type) => {
  let fileUrl;

  if (type === "video") {
    fileUrl = `${appwriteConfig.baseUrl}/storage/buckets/${appwriteConfig.storageId}/files/${fileId}/view?project=${appwriteConfig.projectId}`;
  } else if (type === "image") {
    fileUrl = `${appwriteConfig.baseUrl}/storage/buckets/${appwriteConfig.storageId}/files/${fileId}/preview?project=${appwriteConfig.projectId}&width=2000&height=2000&gravity=top&quality=100`;
  } else {
    throw new Error(`Invalid file type ${type}`);
  }

  if (!fileUrl) {
    throw new Error(`Could not get file url for ${fileId} ${type}`);
  }

  return fileUrl;
};

const uploadFile = async (file, type) => {
  if (!file || !type) {
    return;
  }

  const result = await storage.createFile(
    appwriteConfig.storageId,
    ID.unique(),
    InputFile.fromBuffer(file.buffer, file.originalname)
  );
  return getFilePreview(result.$id, type);
};

export const createNewPost = async ({ title, prompt, video, thumbnail, userId }) => {
  const [videoUrl, thumbnailUrl] = await Promise.all([uploadFile(video, "video"), uploadFile(thumbnail, "image")]);

  return await databases.createDocument(appwriteConfig.databaseId, appwriteConfig.videoCollectionId, ID.unique(), {
    title,
    prompt,
    video: videoUrl,
    thumbnail: thumbnailUrl,
    creator: userId,
  });
};

// Post seeding
const videos = [
  {
    title: "Get inspired to code",
    thumbnail: "https://i.ibb.co/tJBcX20/Appwrite-video.png",
    video: "https://player.vimeo.com/video/949579770?h=897cd5e781",
    prompt: "Create a motivating AI driven video aimed at inspiring coding enthusiasts with simple language",
  },
  {
    title: "How AI Shapes Coding Future",
    thumbnail: "https://i.ibb.co/Xkgk7DY/Video.png",
    video: "https://player.vimeo.com/video/949581999?h=4672125b31",
    prompt: "Picture the future of coding with AI. Show AR VR",
  },
  {
    title: "Dalmatian's journey through Italy",
    thumbnail: "https://i.ibb.co/CBYzyKh/Video-1.png",
    video: "https://player.vimeo.com/video/949582778?h=d60220d68d",
    prompt: "Create a heartwarming video following the travels of dalmatian dog exploring beautiful Italy",
  },
  {
    title: "Meet small AI friends",
    thumbnail: "https://i.ibb.co/7XqVPVT/Photo-1677756119517.png",
    video: "https://player.vimeo.com/video/949616422?h=d60220d68d",
    prompt: "Make a video about a small blue AI robot blinking its eyes and looking at the screen",
  },
  {
    title: "Find inspiration in Every Line",
    thumbnail: "https://i.ibb.co/mGfCYJY/Video-2.png",
    video: "https://player.vimeo.com/video/949617485?h=d60220d68d",
    prompt:
      "A buy working on his laptop that sparks excitement for coding, emphasizing the endless possibilities and personal growth it offers",
  },
  {
    title: "Japan's Blossoming temple",
    thumbnail: "https://i.ibb.co/3Y2Nk7q/Bucket-215.png",
    video: "https://player.vimeo.com/video/949618057?h=d60220d68d",
    prompt: "Create a captivating video journey through Japan's Sakura Temple",
  },
  {
    title: "A Glimpse into Tomorrow's VR World",
    thumbnail: "https://i.ibb.co/C5wXXf9/Video-3.png",
    video: "https://player.vimeo.com/video/949620017?h=d60220d68d",
    prompt: "An imaginative video envisioning the future of Virtual Reality",
  },
  {
    title: "A World where Ideas Grow Big",
    thumbnail: "https://i.ibb.co/DzXRfyr/Bucket-59038.png",
    video: "https://player.vimeo.com/video/949620200?h=d60220d68d",
    prompt: "Make a fun video about hackers and all the cool stuff they do with computers",
  },
];

export const populateVideos = async () => {
  console.log("getting user");
  const user = await getCurrentUser();

  try {
    videos.map(async (video) => {
      console.log("adding video", video);
      const result = await databases.createDocument(appwriteConfig.databaseId, appwriteConfig.videoCollectionId, ID.unique(), {
        ...video,
        creator: user.$id,
      });
      console.log(result);
    });
  } catch (error) {
    console.log(error);
  }
};
