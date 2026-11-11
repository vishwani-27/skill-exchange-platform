const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'skill_exchange.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // 1. Profiles Table
    db.run(`
        CREATE TABLE IF NOT EXISTS profiles (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            occupation TEXT NOT NULL,
            category TEXT NOT NULL,
            skillsOffered TEXT NOT NULL,
            skillsWanted TEXT NOT NULL,
            bio TEXT,
            avatar TEXT
        )
    `);

    // 2. Exchange Requests Table
    db.run(`
        CREATE TABLE IF NOT EXISTS requests (
            id TEXT PRIMARY KEY,
            fromId TEXT NOT NULL,
            toId TEXT NOT NULL,
            offeredSkill TEXT NOT NULL,
            wantedSkill TEXT NOT NULL,
            note TEXT,
            status TEXT DEFAULT 'pending'
        )
    `);

    // 3. Messages Table
    db.run(`
        CREATE TABLE IF NOT EXISTS messages (
            id TEXT PRIMARY KEY,
            fromId TEXT NOT NULL,
            toId TEXT NOT NULL,
            text TEXT NOT NULL,
            time TEXT NOT NULL
        )
    `);

    // Seed default profiles if table is empty
    db.get(`SELECT COUNT(*) as count FROM profiles`, (err, row) => {
        if (row && row.count === 0) {
            const seedProfiles = [
                ['usr_1', 'Aarav Mehta', 'aarav@example.com', 'Full Stack Developer', 'Tech', JSON.stringify(['Python', 'Node.js', 'Web Architecture']), JSON.stringify(['UI/UX Design', 'Figma']), 'Software engineer with 4 years of experience. Looking to polish design skills in exchange for backend coding lessons.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav'],
                ['usr_2', 'Ananya Roy', 'ananya@example.com', 'Product Designer', 'Design', JSON.stringify(['UI/UX Design', 'Figma', 'Prototyping']), JSON.stringify(['React', 'JavaScript']), 'Passionate design lead. Happy to mentor interactive prototyping & UI fundamentals in return for web dev lessons.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya'],
                ['usr_3', 'Rohan Verma', 'rohan@example.com', 'Digital Marketer', 'Business', JSON.stringify(['SEO', 'Content Strategy', 'Google Ads']), JSON.stringify(['Graphic Design', 'Video Editing']), 'Growth hacker. I can help scale your project traffic if you can teach me video content creation.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan'],
                ['usr_4', 'Sanya Kapoor', 'sanya@example.com', 'Language Specialist', 'Languages', JSON.stringify(['Spanish', 'French', 'Public Speaking']), JSON.stringify(['Python', 'Data Analytics']), 'Polyglot & corporate trainer. Willing to conduct conversational language sessions for data science tutorials.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sanya']
            ];

            const stmt = db.prepare(`INSERT INTO profiles VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
            seedProfiles.forEach(profile => stmt.run(profile));
            stmt.finalize();

            // Seed initial exchange request
            db.run(`INSERT INTO requests VALUES ('req_1', 'usr_2', 'usr_1', 'Figma', 'Python', 'Hey Aarav! I saw you need Figma help. Let us trade Python for Figma!', 'accepted')`);

            // Seed initial messages
            db.run(`INSERT INTO messages VALUES ('msg_1', 'usr_2', 'usr_1', 'Hi Aarav, excited to start our skill exchange!', '10:30 AM')`);
            db.run(`INSERT INTO messages VALUES ('msg_2', 'usr_1', 'usr_2', 'Hi Ananya! Same here. When are you free for the first session?', '10:32 AM')`);
        }
    });
});

module.exports = db;