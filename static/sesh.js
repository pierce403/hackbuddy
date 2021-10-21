

function seshList()
{      
  console.log("Running new search");
  
  // clear table before starting search
  let seshTable = document.getElementById("sesh-table");
  seshTable.innerHTML = ""

  seshList = fetch('list')
    .then(response => response.json())
    .then(function(data){
       let seshTable = document.getElementById("sesh-table");
       console.log(data);
       seshTable.innerHTML = ""

  for(let sesh of data)
  {
   console.log(sesh.description);
   let row = seshTable.insertRow(-1);

   //row.insertCell().innerText = sesh.user;
   row.insertCell().innerText = sesh.description;
   row.insertCell().innerText = sesh.url;
   row.insertCell().innerText = sesh.count;
  }

  })
}

seshList();

//setInterval(function(){
//  console.log("LOOPING!!");
// }, 10000);//run this thang every 2 seconds







