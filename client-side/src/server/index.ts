import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../../src/client/public')));

app.get('/api/status', (req, res) => {
    // Placeholder for device status
    res.json({ battery: 100, soilMoisture: 40, lastWatering: '2024-07-31T00:00:00Z' });
});

app.post('/api/water', (req, res) => {
    // Placeholder for watering action
    res.json({ success: true });
});

app.post('/api/settings', (req, res) => {
    const settings = req.body;
    fs.writeFileSync(path.join(__dirname, 'settings.json'), JSON.stringify(settings));
    res.json({ success: true });
});

app.get('/api/settings', (req, res) => {
    const settings = JSON.parse(fs.readFileSync(path.join(__dirname, 'settings.json'), 'utf-8'));
    res.json(settings);
});

// Serve the client application
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../src/client/public/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
