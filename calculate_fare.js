const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const googleMapsApiKey = 'AIzaSyBpjRnJJrN9VG61KGdfoURGpAOoikWohEk';

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serves static files like HTML, CSS, and JS

// Google Maps Distance Matrix API route for fare calculation
app.post('/calculate-fare', async (req, res) => {
    const { pickup, drop } = req.body;

    if (!pickup || !drop) {
        return res.status(400).json({ message: 'Please provide both pickup and drop locations.' });
    }

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(pickup)}&destinations=${encodeURIComponent(drop)}&mode=driving&key=${googleMapsApiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.status !== 'OK') {
            return res.status(400).json({ message: 'Failed to get distance from Google Maps API.' });
        }

        const distance = data.rows[0].elements[0].distance.value; // Distance in meters
        const fareRate = 10; // Example fare rate per kilometer
        const fare = (distance / 1000) * fareRate; // Convert to kilometers and calculate fare

        res.status(200).json({
            distance: (distance / 1000).toFixed(2),
            fare: fare.toFixed(2)
        });
    } catch (error) {
        console.error('Error calculating fare:', error);
        res.status(500).json({ message: 'An error occurred while calculating the fare.' });
    }
});

// Serve the frontend HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
