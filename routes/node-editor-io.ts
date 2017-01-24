/**
 * Created by derwish on 25.01.17.
 */


import * as socket from 'socket.io';
import * as http from 'http';


export class NodesServerSocket{

    constructor(server:http.Server){
        let io=socket(server);

        io.on('connection', function(socket){
            socket.on('chat message', function(msg){
                io.emit('chat message', msg+"2");
            });
        });
    }
}


