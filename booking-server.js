const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

// Endpoint to receive booking data
app.post('/api/book', (req, res) => {
  // Save booking data (for now, just log it)
  console.log(req.body);
  res.json({ message: 'Booking received!' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
