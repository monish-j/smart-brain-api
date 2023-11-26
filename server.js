const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const register = require('./controllers/register');
const signin = require('./controllers/signin');
const profile = require('./controllers/profile');
const image = require('./controllers/image');

const supabaseUrl = 'https://uwesdmrwcmooybaqwxls.supabase.co';
const supabaseKey = process.env.secret_role; // Use environment variable
const supabase = createClient(supabaseUrl, supabaseKey);

// Function to create policies
async function createPolicies() {
  try {
    await supabase.query(`
      CREATE POLICY "Allow anonymous access" ON users TO anon FOR
      SELECT
        USING (true);

      CREATE POLICY "Allow service access" ON users TO service_role FOR
      SELECT
        USING (true);

      CREATE POLICY "Allow anonymous access" ON login TO anon FOR
      SELECT
        USING (true);

      CREATE POLICY "Allow service access" ON login TO service_role FOR
      SELECT
        USING (true);
    `);

    console.log('Policies created successfully.');
  } catch (error) {
    console.error('Error creating policies:', error.message);
  }
}

const app = express();
const allowedOrigins = [
  'https://smart-brain-alpha.vercel.app',
  'https://smart-brain-jn733zqky-monishs-projects-dc4ad6db.vercel.app',
  'https://smart-brain-git-main-monishs-projects-dc4ad6db.vercel.app'
];

app.use(cors({ origin: allowedOrigins }));
app.use(bodyParser.json()); // Use body-parser middleware

app.get('/', (req, res) => {
  res.send('It works!');
});

// Create policies before starting the server
createPolicies();

app.post('/signin', (req, res, next) => {
  signin.handleSignin(supabase, bcrypt).catch(next);
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

  bcrypt.hash(password, null, null, async function (err, hash) {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'An error occurred while hashing the password' });
    }

    const newUserLogin = {
      hash: hash,
      email: email
    };

    const { data: loginData, error: loginError } = await supabase
      .from('login')
      .insert([newUserLogin]);

    if (loginError) {
      console.error(loginError);
      return res.status(500).json({ error: 'An error occurred while inserting data into login table' });
    }

    const newUser = {
      name: name,
      email: email,
      entries: 0,
      joined: new Date()
    };

    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([newUser]);

    if (userError) {
      console.error(userError);
      await supabase
        .from('login')
        .delete()
        .eq('email', email);
      return res.status(500).json({ error: 'An error occurred while inserting data into users table' });
    }

    return res.status(200).json({ loginData, userData });
  });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`app is running on port ${port}`);
});
