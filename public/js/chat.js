const socket = io()


//Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sentLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//Template
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options

const {username,room} = Qs.parse(location.search,{
    ignoreQueryPrefix: true
})

const autoscroll = () => {

    //Get the New Message Element

    const $newMessage = $messages.lastElementChild


    //Get the height of the last message2

    const newMessageStyles = getComputedStyles($newMessage)  //To get styles we will use the follwing global functions to get the relevant details
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)

    const newMessageHeight  = $newMessage.offsetHeight + newMessageMargin



    //Getting Visible Height 

    const visibleHeight = $messages.offsetHeight

    //Height of messages container

    const containerHeight = $messages.scrollHeight

    //How far have I scrolled

    const scrollOffset = $messages.scrollTop + visibleHeight


    if(containerHeight - newMessageHeight <= scrollOffset) {


        $messages.scrollTop = $messages.scrollHeight



    }







}

socket.on('message',(message)=>{


    console.log(message)
    const html = Mustache.render(messageTemplate,{



        username:message.username,
        message: message.text,
        createdAt:moment(message.createdAt).format('h:mm A')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('locationMessage',(message)=>{

    console.log(message)

    const html = Mustache.render(locationMessageTemplate,{



        username: message.username,
        url:message.url,
        createdAt: moment(message.createdAt).format('h:mm A')
    })

    $messages.insertAdjacentHTML('beforeend',html)

    autoscroll()


   // console.log(url)



})

document.querySelector('#message-form').addEventListener('submit',(e)=>{

    //disable the form

    $messageFormButton.setAttribute('disabled','disabled')



    e.preventDefault()

    const message = e.target.elements.message.value//document.querySelector('input').value

    socket.emit('sendMessage',message,(error/*message*/)=>{

        //enable

        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()


        //console.log('The message was delivered!',message)

        if(error) {

            console.log(error)
        }

        console.log('Message Delivered')
    })
})

// socket.on('countUpdated',(count)=>{


//     console.log('The count has been updated!',count)



// })

// document.querySelector('#increment').addEventListener('click',()=>{


//     console.log('Clicked')
//     socket.emit('increment')
// })

$sentLocationButton.addEventListener('click',()=>{


   if(!navigator.geolocation) {

    return alert('Geolocation is not supported by your browser!!')



   }

   $sentLocationButton.setAttribute('disabled','disabled')

   navigator.geolocation.getCurrentPosition((position)=>{


    //console.log(position)
    socket.emit('sendLocation',{

        latitude: position.coords.latitude,
        longitude: position.coords.longitude
    },()=>{




        $sentLocationButton.removeAttribute('disabled')
        console.log('Location shared!')
       })



   })
})

socket.emit('join',{username,room},(error)=>{


    if(error) {

        alert(error)
        location.href = '/ '
    }





})

socket.on('roomData',({room,users})=>{


    //console.log(room + " d",users)
    const html = Mustache.render(sidebarTemplate,{


        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})


