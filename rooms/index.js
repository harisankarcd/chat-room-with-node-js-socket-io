
const socket=io('http://localhost:5000')


const messageform = document.querySelector(".forsend form");
const messageList = document.querySelector("#messagelist");
const userList = document.querySelector("ul#users");
const userLis = document.querySelector("ul#room-members");

const chatboxinput = document.querySelector(".forsend input")
const useraddform = document.querySelector(".modal")
const backdrop = document.querySelector(".backdrop")
const useraddinput = document.querySelector(".modal input");
const roomList = document.getElementById("room-list");
let sections = document.querySelectorAll("section");
const newRoomInput = document.getElementById("new-room");
const joinRoomInput = document.getElementById("join-room");

let div=document.getElementById('div')
let inrooms=[]
let mutelist=[]
let rooms=[]
let messages = []
let users = [];
let userinfo={}
messageform.addEventListener('submit',messageSubmitHandler);
useraddform.addEventListener('submit', userAddHandler)
let sheflag=false
let userrooms={}

//page result functions


function randomColorWithOpacity() {
    var red = Math.floor(Math.random() * 256);
    var green = Math.floor(Math.random() * 256);
    var blue = Math.floor(Math.random() * 256);
    var opacity = 0.2;
  
    return "rgba(" + red + "," + green + "," + blue + "," + opacity + ")";
}

function updateMessagesfirst(mess) {
  
    messageList.textContent = ''
    for (let i = 0; i < messages.length; i++) {
        // //console.log(messages[i].user,socket.user)
        messageList.innerHTML += `<li>

        
                     <p style='color:${messages[i].color};font-size:12px;font-weight:700'>${messages[i].user}</p>
                     <p>${messages[i].message}</p>
        
                       </li>`
    }
    // //console.log(mess)
    messages=mess
    updateMessages()
}

function updateMessages() {
    messageList.textContent = ''
    for (let i = 0; i < messages.length; i++) {
       
      if((socket.id==messages[i].id))
     {
        messageList.innerHTML += `<li style="margin-left: auto;">

        
        <p style='color:${messages[i].color};font-size:12px;font-weight:700'>${messages[i].user}</p>
        <p>${messages[i].message}</p>

          </li>`
        
     }
     else {
      if(!(mutelist.includes(messages[i].user))){
        messageList.innerHTML += `<li style="">

        
        <p style='color:${messages[i].color};font-size:12px;font-weight:700'>${messages[i].user}</p>
        <p>${ messages[i].message}</p>

          </li>`
    }}

    }
   
}

function updateMessagesRooms(message) {
  let roommessageList=document.getElementById('messagelist_for_'+message.room)
  // //console.log(roommessageList)
  roommessageList.textContent = ''
  let messages=message.messages
//console.log(message.bannlist.includes(socket.id))
if(message.bannlist.includes(socket.id))
{
  roommessageList.innerHTML += `<h1>your are banned</h1>`
}
else
{
  for (let i = 0; i < messages.length; i++) {
    
    if((socket.id==messages[i].id))
   {
    roommessageList.innerHTML += `<li style="margin-left: auto;">

      
      <p style='color:${messages[i].color};font-size:12px;font-weight:700'>${messages[i].user}</p>
      <p>${messages[i].message}</p>

        </li>`
      
   }
  
   else {
    if(!(mutelist.includes(messages[i].user))){

    roommessageList.innerHTML += `<li style="">

      
      <p style='color:${messages[i].color};font-size:12px;font-weight:700'>${messages[i].user}</p>
      <p>${messages[i].message}</p>

        </li>`}
  }

  
}
}
}


function updateRoomsUsers(data)
{let adminid=data.admin
  //console.log(adminid==socket.id)
  let message=data.users
  //console.log(userLis)
  // const userLis=document.getElementById('room-members')
  userLis.textContent = ''
    for (let i = 0; i < message.length; i++) {
      // //console.log(mutelist.includes(message[i].name),message[i].name,mutelist)
      //console.log(mutelist)
      if(!mutelist.includes(message[i].name)){
        var node = document.createElement("li");
        // node.setAttribute('color',users[i].color)
        node.style.color='#'+message[i].color
        var textnode = document.createTextNode(message[i].name);
        const a = document.createElement("a");
        const b = document.createElement("a");

        // a.textContent = 'x';
      a.className = 'bi bi-bell'
       a.style.setProperty('float','right')
       a.style.fontSize = '18px'
       b.className = 'bi bi-exclamation'
       b.style.setProperty('float','right')
       b.style.fontSize = '18px'
      //  a.style.setProperty('margin',)
      // a.style.setProperty('border','1px solid black')
        a.setAttribute("href", `#${userinfo['current-room']+'-'+message[i].name}`);
        b.setAttribute("href", `#${userinfo['current-room']+'-d-'+message[i].id}`);
     
        a.addEventListener('click',(e)=>
        {
          e.preventDefault();
         
          const id = a.getAttribute("href").substring(1);
          // //console.log(id)
          const g=id.indexOf('-')
          let u=id.slice(g+1);
          // //console.log(u)
          if(!mutelist.includes(u))
          {mutelist.push(u)
            a.style.color='red'
          }
          else
          {
            let index=mutelist.indexOf(u)
            mutelist.splice(index,1)
            a.style.color='green'
            //console.log(mutelist)
          }
          //console.log(mutelist)
          // let d={croom:,message:[],name:socket.name,id:socket.id}
          socket.emit('room-messages',d)
        })

        b.addEventListener('click',(e)=>
        {
          e.preventDefault();
          const id = b.getAttribute("href").substring(1);
         
          b.setAttribute('id',id)
          const g=id.indexOf('-')
          let u=id.slice(g+3);
          let v=id.slice(0,id.indexOf('-',1));
          
          //console.log('kicking out',id)
          let detail={
            room:v,
            id:u
          }

          socket.emit('banning-user',detail)
          socket.emit('change-color-exclam',detail)
        }
          
        )

        if(adminid==socket.id && socket.id!=message[i].id )
        {
         
          node.appendChild(b)
        }
        node.appendChild(textnode);
        if(socket.id!=message[i].id){
        node.appendChild(a)}

        
        userLis.appendChild(node);
    }
  }
}


