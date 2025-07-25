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
    console.log("Datos recibidos del frontend:", req.body); // ← Agrega esto
    
    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_API_KEY}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      },
      body: JSON.stringify(req.body)
    });

    console.log("Respuesta de Notion:", await response.text()); // ← Agrega esto

    if (!response.ok) throw new Error("Error al enviar a Notion");
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error en el backend:", error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
