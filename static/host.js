console.log("LETS DO THIS");

const domain = 'meet.jit.si';
const options = {
    //roomName: 'ExploitWorkshop',
    //width: 700,
    //height: 700,
    parentNode: document.querySelector('#meet')
};
const api = new JitsiMeetExternalAPI(domain, options);

setInterval(function(){
  console.log("LOOPING!!");
  let num = api.getNumberOfParticipants();
  console.log("NUM USERS IN ROOM: "+num);

  let desc = document.querySelector('#description')

  let data = {description: desc,count: num};

  fetch("/update", {
  method: "POST", 
  body: JSON.stringify(data)
  }).then(res => {
    console.log("Request complete! response:", res);
  });

}, 10000);//run every 10 seconds
