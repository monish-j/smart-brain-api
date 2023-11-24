const handleProfileGet = async (req, res, supabase) => {
   const { id } = req.params;
   let { data, error } = await supabase
     .from('users')
     .select('*')
     .eq('id', id)
     .single();
 
   if (error) {
     res.status(400).json('error getting user');
   } else if (data) {
     res.json(data);
   } else {
     res.status(400).json('Not found');
   }
 }
 
 module.exports = {
   handleProfileGet
 };
 