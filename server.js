const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- PROFILES API ---

// Get all profiles
app.get('/api/profiles', (req, res) => {
    db.all(`SELECT * FROM profiles`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const profiles = rows.map(r => ({
            ...r,
            skillsOffered: JSON.parse(r.skillsOffered),
            skillsWanted: JSON.parse(r.skillsWanted)
        }));
        res.json(profiles);
    });
});

// Create profile
app.post('/api/profiles', (req, res) => {
    const { name, email, occupation, category, skillsOffered, skillsWanted, bio } = req.body;
    const id = 'usr_' + Date.now();
    const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;

    db.run(
        `INSERT INTO profiles (id, name, email, occupation, category, skillsOffered, skillsWanted, bio, avatar) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, name, email, occupation, category, JSON.stringify(skillsOffered), JSON.stringify(skillsWanted), bio, avatar],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id, name, email, occupation, category, skillsOffered, skillsWanted, bio, avatar });
        }
    );
});

// Update profile
app.put('/api/profiles/:id', (req, res) => {
    const { name, email, occupation, category, skillsOffered, skillsWanted, bio } = req.body;
    const { id } = req.params;

    db.run(
        `UPDATE profiles SET name = ?, email = ?, occupation = ?, category = ?, skillsOffered = ?, skillsWanted = ?, bio = ? WHERE id = ?`,
        [name, email, occupation, category, JSON.stringify(skillsOffered), JSON.stringify(skillsWanted), bio, id],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        }
    );
});

// --- REQUESTS API ---

// Get all exchange requests
app.get('/api/requests', (req, res) => {
    db.all(`SELECT * FROM requests`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Create new exchange request
app.post('/api/requests', (req, res) => {
    const { fromId, toId, offeredSkill, wantedSkill, note } = req.body;
    const id = 'req_' + Date.now();

    db.run(
        `INSERT INTO requests (id, fromId, toId, offeredSkill, wantedSkill, note, status) VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
        [id, fromId, toId, offeredSkill, wantedSkill, note],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id, fromId, toId, offeredSkill, wantedSkill, note, status: 'pending' });
        }
    );
});

// Update request status (accept / decline)
app.patch('/api/requests/:id', (req, res) => {
    const { status } = req.body;
    const { id } = req.params;

    db.run(`UPDATE requests SET status = ? WHERE id = ?`, [status, id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// --- MESSAGES API ---

// Get all messages
app.get('/api/messages', (req, res) => {
    db.all(`SELECT * FROM messages`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Send new message
app.post('/api/messages', (req, res) => {
    const { fromId, toId, text } = req.body;
    const id = 'msg_' + Date.now();
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    db.run(
        `INSERT INTO messages (id, fromId, toId, text, time) VALUES (?, ?, ?, ?, ?)`,
        [id, fromId, toId, text, time],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id, fromId, toId, text, time });
        }
    );
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});