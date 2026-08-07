const ytch = require('yt-channel-info');

const channelId = '@MagicStudyGarden';

async function scrape() {
  try {
    const payload = {
      channelId: channelId,
    };

    console.log("Fetching channel info...");
    const channelInfo = await ytch.getChannelInfo(payload);
    console.log("Channel Name:", channelInfo.author);
    
    console.log("Fetching playlists...");
    let playlists = [];
    try {
        const playlistsResponse = await ytch.getChannelPlaylistInfo(payload);
        playlists = playlistsResponse.items || [];
    } catch (e) {
        console.log("No playlists found or error:", e.message);
    }
    
    if (playlists.length > 0) {
        for (const playlist of playlists) {
            console.log(`\nPlaylist: ${playlist.title} (ID: ${playlist.playlistId})`);
            try {
                const videosResponse = await ytch.getPlaylistVideos({playlistId: playlist.playlistId});
                if (videosResponse.items) {
                    for (const video of videosResponse.items) {
                        console.log(` - ${video.title} (https://youtube.com/watch?v=${video.videoId})`);
                    }
                }
            } catch (err) {
                console.log(` Error fetching videos for playlist ${playlist.title}: ${err.message}`);
            }
        }
    } else {
        console.log("Fetching all videos instead...");
        try {
            const videosResponse = await ytch.getChannelVideos(payload);
            const videos = videosResponse.items || [];
            for (const video of videos) {
                console.log(` - ${video.title} (https://youtube.com/watch?v=${video.videoId})`);
            }
        } catch(e) {
             console.log("Error fetching videos:", e.message);
        }
    }
  } catch (err) {
    console.error(err);
  }
}

scrape();
