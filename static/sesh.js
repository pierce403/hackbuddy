

async function seshList() {
  const seshTable = document.getElementById("sesh-table");
  seshTable.replaceChildren();
  try {
    const response = await fetch('list');
    if (!response.ok) throw new Error('unavailable');
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error('unavailable');
    for (const sesh of data) {
   let row = seshTable.insertRow(-1);

   row.insertCell().innerText = "@"+sesh.user;
   row.insertCell().innerText = sesh.description;
   row.insertCell().innerText = "Active users: "+sesh.count;

   let jitsiLink = document.createElement('a');
   jitsiLink.setAttribute('href', sesh.url);
   jitsiLink.setAttribute('target', "_blank");
   jitsiLink.setAttribute('rel', "noopener noreferrer");
   jitsiLink.append("[JOIN]");
   row.insertCell().appendChild(jitsiLink);
    }
  } catch {
    const cell = seshTable.insertRow(-1).insertCell();
    cell.textContent = 'Existing session storage is currently unavailable. Historical sessions are retained for recovery.';
    cell.setAttribute('role', 'status');
  }
}

seshList();







