let addbtn = document.querySelector('.add-btn');
let removebtn = document.querySelector('.remove-btn');
let modalCont = document.querySelector(".modal-cont")
let mainCont = document.querySelector(".main-cont")
let addFlag = false;
let removeFlag = false;
let ticketsArr = []


lockClass = "fa-lock"
unlockClass = "fa-lock-open"

let textAreaCont = document.querySelector(".textarea-cont")
let colors = ["lightpink", "lightblue", "lightgreen", "black"]
let allPriorityColors = document.querySelectorAll(".priority-color")
let modalPriorityColor = colors[colors.length-1]
let toolboxColors = document.querySelectorAll(".color")


if(localStorage.getItem("jira_tickets")){
    // Retrieve and display tickets

    ticketsArr = JSON.parse(localStorage.getItem("jira_tickets"))
    ticketsArr.forEach((ticketObj)=>{
        createTicket(ticketObj.ticketColor,ticketObj.ticketTask,ticketObj.ticketId)
    })
}

for(let i=0; i<toolboxColors.length;i++){
    toolboxColors[i].addEventListener("click",(e)=>{
        let currentToolBoxColor = toolboxColors[i].classList[0]

        let filteredTickets = ticketsArr.filter((ticketObj, idx)=>{
            return currentToolBoxColor === ticketObj.ticketColor
        })

        // remove previous tickets
        let allTicketsCont = document.querySelectorAll(".ticket-cont")
        for(let i =0; i<allTicketsCont.length; i++){
             allTicketsCont[i].remove();
        }

        // diplay new filtered tickets
        filteredTickets.forEach((ticketObj,idx)=>{
            createTicket(ticketObj.ticketColor, ticketObj.ticketTask, ticketObj.ticketId)
        })
    })

    toolboxColors[i].addEventListener("dblclick", (e)=>{
        let allTicketsCont = document.querySelectorAll(".ticket-cont")
        for(let i =0; i<allTicketsCont.length; i++){
             allTicketsCont[i].remove();
        }

        ticketsArr.forEach((ticketObj, idx)=>{
            createTicket(ticketObj.ticketColor, ticketObj.ticketTask, ticketObj.ticketId)
        })
    })

}



// Listener for modal priority coloring
allPriorityColors.forEach((colorElem, idx)=>{
    colorElem.addEventListener("click", (e)=>{
        allPriorityColors.forEach((priorityColorElem, idx)=>{
            priorityColorElem.classList.remove("border")
        })
        colorElem.classList.add("border")

        modalPriorityColor = colorElem.classList[0]
    })
})



addbtn.addEventListener("click", (e)=>{
    // Create new modal and genertate ticket

    //AddFlag, true -> Modal Display
    // AddFlag, False -> Modal None
    addFlag = !addFlag;
    if(addFlag){
        modalCont.style.display = "flex";
    }else{
        modalCont.style.display= "none";
    }
})
removebtn.addEventListener("click", (e)=>{
    removeFlag = !removeFlag
})
modalCont.addEventListener("keydown", (e)=>{
    let key = e.key;
    if(key === "Shift") {
        createTicket(modalPriorityColor,textAreaCont.value);
        addFlag= false;
        setModalToDefault()
    }
})

function createTicket(ticketColor, ticketTask, ticketId){
    let id = ticketId || shortid()
    let ticketCont = document.createElement('div');
    ticketCont.setAttribute('class', "ticket-cont");
    ticketCont.innerHTML=`
    <div class="ticket-color ${ticketColor}"></div>
    <div class="ticket-id">#${id}</div>
    <div class="task-area">${ticketTask}</div>
    <div class="ticket-lock">
                <i class="fas fa-lock"></i>
    </div>
    `;
    mainCont.appendChild(ticketCont);
    // Create object of ticket and add to array
    if(!ticketId){
        ticketsArr.push({ticketColor, ticketTask, ticketId: id})
        localStorage.setItem("jira_tickets", JSON.stringify(ticketsArr));
    }  
        

    handleRemoval(ticketCont,id)
    handleLock(ticketCont,id)
    handleColor(ticketCont,id)
}

function handleRemoval(ticket,id){

    ticket.addEventListener("click",(e)=>{

        if(!removeFlag) return
            // DB removal
            let idx = getTicketIndex(id);
            ticketsArr.splice(idx,1)
            let strTicketsArr = JSON.stringify(ticketsArr)
            localStorage.setItem("jira_tickets", strTicketsArr)
            ticket.remove(); //UI removal
    })
}

function handleLock(ticket,id){
    let ticketLockElem = ticket.querySelector(".ticket-lock")
    let ticketLock = ticketLockElem.children[0]
    let TaskArea = ticket.querySelector(".task-area")
    ticketLock.addEventListener("click", (e)=>{

        let ticketIdx = getTicketIndex(id)

        if(ticketLock.classList.contains(lockClass)){
            ticketLock.classList.remove(lockClass)
            ticketLock.classList.add(unlockClass)
            TaskArea.setAttribute("contenteditable", "true")
        }else{
            ticketLock.classList.remove(unlockClass)
            ticketLock.classList.add(lockClass)
            TaskArea.setAttribute("contenteditable", "false")
        }

        // Modify data in local storage (Ticket Task)
        ticketsArr[ticketIdx] = TaskArea.innerText;
        localStorage.setItem("jira_tickets", JSON.stringify(ticketsArr))
    })
}

function handleColor(ticket,id){
    let ticketColor = ticket.querySelector(".ticket-color")
    ticketColor.addEventListener("click", (e)=>{
        let currentTicketColor = ticketColor.classList[1]
        let ticketIdx = getTicketIndex(id)

        // get ticket index
        let currentTicketColorIdx = colors.findIndex((color)=>{
            return currentTicketColor === color
        })
        currentTicketColorIdx++;
        let newTicketColorIdx = currentTicketColorIdx%colors.length
        let newTicketColor = colors[newTicketColorIdx]
        ticketColor.classList.remove(currentTicketColor)
        ticketColor.classList.add(newTicketColor)
        
        // modify data in local storage

        ticketsArr[ticketIdx].ticketColor = newTicketColor
        localStorage.setItem("jira_tickets", JSON.stringify(ticketsArr))
    })
}


function getTicketIndex(id){
    let ticketIdx = ticketsArr.findIndex((ticketObj)=>{
        return ticketObj.ticketId === id;
    })
    return ticketIdx
}
function setModalToDefault(){
    modalCont.style.display = 'none'
    textAreaCont.value = ''
    modalPriorityColor = colors[colors.length-1]
    allPriorityColors.forEach((priorityColorElem, idx)=>{
        priorityColorElem.classList.remove("border")
    })
    allPriorityColors[allPriorityColors.length-1].classList.add("border")
}