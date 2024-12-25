export const me = async (req, res, next) => {
  if (req?.currentUser) {
    if (!req.currentUser.confirmed) {
      return res
        .status(423)
        .json({ message: "Email is not confirmed. Please check your email and confirm account before you can login." });
    }

    return res.json({ user: req.currentUser });
  }

  return res.status(401).json({ message: "Unauthorized access." });
};

export const generateAvatar = async (req, res, next) => {
  try {
    const user = await req.currentUser.createAvatar(Math.random());
    return res.json({ message: "Avatar generated successfully.", avatarUrl: user.avatarUrl });
  } catch (error) {
    console.error(`generateAvatar`, error);
    return res.status(500).json({ message: "An error occurred while generating new avatar." });
  }
};
