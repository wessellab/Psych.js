const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const { PORT } = process.env;

// App Init
const app = express();

// Cors
app.use(cors());

// Static files
app.use(express.static(path.join(process.cwd(), 'cdn')));
app.use(express.static(path.join(process.cwd(), 'public')));

// Body Parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/test', async (req, res) => {

    return res.json({ msg: 'Working!' })

})

app.listen(PORT, () => {
    console.log(`App listening on port: ${PORT}`);
})