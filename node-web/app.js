const express = require('express')
const app = express();
const path = require('path')
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
app.get('/', (req, res) => {
  res.render('home')
});
app.get('/login', (req, res) => {
  res.render('login')
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
})