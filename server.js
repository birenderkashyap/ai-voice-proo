import express from "express";
import fs from "fs";
import textToSpeech from "@google-cloud/text-to-speech";

const app = express();
app.use(express.json());
app.use(express.static("public"));

const client = new textToSpeech.TextToSpeechClient({
  credentials: JSON.parse(process.env.GOOGLE_KEY)
});

app.post("/speak", async (req, res) => {
  try {
    const { text, language, gender, speed } = req.body;

    const request = {
      input: { text },
      voice: {
        languageCode: language || "en-US",
        ssmlGender: gender || "FEMALE"
      },
      audioConfig: {
        audioEncoding: "MP3",
        speakingRate: parseFloat(speed) || 1
      }
    };

    const [response] = await client.synthesizeSpeech(request);

    res.set({
      "Content-Type": "audio/mpeg",
      "Content-Disposition": "attachment; filename=voice.mp3"
    });

    res.send(response.audioContent);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error generating speech");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running"));