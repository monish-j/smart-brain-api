const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const Clarifai = require('clarifai');

const register = require('./controllers/register');
const signin = require('./controllers/signin');
const profile = require('./controllers/profile');
const image = require('./controllers/image');

require('dotenv').config();
const supabaseUrl = 'https://uwesdmrwcmooybaqwxls.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const app = new Clarifai.App({
 apiKey:  '448a0adf3f6548cf9aaa4a9f36b53c3b'
});

const handleApiCall = (req, res) => {
  app.models.predict('face-detection', req.body.input)
    .then(data => {
      res.json(data);
    })
    .catch(err => res.status(400).json('unable to work with API'))
}

const handleImage = async (req, res) => {
  const { id } = req.body;
  let { data, error } = await supabase
    .from('users')
    .select('entries')
    .eq('id', id)
    .single();

  if (error) {
    res.status(400).json('unable to get entries');
  } else {
    data.entries++;
    let { error } = await supabase
      .from('users')
      .update({ entries: data.entries })
      .eq('id', id);

    if (error) {
      res.status(400).json('unable to update entries');
    } else {
      res.json(data.entries);
    }
  }
}

module.exports = {
  handleImage,
  handleApiCall
}
