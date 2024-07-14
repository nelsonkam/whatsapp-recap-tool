import express from 'express';
import { generateRecap } from './recap';
import NodeCache from 'node-cache';
import path from 'path';

const app = express();
const cache = new NodeCache({ stdTTL: 86400 }); // Cache for 24 hours

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/generate-recap', async (req, res) => {
  const dateString = req.query.date as string;
  if (!dateString) {
    return res.status(400).json({ error: 'Date is required' });
  }

  const date = new Date(dateString);
  const cacheKey = `recap_${dateString}`;

  try {
    let recap = cache.get(cacheKey);
    if (recap === undefined) {
      recap = await generateRecap(date);
      cache.set(cacheKey, recap);
    }
    res.json({ recap });
  } catch (error) {
    console.error('Error generating recap:', error);
    res.status(500).json({ error: 'Failed to generate recap' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
