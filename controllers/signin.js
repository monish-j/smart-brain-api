const handleSignin = async (req, res, supabase, bcrypt) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json('incorrect form submission');
  }

  let { data, error } = await supabase
    .from('login')
    .select('email, hash')
    .eq('email', email)
    .single();

  if (error) {
    return res.status(400).json('wrong credentials');
  }

  const isValid = bcrypt.compareSync(password, data.hash);
  if (isValid) {
    let { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (userError) {
      return res.status(400).json('unable to get user');
    }

    res.json(userData);
  } else {
    res.status(400).json('wrong credentials');
  }
}

module.exports = {
  handleSignin: handleSignin
};
