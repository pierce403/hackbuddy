console.log("LETS DO THIS");

const domain = 'meet.jit.si';
const options = {
    roomName: 'ExploitWorkshop',
    //width: 700,
    //height: 700,
    parentNode: document.querySelector('#meet')
};
const api = new JitsiMeetExternalAPI(domain, options);

setInterval(function(){
  console.log("LOOPING!!");
  let num = api.getNumberOfParticipants();
  console.log("NUM USERS IN ROOM: "+num);

}, 10000);//run this thang every 10 seconds
