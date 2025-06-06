import http from 'node:http'
// import https from 'node:https' // 暂时
import express from 'express'
import { Server as SocketIoServer } from 'socket.io'

// 类型提示
import { TheWhiteSilkParams, CallbackMessage } from './Types.js'

const app = express()
const httpApp = http.createServer(app)
const sio = new SocketIoServer(httpApp, {})

// 编译前端代码
import io from './lib/io.js'
io.copyDir('./client/', './whitesilk_data/page_builded/')
await import('./build.js').then(a => a.default('whitesilk_data/page_builded/'))
app.use('/', express.static('whitesilk_data/page_builded/'))

const events = {}
import { UserApi } from './api/User.js'

for (let i of [
    UserApi,
]) {
    for (let i2 of Object.keys(i)) {
        if (i2 == 'API_NAME') continue
        events[i.API_NAME + '.' + [i2]] = i[i2]
    }
}

sio.on("connection", (socket) => {
    socket.on('the_white_silk',
        /** 
         * @param { TheWhiteSilkParams } params
         * @param { Function } callback
         */
        (params, callback) => {
            if ((params || callback) == null || typeof callback != 'function') return;
            
            /** @type { CallbackMessage } */
            let data = events[params.method] ? events[params.method](params.args) : {
                msg: '找不到此方法',
                code: CallbackMessage.Code.NOT_FOUND,
            }
            callback(data)
        }
    )
})

httpApp.listen(80)
