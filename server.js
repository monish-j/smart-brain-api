const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const signin = require('./controllers/signin');
const profile = require('./controllers/profile');
const image = require('./controllers/image');

const supabaseUrl = 'https://uwesdmrwcmooybaqwxls.supabase.co';
const supabaseKey = process.env.secret_role; // Use environment variable
const supabase = createClient(supabaseUrl, supabaseKey);

const app = express();
const allowedOrigins = [
  'https://smart-brain-alpha.vercel.app',
  'https://smart-brain-jn733zqky-monishs-projects-dc4ad6db.vercel.app',
  'https://smart-brain-git-main-monishs-projects-dc4ad6db.vercel.app'
];

app.use(cors({ origin: allowedOrigins }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('It works!');
});

app.post('/signin', (req, res, next) => {
  signin.handleSignin(supabase).catch(next);
});

app.get('/profile/:id', (req, res, next) => {
  profile.handleProfileGet(req, res, supabase).catch(next);
});

app.put('/image', (req, res, next) => {
  image.handleImage(req, res, supabase).catch(next);
});

app.post('/imageurl', (req, res, next) => {
  image.handleApiCall(req, res).catch(next);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  // Hash password and insert into login table
  // ... (rest of your registration logic)
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`app is running on port ${port}`);
});
