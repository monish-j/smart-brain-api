const handleRegister = async (req, res, supabase, bcrypt) => {
  const { name, email, password } = req.body;
  if(!email || !name || !password) {
    return res.status(400).json('incorrect form submission');
  }
  const hash = bcrypt.hashSync(password);
  
  // Insert into 'login' table
  let { data: loginData, error: loginError } = await supabase
    .from('login')
    .insert([{ hash: hash, email: email }])
    .single();

  if (loginError) {
    return res.status(400).json('unable to register');
  }

  // Insert into 'users' table
  let { data: userData, error: userError } = await supabase
    .from('users')
    .insert([{
      email: loginData.email,
      name: name,
      joined: new Date()
    }])
    .single();

  if (userError) {
    return res.status(400).json('unable to register');
  }

  res.json(userData);
}

module.exports = {
  handleRegister: handleRegister
};
