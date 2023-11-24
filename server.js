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

app.use(cors())
app.use(express.json());

app.get('/', (req, res)=> { res.send('It works!') })
app.post('/signin', signin.handleSignin(supabase, bcrypt))
app.post('/register', (req, res) => { register.handleRegister(req, res, supabase, bcrypt) })
app.get('/profile/:id', (req, res) => { profile.handleProfileGet(req, res, supabase)})
app.put('/image', (req, res) => { image.handleImage(req, res, supabase)})
app.post('/imageurl', (req, res) => { image.handleApiCall(req, res)})

// Use an environment variable or the Vercel provided variable to set the port
const port = process.env.PORT || 3000;

// Use the port variable in your app.listen method
app.listen(port, ()=> {
  console.log(`app is running on port ${port}`);
})
