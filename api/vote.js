import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const dbPath = path.resolve(process.cwd(), 'db.json');
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

  const { questionId, option } = req.body;
  let foundQuestion;
  let category;
  for (const cat of Object.keys(db.questions)) {
    foundQuestion = db.questions[cat].find(q => q.id === questionId);
    if (foundQuestion) {
      category = cat;
      break;
    }
  }
  if (!foundQuestion) {
    return res.status(404).json({ error: 'Question not found' });
  }

  if (option === 1) {
    foundQuestion.votes1 += 1;
  } else if (option === 2) {
    foundQuestion.votes2 += 1;
  } else {
    return res.status(400).json({ error: 'Invalid option' });
  }

  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  const totalVotes = foundQuestion.votes1 + foundQuestion.votes2;
  const percentage1 = totalVotes ? ((foundQuestion.votes1 / totalVotes) * 100).toFixed(1) : 0;
  const percentage2 = totalVotes ? ((foundQuestion.votes2 / totalVotes) * 100).toFixed(1) : 0;
  res.status(200).json({
    votes1: foundQuestion.votes1,
    votes2: foundQuestion.votes2,
    percentage1,
    percentage2
  });
}