const express = require('express');
const os = require('os');

const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
  res.send(`
    <html>
      <body style="font-family: Arial; text-align: center; margin-top: 60px;">
        <div>
          <h1>Hello from Pod</h1>
          <h2>${os.hostname()}</h2>
        </div>
      </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
