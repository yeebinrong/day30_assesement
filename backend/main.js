/* -------------------------------------------------------------------------- */
//                     ######## LOAD LIBRARIES ########
/* -------------------------------------------------------------------------- */
//#region 

const express = require('express')
const secure = require('secure-env')
const morgan = require('morgan')

const { MongoClient} = require('mongodb')
const mysql = require('mysql2/promise')
const AWS = require('aws-sdk')
const multer = require('multer')
const cors = require('cors')
const fs = require('fs')
const path = require('path')

//#endregion



/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */



/* -------------------------------------------------------------------------- */
//             ######## DECLARE VARIABLES & CONFIGURATIONS ########
/* -------------------------------------------------------------------------- */
//#region

// Retrieve environment variables from .env
global.env = secure({secret: process.env.ENV_PASSWORD})


// ######## MONGO ########
const MONGO_DB = global.env.MONGO_DB // mongo_paf2020
const MONGO_COLLECTION = global.env.MONGO_COLLECTION // data
const MONGO_URL = 'mongodb://localhost:27017'

// MONGO CONFIUGRAIONS
const mongo = new MongoClient(MONGO_URL, {
        useNewUrlParser: true, useUnifiedTopology: true
    }
)


//######## AWS S3 ########
const AWS_ENDPOINT = new AWS.Endpoint(global.env.DIGITALOCEAN_ENDPOINT)
const UPLOAD_PATH = `${__dirname}/uploads/`

// S3 Configurations
const s3 = new AWS.S3({
    endpoint: AWS_ENDPOINT,
    accessKeyId: global.env.DIGITALOCEAN_ACCESS_KEY,
    secretAccessKey: global.env.DIGITALOCEAN_SECRET_ACCESS_KEY
})


//######## MYSQL ########
const pool = mysql.createPool({
    host: global.env.SQL_HOST,
    port: global.env.SQL_PORT,
    user: global.env.SQL_USER,
    password: global.env.SQL_PASS,
    database: global.env.SQL_SCHEMA,
    connectionLimit: global.env.SQL_CON_LIMIT
})


// Declare the port to run server on
const PORT = parseInt(process.argv[2]) || parseInt(process.env.PORT) || 3000
// Create an instance of express
const app = express()
// Create an instance of multer
const upload = multer({dest: UPLOAD_PATH})

//#endregion



/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */



/* -------------------------------------------------------------------------- */
//                          ######## METHODS ########
/* -------------------------------------------------------------------------- */
//#region

// Boilerplate for making SQL queries
const mkQuery = (SQL, POOL) => {
    return async (PARAMS) => {
        // get a connection from pool
        const conn = await POOL.getConnection()
        try {
            // Execute the query
            const results = await conn.query(SQL, PARAMS)
            return results[0]
        } catch (e) {
            return Promise.reject(e)
        } finally {
            conn.release()
        }
    }
}

// Validate credentials
const ValidateUser = async (credentials) => {
    const results = (await QUERY_SELECT_USER_PASS_WITH_USER(credentials.user_id))[0]
    if (!!!results || results.length <= 0 || results.password != credentials.password)
        return false
    else
        return true
}

// Reads the file using fs and returns the buffer as a promise
const myReadFile = (file) => new Promise((resolve, reject) => {
    fs.readFile(file, (err, buffer) => {
        if (err == null) {
            resolve(buffer)
        } else {
            reject("<At myReadfile Function> ", err)
        }
    })
}) 

// Handles the uploading to AWS S3 and returns the key as a promise
const uploadToS3 = (buffer, req) => new Promise((resolve, reject) => {
    const key = req.file.filename + '_' + req.file.originalname;
    const params = {
        Bucket: 'paf2020',
        Key: key,
        Body: buffer,
        ACL: 'public-read',
        ContentType: req.file.mimetype,
        ContentLength: req.file.size,
        Metadata: {
            originalName: req.file.originalname,
            createdTime: '' + (new Date()).getTime(),
        }
    }
    s3.putObject(params, (err, result) => {
        if (err == null) {
            resolve(key)
        } else {
            reject("<At uploadToS3 Function> ", err)
        }
    })
})

const unlinkAllFiles = (directory) => new Promise((resolve, reject) => {
    fs.readdir(directory, (err, files) => {
        if (err) reject("<At unlinkAllFiles Function> ", err)
      
        for (const file of files) {
          fs.unlink(path.join(directory, file), err => {
            if (err) reject("<At unlinkAllFiles Function> ", err)
          });
        }
        resolve()
    });
})