//socket involving functions
function userAddHandler(e)
{

e.preventDefault()
let username=useraddinput.value
if(!username)
{
    window.alert('enter a user name')
}
else
{
  userinfo['name']=username
  userinfo['id']=socket.id
  userinfo['current-room']='general'
socket.emit('adduser',userinfo)
useraddform.classList.add("disappear")
backdrop.classList.add("disappear")
}
}

function addRoom() {
  const li = document.createElement("li");
  const a = document.createElement("a");
  const name = newRoomInput.value;
  userinfo['current-room']=name
//   alert()
  if(rooms.includes(name) || name=='')
  
{
  // //console.log(rooms)
    
    alert('choose different name. A valid name should not be empty and unique')
}
else{
  
  const randomColor = randomColorWithOpacity();

  a.textContent = name;

  // //console.log(name)
  a.setAttribute("href", `#${name.toLowerCase().replace(" ", "-")}`);
  // //console.log(a,name=='')
  
  li.appendChild(a);
  roomList.appendChild(li);
  
  // //console.log(roomList)
rooms.push(name)
let data={
  name:name,color:randomColor
}
// //console.log(data)
socket.emit('create-room',name)
inrooms.push(name)
socket.emit('update-rooms',data)
// //console.log(rooms)
const id = a.getAttribute("href").substring(1);
// //console.log(id)
let h=document.createElement('section')
h.setAttribute('id',id);
let chat=document.createElement('div')
chat.setAttribute('class','chatroom')
let msglist=document.createElement('ul')
msglist.setAttribute('class','messagelist')
msglist.setAttribute('id','messagelist_for_'+name)
chat.appendChild(msglist)
h.append(chat)
// msglist.innerHTML=`<li style="">

        
// <p style='color:#c0c0c0;font-size:12px;font-weight:700'>hari</p>
// <p>this may be new dont freak out</p>

//   </li>`
h.style.backgroundColor =  randomColor;
{/* <div class="chatbox">
<ul id="messagelist">

</ul>

</div> */}
div.appendChild(h)
// updateMessagesRooms(name)
 
sections = document.querySelectorAll("section");
sections.forEach(section => section.classList.remove("active"));
document.getElementById(id).classList.add("active");


  newRoomInput.value = "";
  
  // Add event listener to the new link
  a.addEventListener("click", function(event) {
 
    event.preventDefault();
    // Hide all sections
   socket.emit('get-room-users',userinfo['current-room'])
// //console.log('dfjhgdfkj')
sections = document.querySelectorAll("section");
sections.forEach(section => section.classList.remove("active"));
    
          // Hide all sections
        
          
          // Show the clicked section
         userinfo['current-room']=name
          // const id = this.getAttribute("href").substring(1);
          // //console.log(id,div)
          // //console.log(sections.length)
          const element=document.getElementById(id)
          // //console.log(element)
          //console.log(userinfo)
          document.getElementById(id).classList.add("active");

    // document.getElementById(id).classList.add("active");
  });
}

}

