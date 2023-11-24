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
app.post('/register', (req, res, next) => { register.handleRegister(req, res, supabase, bcrypt).catch(next) });
app.get('/profile/:id', (req, res, next) => { profile.handleProfileGet(req, res, supabase).catch(next)});
app.put('/image', (req, res, next) => { image.handleImage(req, res, supabase).catch(next)});
app.post('/imageurl', (req, res, next) => { image.handleApiCall(req, res).catch(next)});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Use an environment variable or the Vercel provided variable to set the port
const port = process.env.PORT || 3000;

// Use the port variable in your app.listen method
app.listen(port, ()=> {
  console.log(`app is running on port ${port}`);
});
