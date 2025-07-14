// app.js
const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const app = express();

// Modular route imports
const dashboardRouter = require('./routes/dashboard');
const projectsRouter = require('./routes/projects');
const operatorsRouter = require('./routes/operators');
const profileRouter = require('./routes/profile');
const pixeltalkRouter = require('./routes/pixeltalk');
const scriptRouter = require('./routes/script');
// Example: Add more routes here for new features
// const resilienceRouter = require('./routes/resilience');

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: 'your-session-secret', // Use environment variable in production!
  resave: false,
  saveUninitialized: true,
}));
app.use(express.static(path.join(__dirname, 'public')));

// CORS headers for API and sockets
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Update for production
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Route mapping
app.use('/', dashboardRouter);
app.use('/dashboard', dashboardRouter);
app.use('/projects', projectsRouter);
app.use('/operators', operatorsRouter);
app.use('/profile', profileRouter);
app.use('/pixeltalk', pixeltalkRouter);
app.use('/script', scriptRouter);
// app.use('/resilience', resilienceRouter); // Example new feature

// Error Handling
app.use((req, res, next) => {
  res.status(404).render('error', { message: 'Page Not Found' });
});

// Socket.io integration
const server = http.createServer(app);
const io = socketio(server);

// Socket.io events
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Chat feature
  socket.on('chatMessage', (msg) => {
    io.emit('chatMessage', msg); // Broadcast to all clients
  });

  // Resilience feature: broadcast status updates (example)
  socket.on('statusUpdate', (data) => {
    io.emit('statusUpdate', data); // All clients receive update
  });

  // Extend with more events as needed
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Server Listen
const PORT = process.env.PORT || 3302;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Export for testing or modular usage
module.exports = app;