function addRoom2(messages) {
  const li = document.createElement("li");
  const a = document.createElement("a");
  const name = joinRoomInput.value;
  userinfo['current-room']=name
//   alert()

  
  const randomColor = randomColorWithOpacity();

  a.textContent = name;
  a.setAttribute("href", `#${name.toLowerCase().replace(" ", "-")}`);
  li.appendChild(a);
  roomList.appendChild(li);

  // //console.log(roomList,a.getAttribute("href").substring(1),)
rooms.push(name)
let data={
  name:name,color:randomColor
}
// //console.log(data)
// socket.emit('join-room',name)
// socket.emit('update-rooms',data)
// //console.log(rooms)
const id = a.getAttribute("href").substring(1);
let h=document.createElement('section')
h.setAttribute('id',id);
let chat=document.createElement('div')
chat.setAttribute('class','chatroom')
let msglist=document.createElement('ul')
msglist.setAttribute('class','messagelist')
// msglist.setAttribute()
msglist.style.minHeight=80%
// //console.log(mesages)
msglist.setAttribute('id','messagelist_for_'+name)
  for (let i = 0; i < messages.length; i++) {
     
    if((socket.id==messages[i].id))
   {
    msglist.innerHTML += `<li style="margin-left: auto;">

      
      <p style='color:${messages[i].color};font-size:12px;font-weight:700'>${messages[i].user}</p>
      <p>${messages[i].message}</p>

        </li>`
      
   }
  
   else {
    msglist.innerHTML += `<li style="">

      
      <p style='color:${messages[i].color};font-size:12px;font-weight:700'>${messages[i].user}</p>
      <p>${messages[i].message}</p>

        </li>`
  }

  }
chat.appendChild(msglist)
h.append(chat)
// msglist.innerHTML=`<li style="">

        
// <p style='color:#c0c0c0;font-size:12px;font-weight:700'>hari</p>
// <p>this may be new dont freak out</p>

//   </li>`
h.style.backgroundColor =  randomColor;
{/* <div class="chatbox">
<ul id="messagelist">

</ul>

</div> */}
div.appendChild(h)
// updateMessagesRooms(name)
 
sections = document.querySelectorAll("section");
sections.forEach(section => section.classList.remove("active"));
document.getElementById(id).classList.add("active");


  newRoomInput.value = "";
  
  // Add event listener to the new link
  a.addEventListener("click", function(event) {
 
    event.preventDefault();
   
    // Hide all sections
sections = document.querySelectorAll("section");
sections.forEach(section => section.classList.remove("active"));
    
          // Hide all sections
        
          
          // Show the clicked section
         userinfo['current-room']=name
          const id = this.getAttribute("href").substring(1);
          // //console.log(id,div)
          // //console.log(sections.length)
          const element=document.getElementById(id)
          // //console.log(element)
          //console.log(userinfo)
          document.getElementById(id).classList.add("active");
    

    // document.getElementById(id).classList.add("active");
  });
}

function joinRoom()
{const name = joinRoomInput.value;
    // //console.log(rooms)
    
    socket.emit('check-for-join-room',name)
};

function ban(room)
{
  let roommessageList=document.getElementById('messagelist_for_'+room)

  roommessageList.innerHTML = "<h1>U are banned</h1>"

}
function messageSubmitHandler(e)
{
    e.preventDefault();
    // let mess=chatboxinput.value
    var croom=userinfo['current-room']
    let message = chatboxinput.value;
    // //console.log(userinfo)
    let detail={
      message:message,
      room:croom
    }
 
   
    if(!message)
    {
       return  window.alert('input should not be empty')
    }
  
else
{
  socket.emit('check4ban',detail)
}

    
}

socket.on('messager',result=>
{
  let message=result.message
  let bannlist=result.bannlist
  var croom=userinfo['current-room']
  if(bannlist.includes(userinfo['id']))
  {//console.log(croom+'-d-'+userinfo['id'])
  
    ban(croom)
    alert('you have been banned')
  }
  else if(croom=='general')
  {

  socket.emit("general-message", message)

  }
  else
  {
  // //console.log('current room  ',message,croom)
  // //console.log(userinfo[socket.name].color)
  // //console.log(,'color')
  let d={croom:croom,message:message,name:socket.name,id:socket.id}
    socket.emit("room-messages", d)
    // //console.log('you want to send a mesage to anotther rom')
  }
  chatboxinput.value = ""

})
//  socket emission and recieves
socket.on("message", (message) => {
    messages.push(message);
    updateMessages()
    // //console.log(userinfo['current-room'])
    // updateMessagesRooms(userinfo['current-room'])
})
socket.on('first',mess=>
{
    updateMessagesfirst(mess)
})
socket.on('users',(_user)=>
{
    users=_user
    // updateUsers()
})
socket.on('existornot',(value)=>
{

  // //console.log(value)
  if(value)
  {
    const name = joinRoomInput.value;
    // alert(name)
if(inrooms.includes(name))
{
  alert('already added')
}
else
{
    inrooms.push(name)
    //console.log(inrooms)
    socket.emit('join-room',name)}
    
  }
  else{
    alert('enter a existing room name')
  }

})
socket.on('join-message',(data)=>
{
  addRoom2(data)
  // //console.log(data)
})
socket.on('room-message',(message)=>
{
    // //console.log(message)
    updateMessagesRooms(message)
})
socket.on('update-rooms',room=>
{
  rooms=room
  // //console.log(rooms)
})
socket.on('room-users',users=>
  
  {
    updateRoomsUsers(users)
    // //console.log(users)
})
socket.on('call-room-users',()=>
{
  socket.emit('get-room-users',userinfo['current-room'])
})
socket.on('ex-color',detail=>
{
  let croom=detail.room
  let flag=detail.flag
  let id=croom+'-d-'+detail.id
  let a=document.getElementById(id)
if(flag)
{
 
  // //console.log(a)
  a.style.color='red'
}
else
{
  let d={croom:croom,message:[],name:socket.name,id:socket.id}
  socket.emit('room-messages',d)
  a.style.color='green'
}
})