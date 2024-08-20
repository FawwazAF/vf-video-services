// app.js
const express = require('express');
const path = require('path');
const videoRoutes = require('./routes/video');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve the HTML file when accessing the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/index.html'));
});

app.use('/video', videoRoutes);

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
