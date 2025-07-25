require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

// Ruta segura para Notion API
app.post('/api/save-attendance', async (req, res) => {
  try {
    console.log("Datos recibidos:", req.body); // ← Para debuggear
    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_API_KEY}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    console.log("Respuesta de Notion:", data); // ← Para debuggear
    res.status(response.status).json(data);
  } catch (error) {
    console.error("Error completo:", error); // ← Muestra detalles
    res.status(500).json({ error: "Error interno" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
