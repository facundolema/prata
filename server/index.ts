const express = require('express')
const sqlite3 = require('sqlite3').verbose()
const cors = require('cors')
const passport = require('passport')
const session = require('express-session')
const bodyParser = require('body-parser')
const LocalStrategy = require('passport-local').Strategy
const WebSocket = require('ws')

const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error(err.message)
  }
  console.log('Connected to the database.')
})

const app = express();
const wss = new WebSocket.Server({ noServer: true });


passport.use(
  new LocalStrategy((username, password, done) => {
    const user = users.find((u) => u.username === username && u.password === password);
    return done(null, user);
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  const user = users.find((u) => u.id === id);
  done(null, user);
});

// Express middlewares
app.use(express.json());
app.use(session({ secret: 'your-secret-key', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json())
app.use(cors({
  origin: 'http://0.0.0.0:8000',
  credentials: true
}))

app.post('/login', passport.authenticate('local'), (req, res) => {
  res.json({ message: 'Login successful!', user: req.user });
});

// Protected route (authentication required)
app.get('/protected', (req, res) => {
  console.log("received request")
  if (req.isAuthenticated()) {
    res.json({ message: 'Protected route accessed!', user: req.user });
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
});

app.get('/', (req, res) => {
  res.json(messages)
})

app.post('/', (req, res) => {
  messages.push(req.body)
  res.json(messages)
})

// WebSocket server handling
wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    console.log(`Received message: ${message}`);
    ws.send(`Server received: ${message}`);
  });
});

// Create an HTTP server using Express
const server = app.listen(8080, () => {
  console.log('Express server listening on port 8080');
});

// Upgrade HTTP server to WebSocket server on incoming WebSocket requests
server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

app.get('/:username', (req, res) => {
  let n = req.params.username;
  let sql = `SELECT * FROM message WHERE receiver = ? OR sender = ?`;
  db.all(sql, [n, n], (err, rows) => {
  if (err) {
    res.json({ ok: false })
    throw err;
  }
  res.json(rows)
  })
})

app.get('/:username/:to:/:message', (req, res) => {
  const sql = `INSERT INTO message(content, sender, receiver) VALUES(?, ?, ?)`;
  db.run(sql, [req.params.message, req.params.username, req.params.to], function(err) {
    if (err) {
      res.json({ ok: false })
      return console.log(err.message)
    }
    console.log(`A row has been inserted with rowid ${this.lastID}`);
  })
  res.json({ ok: true })
})

app.post('/', (req, res) => {
  const sql = `INSERT INTO message(content, sender, receiver) VALUES(?, ?, ?)`;
  db.run(sql, [req.body.message, req.body.sender, req.body.receiver], function(err) {
    if (err) {
      res.json({ ok: false })
      return console.log(err.message)
    }
    console.log(`A row has been inserted with rowid ${this.lastID}`);
  })
  res.json({ ok: true })
})

app.get('/', (req, res) => {
  res.json({ ok: true })
})

// Sample user data (you should use a database in a real app)
const users = [
  { id: 1, username: 'user1', password: 'password1' },
  { id: 2, username: 'user2', password: 'password2' },
];

let messages = [
  {
    id: '1',
    content: 'hello patalino',
    type: 'text',
    from: 'catalettieri',
    recipients: ['rodlema'],
    status: 'sent',
    timestamp: '2021-10-10T10:20:10.000Z',
  },
  {
    id: '2',
    content: 'hello patalina',
    type: 'text',
    from: 'rodlema',
    recipients: ['catalettieri'],
    status: 'sent',
    timestamp: '2021-10-10T15:34:10.000Z',
  },
  {
    id: '3',
    content: 'hello patalino',
    type: 'text',
    from: 'catalettieri',
    recipients: ['catalettieri'],
    status: 'sent',
    timestamp: '2021-10-10T16:01:10.000Z',
  },
  {
    id: '4',
    content: 'hello patalino',
    type: 'text',
    from: 'catalettieri',
    recipients: ['catalettieri'],
    status: 'sent',
    timestamp: '2021-10-10T16:01:10.000Z',
  },
]