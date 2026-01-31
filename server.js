const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.set("trust proxy", true);
app.use(express.static("public"));

app.get("/log", async (req, res) => {
  const ip = req.ip;
  const ua = req.headers["user-agent"];
  const time = new Date().toLocaleString("pt-BR");

  try {
    await fetch(process.env.DISCORD_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "IP Logger",
        embeds: [
          {
            title: "📡 Nova visita",
            color: 16711680,
            fields: [
              { name: "🌐 IP", value: ip, inline: false },
              { name: "🕒 Horário", value: time, inline: false },
              { name: "💻 Navegador", value: ua.slice(0, 1000), inline: false }
            ]
          }
        ]
      })
    });
  } catch (err) {
    console.error("Erro ao enviar para o Discord:", err);
  }

  res.sendStatus(204);
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
