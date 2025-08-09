import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export default function handler(req, res) {
  const dbPath = path.resolve(process.cwd(), 'db.json');
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

  // GET /api/questions veya /api/questions?category=...
  if (req.method === 'GET') {
    const { category } = req.query;
    if (category) {
      if (!db.questions[category]) {
        return res.status(404).json({ error: 'Category not found' });
      }
      return res.status(200).json(db.questions[category]);
    }
    return res.status(200).json(db.questions);
  }

  // POST /api/questions (body: { category, question })
  if (req.method === 'POST') {
    const { category, question } = req.body;
    if (!db.questions[category]) {
      return res.status(404).json({ error: 'Category not found' });
    }
    if (!question.id) question.id = uuidv4();
    question.votes1 = question.votes1 || 0;
    question.votes2 = question.votes2 || 0;
    db.questions[category].push(question);
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    return res.status(200).json({ success: true, question });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}