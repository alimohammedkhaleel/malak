const fs = require('fs');
const https = require('https');

async function downloadSong() {
    const fetch = (await import('node-fetch')).default;
    const url = "https://youtube.com/watch?v=HERNMq4wPm4";
    
    try {
        const response = await fetch("https://api.cobalt.tools/api/json", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                url: url,
                isAudioOnly: true,
                aFormat: "mp3"
            })
        });
        
        const data = await response.json();
        console.log(data);
        
        if (data.status === "redirect" || data.status === "stream") {
            const streamUrl = data.url;
            console.log("Downloading from", streamUrl);
            
            https.get(streamUrl, (res) => {
                const writeStream = fs.createWriteStream('batal.mp3');
                res.pipe(writeStream);
                writeStream.on('finish', () => {
                    console.log('Download complete using cobalt');
                });
            });
        }
    } catch (e) {
        console.error(e);
    }
}

downloadSong();
