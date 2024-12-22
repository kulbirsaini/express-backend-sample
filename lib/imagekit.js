import ImageKit from "imagekit";

const getImagekit = () =>
  new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
  });

export const uploadFile = async (file) => {
  const imagekit = getImagekit();
  const response = await imagekit.upload({
    file: file.buffer,
    fileName: file.originalname,
    tags: [process.env.IMAGEKIT_FILE_TAG],
    isPrivateFile: false,
    folder: process.env.IMAGEKIT_FOLDER ? process.env.IMAGEKIT_FOLDER : undefined,
  });

  return response.url;
};
