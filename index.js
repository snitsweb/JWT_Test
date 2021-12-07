import express from 'express'
import jwt from 'jsonwebtoken'

const app = express();

const authMiddleware = (req, res, next) => {
    const token = req.headers['authorization'].split(' ')[1];
    if(!token)
        return res.sendStatus(401);
    jwt.verify(token, ACCES_TOKEN, (err, data) => {
        if(err)
            return res.sendStatus(403)
        req.user = data;
        next();
    });
}

app.use(express.json())

// procces.env
const ACCES_TOKEN = 'dklgjldkfgjldjlgkfdjis;';
const REFRESH_TOKEN = 'ldifhidlhfd2131dfmngdkfj;';

//imitacja bd

const users = [
    {id: 23, name: 'Adam', email: 'adam@gmail.com'},
    {id: 43, name: 'Adam', email: 'adam@gmail.com'},
]
let refreshTokens = []


app.get('/', (req, res) => {
    res.send('Witaj na stronie głównej')
})

app.get('/admin', authMiddleware, (req, res) => {
    res.send('Witaj w panelu admina')
})

app.post('/login', (req, res) => {
    const user = users.find(u => u.email === req.body.email)
    if(!user) {
        return res.sendStatus(401) //nieautoryzowany
    }

    const payload = user;
    const token = jwt.sign(payload, ACCES_TOKEN, {expiresIn: '15s'})
    const refreshToken =  jwt.sign(payload, REFRESH_TOKEN)
    refreshTokens.push(refreshToken)

    res.json({token, refreshToken})
})

app.post('/refresh-token', (req, res) => {
    const { token } = req.body
    if(!refreshTokens.includes(token))
        return res.sendStatus(403)

    jwt.verify(token, REFRESH_TOKEN, (err, data) => {
        if (err) {
            return res.sendStatus(403)
        }
        const payload = {
            id: data.id,
            name: data.name,
            email: data.email
        };
        const newAccessToken = jwt.sign(payload, ACCES_TOKEN, {expiresIn: '15s'})
        res.json({token: newAccessToken})
    })
})

app.delete('/logout', (req, res) => {
    const {refreshToken} = req.body
    refreshTokens = refreshTokens.filter(t => t !== refreshToken)
    res.sendStatus(204)
})

app.listen(3000, () => console.log('Server słucha...'))