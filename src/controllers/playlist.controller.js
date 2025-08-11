import { db } from "../libs/db.js";
export const createPlaylist = async (req, res) => {
  try {
    const { name, description } = req.body;

    const userId = req.user.id;
    const playlistExists = await db.playlist.findFirst({
      where: {
        name,
        userId,
      },
    });

    if (playlistExists) {
      return res.status(400).json({
        success: false,
        message: "Playlist with this name already exists",
      });
    }

    const playlist = await db.playlist.create({
      data: {
        name,
        description,
        userId,
      },
    });

    return res.status(201).json({
      data: playlist,
      success: true,
      message: "Playlist created successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      error: "Error While Creating Playlist",
    });
  }
};