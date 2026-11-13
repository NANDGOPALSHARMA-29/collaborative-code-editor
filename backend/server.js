import express from "express"
import http from "http"
import { Server } from "socket.io";
import { YSocketIO } from 'y-socket.io/dist/server'


const app = express();
const server = http.createServer(app);

const io = new Server(server,{
    cors:{
        origin:"http://localhost:5173"
    }
})
const ysocketio = new YSocketIO(io)
ysocketio.initialize()

app.get("/",(req,res)=>{
    res.status(200).json({
        message:"hello world",
        success: true
    })
})

app.get("/health",(req,res)=>{
    res.status(200).json({
        message:"ok",
        success: true
    })
})

server.listen(3000,()=>{
    console.log("Server running on port 3000");
})
