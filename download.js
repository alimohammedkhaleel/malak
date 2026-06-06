const ytSearch = require('yt-search');
const ytdl = require('@distube/ytdl-core');
const fs = require('fs');

async function downloadSong() {
    console.log('Searching for song...');
    const r = await ytSearch('جواك بطل احمد مكي');
    const videos = r.videos;
    if (videos.length > 0) {
        const video = videos[0];
        console.log(`Found video: ${video.title}`);
        console.log(`URL: ${video.url}`);
        
        const output = 'batal.mp3';
        const stream = ytdl(video.url, { filter: 'audioonly' });
        
        stream.pipe(fs.createWriteStream(output));
        
        stream.on('end', () => {
            console.log('Download complete!');
        });
        
        stream.on('error', (err) => {
            console.error('Error downloading:', err);
        });
    } else {
        console.log('No video found.');
    }
}

downloadSong();
