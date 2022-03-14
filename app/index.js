const express = require('express');
const session = require('express-session');

const multer = require('multer');
const bodyParser = require('body-parser');
const upload = multer();

const redis = require('redis');

const {VM, VMScript} = require('vm2');

const REDIS_URL = 'redis://:fa6aca251988418c96350d4047a77550@gusc1-clear-seagull-31576.upstash.io:31576';
const SESSION_SECRET = 'wOlVsEc_sEcR3T_f0r_ch@@l_auT0rA1d3r';
const FLAG = 'wsc{wRiT!nG_c0d3_t@kE3_t!M3_}';

const NUM_QUESTIONS = 30;

var RedisStore = require('connect-redis')(session)
var client = redis.createClient({
    'url': REDIS_URL,
    legacyMode: true
});

client.on('connect', () => console.log('Connected to Redis!'));
client.on('error', (err) => console.log('Redis Client Error', err));
client.connect().then(() => {});

var app = express()

app.use(session({
    store: new RedisStore({ client: client }),
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));

app.use((req, res, next) => {
    if(!req.session.answers) {
        req.session.answers = generateAnswers();
    }
    next();
});

app.use(express.static('public'));
app.use(express.static('project'));

// for parsing application/json
app.use(bodyParser.json()); 

// for parsing application/xwww-
app.use(bodyParser.urlencoded({ extended: true })); 
//form-urlencoded

// for parsing multipart/form-data
app.use(upload.array()); 

app.post('/upload', async (req, res, next) => {
    try {
        let code = req.body.code;

        const vm = new VM({
            timeout: 50,
            allowAsync: false
        });
        
        // Test for correct responses for given person
        // Correct answers retrieved from user session
        const person = req.session.answers.person;
        const responses = req.session.answers.responses;
        let testCases = responses.map((response, i) => { 
            return {'person': person, 'questionNumber': i, 'correct': response}
        });
        // Add edge case
        testCases.push(
            {'person': 9999999999, 'questionNumber': 0, 'correct': false}
        )

        // Go through each test case
        for(i in testCases) {
            const testCase = testCases[i];
            const result = testCode(vm, code, testCase.person, testCase.questionNumber, testCase.correct);
            if(result.error) {
                req.session.pass = false;
                res.send(result.message);
                return;
            } else if(!result.pass) {
                req.session.pass = false;
                res.redirect('submission.html');
                return;
            }
        };
        
        req.session.pass = true;
        res.redirect('submission.html');
    } catch {
        res.send('Server side error');
    }
});

app.get('/grade', async (req, res, next) => {
    if(req.session.pass ?? false) {
        res.send('Tests passed! Here is the flag: ' + FLAG);
    } else {
        req.session.answers = generateAnswers();
        res.send('Tests failed. Correct answers have been changed!');
    }
});

function generateAnswers() {
    answers = {
        'person': Math.floor(Math.random() * 7753000),
        'responses': []
    };
    for(let i = 0; i < NUM_QUESTIONS; i++) {
        answers.responses.push(Math.random() > 0.5);
    }
    return answers;
}

function testCode(vm, code, person, questionNumber, correct) {
    ret = {
        message: '',
        error: false,
        pass: true
    };
    try {
        const result = vm.run(`oracle(${person}, ${questionNumber});${code}`);
        if(typeof result !== 'boolean' || result !== correct) {
            ret.pass = false;
        }
    } catch {
        ret.message = 'Code threw error! Please resubmit!';
        ret.error = true;
        ret.pass = false;
    }
    return ret;
}

app.listen(8080, function () {
    console.log('Autograder server listening on port 8080!');
});