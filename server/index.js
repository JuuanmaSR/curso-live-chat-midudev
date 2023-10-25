import 'dotenv/config'
import express from 'express'
import logger from 'morgan'
import { Server } from 'socket.io'
import { createServer } from 'node:http'
import { ChatModel } from '../model/ChatModel.js'

const port = process.env.PORT ?? 3000
const app = express()
const server = createServer(app)
const io = new Server(server, {
    connectionStateRecovery: {
        maxDisconnectionDuration: 10000
    }
})

app.use(logger('dev'))

io.on('connection', async (socket) => {

    socket.on('chat message', async (msg) => {
        let lastIdMessage;
        let username = socket.handshake.auth.username ?? 'Anonimo';
        try {
            lastIdMessage = await ChatModel.save(msg, username)
        } catch (error) {
            console.error(error)
            return
        }
        io.emit('chat message', msg, lastIdMessage.toString(), username)
    })
    if (!socket.recovered) {
        let msgHistory;
        try {
            msgHistory = await ChatModel.getFromSpecificMessage({ idMessage: socket.handshake.auth.serverOffset ?? 0 })
        } catch (error) {
            console.error(error)
            return
        }
        msgHistory.forEach((msg) => {
            socket.emit('chat message', msg.content, msg.id.toString(), msg.username)
        })
    }

    socket.on('disconnect', () => {
        console.log('user disconnected')
    })
})

app.get('/', (req, res) => {
    res.sendFile(process.cwd() + '/client/index.html')
})

server.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})