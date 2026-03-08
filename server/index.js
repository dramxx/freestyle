import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Store sessions in memory (in production, use a database)
const sessionStore = new Map();

// Session API endpoints
app.get('/api/sessions/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const session = sessionStore.get(sessionId);

  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  res.json(session);
});

app.post('/api/sessions/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const sessionData = req.body;

  // Store or update session
  sessionStore.set(sessionId, {
    ...sessionData,
    id: sessionId,
    lastUpdated: new Date().toISOString()
  });

  console.log('Session saved:', sessionId);
  res.json({ success: true, id: sessionId });
});

app.delete('/api/sessions/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  sessionStore.delete(sessionId);
  res.json({ success: true });
});

// Get all sessions (for debugging)
app.get('/api/sessions', (req, res) => {
  const sessions = Array.from(sessionStore.entries()).map(([id, data]) => ({ id, ...data }));
  res.json(sessions);
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join session
  socket.on('join-session', (data) => {
    const { sessionId, userName } = data;

    // Create session if it doesn't exist
    if (!sessions.has(sessionId)) {
      sessions.set(sessionId, {
        id: sessionId,
        users: [],
        files: [],
        createdAt: new Date()
      });
    }

    // Add user to session
    const session = sessions.get(sessionId);
    const user = {
      id: socket.id,
      name: userName,
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
      socketId: socket.id
    };

    session.users.push(user);
    users.set(socket.id, { user, sessionId });

    socket.join(sessionId);

    // Notify others in the session
    socket.to(sessionId).emit('user-joined', user);

    // Send current session data to the new user including files
    socket.emit('session-data', session);

    // Send current file contents to the new user with sync event
    socket.emit('file-sync', session.files);
  });

  // Handle code changes
  socket.on('code-change', (data) => {
    const { fileId, content, cursor } = data;
    const userSession = users.get(socket.id);

    if (userSession) {
      const { sessionId } = userSession;
      const session = sessions.get(sessionId);

      // Update file content in session
      const file = session.files.find(f => f.id === fileId);
      if (file) {
        file.content = content;
      }

      // Broadcast to other users in the session
      socket.to(sessionId).emit('code-change', {
        fileId,
        content,
        cursor,
        userId: socket.id
      });
    }
  });

  // Handle cursor movements
  socket.on('cursor-move', (data) => {
    const { fileId, position } = data;
    const userSession = users.get(socket.id);

    if (userSession) {
      const { sessionId } = userSession;

      socket.to(sessionId).emit('cursor-move', {
        fileId,
        position,
        userId: socket.id
      });
    }
  });

  // Handle file operations
  socket.on('file-created', (data) => {
    const { file } = data;
    const userSession = users.get(socket.id);

    if (userSession) {
      const { sessionId } = userSession;
      const session = sessions.get(sessionId);

      // Check if file already exists in session
      const existingFile = session.files.find(f => f.id === file.id);
      if (!existingFile) {
        session.files.push(file);
      } else {
        // Update existing file content
        existingFile.content = file.content;
      }

      socket.to(sessionId).emit('file-created', file);
    }
  });

  socket.on('file-deleted', (data) => {
    const { fileId } = data;
    const userSession = users.get(socket.id);

    if (userSession) {
      const { sessionId } = userSession;
      const session = sessions.get(sessionId);

      session.files = session.files.filter(f => f.id !== fileId);

      socket.to(sessionId).emit('file-deleted', fileId);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);

    const userSession = users.get(socket.id);
    if (userSession) {
      const { user, sessionId } = userSession;
      const session = sessions.get(sessionId);

      // Remove user from session
      session.users = session.users.filter(u => u.id !== socket.id);

      // Notify others
      socket.to(sessionId).emit('user-left', user);

      // Clean up
      users.delete(socket.id);

      // Remove session if empty
      if (session.users.length === 0) {
        sessions.delete(sessionId);
      }
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', sessions: sessions.size });
});

// Endpoint to broadcast initial file to session
app.post('/broadcast-file', (req, res) => {
  const { sessionId, file } = req.body;

  if (sessions.has(sessionId)) {
    const session = sessions.get(sessionId);

    // Add file to session if not exists
    const existingFile = session.files.find(f => f.id === file.id);
    if (!existingFile) {
      session.files.push(file);
    } else {
      existingFile.content = file.content;
    }

    // Broadcast to all users in session
    io.to(sessionId).emit('file-created', file);

    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Session not found' });
  }
});

const PORT = process.env.PORT || 3002;

server.listen(PORT, () => {
  console.log(`CodeCollab server running on port ${PORT}`);
});
