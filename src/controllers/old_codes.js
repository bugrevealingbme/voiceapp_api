/* async function playht () {
    const url = 'https://play.ht/api/v2/tts';
    const requestBody = {
        quality: 'medium',
        output_format: 'mp3',
        speed: 1,
        sample_rate: 24000,
        voice: voiceManifest,
        text: text.trim(),
    };

    const response = await axios.post(url, requestBody, {
        headers: {
            'AUTHORIZATION': 'Bearer fd924f8acba64cd8a7c874b88706b9e8',
            'X-USER-ID': 'WTvk1E2yUzRMCJJEDhbBYrYdVNI3',
            'accept': 'text/event-stream',
            'content-type': 'application/json',
        },
    });

    if (response.status === 200) {
        const lines = response.data.split('\n');

        for (const line of lines) {
            if (line.startsWith('data:')) {
                const newline = line.replace('data:', '');

                try {
                    const result = JSON.parse(newline);


                    if (result.progress === 1) {
                        if (process.env.NODE_ENV === 'development') {
                            //
                        } else {
                            const filePath = await downloadAndCompressMp3(result.url, 'downloaded');

                            await Generated.create({
                                voice_id: selectedId,
                                text: text.trim(),
                                url: filePath,
                            });
                        }

                        return res.status(200).send(result);
                    }


                } catch (error) {
                    console.log(response.data);
                }
            }
        }
    } else {
        log(`Error: ${response.data}`);

        return res.status(401).send({
            message: 'error from api',
        });
    }
} */