const express = require('express');
const bodyParser = require('body-parser');

const app = express();

const config = require('./config/keys');
const mongoose = require('mongoose');
const cors         = require('cors');
mongoose.connect(config.mongoURI, { useNewUrlParser: true });

require('./models/Registration');
require('./models/Demand');
require('./models/Coupons');

//CORS setup
const whitelist = ['http://localhost:3000','https://cannabotapp.herokuapp.com/']

const corsOptions = {
    origin: function(origin, callback) {
        if (whitelist.includes(origin) || !origin) {
            callback(null, true)
        } else {
            console.log(whitelist);
            console.log(origin);
            callback(new Error('Not allowed by CORS'))
        }
    },
    credentials:true
}

app.use(cors(corsOptions));

app.use(bodyParser.json());

require('./routes/dialogFlowRoutes')(app);
require('./routes/fulfillmentRoutes')(app);

if (process.env.NODE_ENV === 'production') {
    // js and css files
    app.use(express.static('client/build'));

    // index.html for all page routes
    const path = require('path');
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
}


const PORT = process.env.PORT || 5000;
app.listen(PORT);