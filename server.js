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
const supabaseKey = process.env.SUPABASE_KEY; // Use environment variable
const supabase = createClient(supabaseUrl, supabaseKey);

const app = express();

app.use(cors());
app.use(bodyParser.json()); // Use body-parser middleware

app.get('/', (req, res)=> { res.send('It works!') });
app.post('/signin', (req, res, next) => { signin.handleSignin(supabase, bcrypt).catch(next) });
app.get('/profile/:id', (req, res, next) => { profile.handleProfileGet(req, res, supabase).catch(next)});
app.put('/image', (req, res, next) => { image.handleImage(req, res, supabase).catch(next)});
app.post('/imageurl', (req, res, next) => { image.handleApiCall(req, res).catch(next)});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.post('/register', async (req, res) => {
  const { name, email, password } = req.body; // extract name, email, and password from request body

  // hash the password before storing it
  bcrypt.hash(password, null, null, async function(err, hash) {
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
      // If inserting data into the users table fails, delete the data from the login table
      await supabase
        .from('login')
        .delete()
        .eq('email', email);
      return res.status(500).json({ error: 'An error occurred while inserting data into users table' });
    }

    return res.status(200).json({ loginData, userData });
  });
});

// Use an environment variable or the Vercel provided variable to set the port
const port = process.env.PORT || 3000;

// Use the port variable in your app.listen method
app.listen(port, ()=> {
  console.log(`app is running on port ${port}`);
});