const uploadToMongo = (data) => new Promise((resolve, reject) => {
    const toUpload = {
        title: data.title,
        comments: data.comments,
        img_key: data.key,
        ts: new Date()
    }
    mongo.db(MONGO_DB).collection(MONGO_COLLECTION)
        .insertOne(toUpload, (err,docsInserted) => {
            if (!!err) {
                reject("<At uploadToMongo function> :",err)
            }
            else {
                resolve(docsInserted.insertedId)
            }
        })
})

//#endregion



/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */



/* -------------------------------------------------------------------------- */
//                        ######## SQL QUERIES ########
/* -------------------------------------------------------------------------- */
//#region

const SELECT_USER_PASS_WITH_USER = 'SELECT * FROM user WHERE user_id = ?' 

const QUERY_SELECT_USER_PASS_WITH_USER = mkQuery(SELECT_USER_PASS_WITH_USER, pool)

//#endregion



/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */



/* -------------------------------------------------------------------------- */
//                          ######## REQUESTS ########
/* -------------------------------------------------------------------------- */
//#region 

// Log incoming requests using morgan
app.use(morgan('tiny'))
// parse application/x-www-form-urlencoded
app.use(express.urlencoded({extended: false}))
// parse application/json
app.use(express.json())
// cors header
app.use(cors())
// Serve static index.html in static/dist/frontend folder
app.use(express.static(`${__dirname}/static/dist/frontend`))

// POST /api/login
app.post('/api/login', async (req, resp) => {
    if (!!(await ValidateUser(req.body))) {
        resp.status(200)
        resp.type('application/json')
        resp.json({})
    } else {
        resp.status(401)
        resp.type('application/json')
        resp.json({msg: "Authentication failed. Incorrect credentials."})
    }
})

// POST /api/upload
app.post('/api/upload', upload.single('file'), async (req, resp) => {
    // Parse the json string sent from client into json object
    const data = JSON.parse(req.body.data)
    try {
        if (!!(await ValidateUser(data.credentials))) {
            const buffer = await myReadFile(req.file.path)
            const key = await uploadToS3(buffer, req)
            data.key = key
            const id = await uploadToMongo(data)
            await unlinkAllFiles(UPLOAD_PATH)
            resp.status(200)
            resp.type('application/json')
            resp.json({id: id})
        } else {
            resp.status(401)
            resp.type('application/json')
            resp.json({msg: "Authentication failed. Please re-login."})
        }
    } catch (e) {
        console.info(e)
		resp.status(500)
		resp.type('application/json')
		resp.json({msg: `${e}`})
    }
})

// Redirect back to landing page if no resource matches
app.use((req, resp) => {
    resp.redirect('/')
})

//#endregion



/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */



/* -------------------------------------------------------------------------- */
//                    ######## INITIALISING SERVER ########
/* -------------------------------------------------------------------------- */
//#region 

// Tests the mongo server
const checkMongo = () => {
    try {
        console.info("Pinging Mongo in progress...")
        return mongo.connect()
        .then (() => {
            console.info("Pinging Mongo is succesful...")
            return Promise.resolve()
        })
    } catch (e) {
        return Promise.reject(e)
    }
}

// Tests the MYSQL server
const checkMYSQL = () => {
    try {
        return pool.getConnection()
        .then ((conn) => {
            console.info("Pinging MYSQL in progress...")
            conn.ping()
            return conn
        })
        .then ((conn) => {
            conn.release()
            console.info("Pinging MYSQL is successful...")
            return Promise.resolve()
        })
    } catch (e) {
        return Promise.reject(e)
    }
}

// Tests the AWS server
const checkAWS = () => new Promise((resolve, reject) => {
    if (!!global.env.DIGITALOCEAN_ACCESS_KEY && !!global.env.DIGITALOCEAN_SECRET_ACCESS_KEY) {
        console.info("AWS keys found...")
        resolve()
    }
    else
        reject('S3 Key is not found.')
})

// Runs all tests before starting server
Promise.all([checkMongo(), checkMYSQL(), checkAWS()])
.then (() => {
    app.listen(PORT, () => {
        console.info(`Application is listening PORT ${PORT} at ${new Date()}`)
    })
}).catch (e => {
    console.info("Error starting server: ",  e)
})

//#endregion



/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */