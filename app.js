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

// Body Parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/demographics', async (req, res) => {

    return res.sendFile(path.resolve(__dirname, 'html/demographics.html'));

})

app.post('/save', async (req, res) => {

    try {

        const { id } = req.query;
        const { trialseq } = req.body;

        console.log(id);
        console.log(trialseq);

        return res.sendStatus(200);

    } catch (error) {
        return res.status(500).json({
            msg: 'Internal Server Error',
            error: error.toString()
        })
    }

})

app.get('/home', (req, res) => {

    res.sendFile(path.resolve(__dirname, 'html/test.html'));

})

app.listen(PORT, () => {
    console.log(`App listening on port: ${PORT}`);
})