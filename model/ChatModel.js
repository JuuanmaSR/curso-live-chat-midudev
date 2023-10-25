import { connection } from './chat.js'
export class ChatModel {
    static save = async (msg, username) => {

        const response = await connection.query('INSERT INTO messages (content, username) VALUES (?,?)', [msg, username])
        if (response[0].affectedRows > 0) {
            return response[0].insertId
        }
        return false
    }
    static getAll = async () => {
        const [rows] = await connection.query('SELECT * FROM messages')
        return rows
    }

    static getFromSpecificMessage = async ({ idMessage }) => {
        const [rows] = await connection.query('SELECT * FROM messages WHERE id > ?', [idMessage])
        return rows
    }
}