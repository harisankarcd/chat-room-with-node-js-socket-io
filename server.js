const express=require('express')
const app=express()

let users=[]
let userids=[]

let rooms=[]
let roomdata={'general':{
    name:'general',
    color:'#111',
    admin:'hari',
    messages:[],
    users:[],
    bannlist:[]
}}
let roomusers=[]
const Socket=require('socket.io')

const server=require('http').createServer(app);
let mess=[]
const PORT=5000;

const io=Socket(server,{
    cors:{origin:"*",
    methods:["GET","POST"]
}
})
server.listen(PORT,()=>
{
    ////console.log(`http://localhost:${PORT}`)

})




io.on('connection',(socket)=>
{
    // ////console.log(mess)
    var randomColor = Math.floor(Math.random()*16777215).toString(16);
    socket.color='#'+randomColor
// //console.log('user connected',socket.id);

socket.emit('first',mess);
socket.on('adduser',(user)=>
{
    sid:socket.id,
    socket.user=user.name
    user['color']=randomColor
    userids.push(socket.id)
    users.push(user)
    // //console.log('color',randomColor)
    roomdata['general'].users.push(user)
   
    socket.emit('room-users',roomdata['general'])
    // ////console.log(mess)

})
socket.on('general-message',(data)=>
{
    // ////console.log(mess)

    io.sockets.emit("message", {
        id:socket.id,
        user:socket.user,
       color:socket.color,
        message: data,
    }) 
    mess.push( {
        id:socket.id,
        user:socket.user,
       color:socket.color,
        message: data,
    })
    roomdata['general'].messages=mess
    

    // ////console.log(roomdata,)

    // ////console.log(mess)
})
socket.on('update-rooms',room=>
{ let index=userids.indexOf(socket.id)
    let uname=users[index]
    // users[index].name
    // ////console.log('here')
    rooms.push(room.name)
    let name=room.name
    // ////console.log(socket.user)
    room['admin']=socket.id
    room['users']=[uname]
    room['messages']=[]
    room['bannlist']=[]
    roomdata[room.name]=room

//    //console.log(roomdata[room.name].users)
socket.emit('room-users',roomdata[room.name])
    
    
   io.sockets.emit('update-rooms',rooms)
    // //////console.log(roomdata,socket.id)
})
socket.on('check-for-join-room',(room)=>
{
    let doesexist=rooms.includes(room)
    // ////console.log(rooms)
    socket.emit('existornot',doesexist)
});
socket.on('join-room',name=>
{
    // ////console.log(name)
    socket.join(name)

    let data=roomdata[name].messages
    
    let index=userids.indexOf(socket.id)
    let uname=users[index]
    roomdata[name].users.push(uname)
    let userlist=roomdata[name].users
    io.to(name).emit('room-users',roomdata[name])
    socket.emit('join-message',data)
})
socket.on('create-room',name=>
{
    // ////console.log(name)
    socket.join(name)

    // roomdata[name].users.push(name)
    let index=userids.indexOf(socket.id)
    //console.log(users[index].name)
    
    let data=roomdata[name]
    

    // socket.emit('join-message',data)
})
socket.on('room-messages',(croom)=>
{
    // ////console.log('here on the server side')
    // ////console.log(croom.message,croom.croom)
    // ////console.log('hdu',roomdata[croom.croom],socket.name,socket.id,socket.color)
    // let meso=roomdata[croom.croom].messages
    // meso.push(croom.message)
    // let name=croom
    // ////console.log('hello',name)
    // roomdata[croom.croom].messages=meso
    ////console.log(roomdata[croom.croom].messages)
    let index=userids.indexOf(socket.id)
    let f1=users[index]
    let f2={
    id:f1.id,
    user:f1.name,
   color:'#'+f1.color,
    message: croom.message}
    roomdata[croom.croom].messages.push(f2)
    io.to(croom.croom).emit('room-message',{room:croom.croom,messages:roomdata[croom.croom].messages,bannlist:roomdata[croom.croom].bannlist})

})
socket.on("disconnect", () => {
    ////console.log("disconnecting", socket.id)

    if (socket.id) {
        let name=users[userids.indexOf(socket.id)]
        for(i in roomdata)

        {
          
            let o=roomdata[i].users.indexOf(name)
            roomdata[i].users.splice(o,1)
           //console.log('kijo',roomdata[i].users)
        }
    }
  
        users.splice(userids.indexOf(socket.id), 1);
        userids.splice(userids.indexOf(socket.id), 1);
    io.sockets.emit('call-room-users')
    // io.sockets.emit("users", users)
    // ////console.log('remaining users: ', users)
})
socket.on('get-room-users',(room)=>
{
    // //console.log(room)
    //console.log(roomdata[room].users)
    socket.emit('room-users',roomdata[room])
})
socket.on('banning-user',(detail)=>
{
let g= userids.indexOf(detail.id)
if(roomdata[detail.room].bannlist.includes(detail.id))
{
    let inde=roomdata[detail.room].bannlist.indexOf(detail.id)
    roomdata[detail.room].bannlist.splice(inde,1)
}
// //console.log('pop',userids)
// //console.log('pop',g,detail.id,users[g])
else
{
roomdata[detail.room].bannlist.push(detail.id)
}

// roomdata[detail.room].bannlist.push()
    //console.log(roomdata[detail.room].bannlist,detail.id)
})
socket.on('check4ban',detail=>
{
    let result=
    {
        bannlist:roomdata[detail.room].bannlist,
        message:detail.message
    }
    //console.log(result)
    socket.emit('messager',result)
})

socket.on('change-color-exclam',detail=>
{
socket.emit('ex-color',{room:detail.room,id:detail.id,flag:roomdata[detail.room].bannlist.includes(detail.id)})
})

})