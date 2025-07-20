// server.js
import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 8081;
const fareRate = 10; // ₹10 per km
const googleApiKey = 'AIzaSyBpjRnJJrN9VG61KGdfoURGpAOoikWohEk';

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// Haversine formula implementation
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * 
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Endpoints
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login (2).html'));
});

app.post('/calculate-fare', async (req, res) => {
  try {
    const { pickLocation, dropLocation } = req.body;
    
    if (!pickLocation || !dropLocation) {
      return res.status(400).json({ error: 'Missing locations' });
    }

    // Fetch coordinates from Google Maps Geocoding API
    const [pickResponse, dropResponse] = await Promise.all([
      fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(pickLocation)}&key=${googleApiKey}`),
      fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(dropLocation)}&key=${googleApiKey}`)
    ]);

    const [pickData, dropData] = await Promise.all([
      pickResponse.json(),
      dropResponse.json()
    ]);

    if (pickData.status !== 'OK' || dropData.status !== 'OK') {
      return res.status(400).json({ error: 'Invalid location data' });
    }

    const pickCoords = pickData.results[0].geometry.location;
    const dropCoords = dropData.results[0].geometry.location;

    const distance = calculateDistance(
      pickCoords.lat,
      pickCoords.lng,
      dropCoords.lat,
      dropCoords.lng
    );

    const fare = distance * fareRate;
    
    res.json({ 
      distance: parseFloat(distance.toFixed(2)),
      fare: parseFloat(fare.toFixed(2))
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error calculating fare' });
  }
});

app.post('/map-route', async (req, res) => {
  try {
    const { pickLocation, dropLocation } = req.body;
    
    const [pickResponse, dropResponse] = await Promise.all([
      fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(pickLocation)}&key=${googleApiKey}`),
      fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(dropLocation)}&key=${googleApiKey}`)
    ]);

    const [pickData, dropData] = await Promise.all([
      pickResponse.json(),
      dropResponse.json()
    ]);

    if (pickData.status !== 'OK' || dropData.status !== 'OK') {
      return res.status(400).json({ error: 'Invalid location data' });
    }

    const pickCoords = pickData.results[0].geometry.location;
    const dropCoords = dropData.results[0].geometry.location;

    res.json({ pickCoords, dropCoords });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error fetching location data' });
  }
});

app.listen(port, () => {
  console.log(`SheCabs Backend is running on http://localhost:${port}`);
});