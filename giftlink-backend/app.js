require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pinoLogger = require('./logger');
const natural = require('natural');

const connectToDatabase = require('./models/db');
const {loadData} = require("./util/import-mongo/index");


const app = express();
app.use("*",cors());

// Connect to MongoDB; we just do this one time
connectToDatabase().then(() => {
    pinoLogger.info('Connected to DB');
})
.catch((e) => console.error('Failed to connect to DB', e));


app.use(express.json());

// Route files
const giftRoutes=require('./routes/giftRoutes');
const searchRoutes= require('./routes/searchRoutes');

const pinoHttp = require('pino-http');
const logger = require('./logger');

app.use(pinoHttp({ logger }));

app.use('/api/gifts',giftRoutes);
app.use('/api/search',searchRoutes);

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('Internal Server Error');
});

app.post('/sentiment',(req,res)=>{
    const {sentence}=req.query;
    if(!sentence){
        logger.error("No sentence provided");
        return res.status(400).json({error:"No sentence provided"});
    }

    const Analyzer = natural.SentenceAnalyzer;
    const stemmer=natural.stemmer;
    const analyzer = new Analyzer("English",stemmer,"afinn");

    try {
        const analysisResult = analyzer.getSentiment(sentence.split(' '));
        let sentiment = "neutral";
        if (analysisResult < 0) {
            sentiment = "negative";
        } else if (analysisResult > 0.33) {
            sentiment = "positive";
        }

        logger.info(`Sentiment analysis result: ${analysisResult}`);
        res.status(200).json({ sentimentScore: analysisResult, sentiment: sentiment });
        
    } catch (error) {
        logger.error(`Error performing sentiment analysis: ${error}`);
        res.status(500).json({ message: 'Error performing sentiment analysis' });
    }
})

app.get("/",(req,res)=>{
    res.send("Inside the server")
})

const port = 3060;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
