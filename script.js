"use strict";

window.addEventListener("DOMContentLoaded", start)

let allStudents = []
let expelStudents = []
let inquStudents = []
let prefStudents = []
// addditional list for quidditch players
let quidStudents = []

const currentFilters = {
    house: [],
    status: [],
    responsibility: [],
    blood: [],
}

const statsStudents = {
    house: {
        Gryffindor: 0,
        Slytherin: 0,
        Hufflepuff: 0,
        Ravenclaw: 0
    },
    status: {
        Active: 0,
        Expelled: 0
    },
    responsibility: {
        Prefect: 0,
        Inquisitorial: 0,
        Quidditch: 0
    },
    blood: {
        Pure: 0,
        Half: 0,
        Mud: 0
    }
}

const filterBy = {
    column: '',
    value: ''
}

const sortBy = {
    column: 'firstName',
    order: 'asc',  // asc - ascending (A-Z), desc - descending (Z-A)
    previousSortColumn: 'firstName'
}

// creating object prototype
const Student = {
    firstName: "-",
    lastName: "-",
    middleName: "-",
    nickName: "-",
    imageFilename: "-",
    house: "-",
    houseColor: "-",
    gender: "-",
    // status: "Active",
    blood: "-",
    expelled: false,
    Prefect: false,
    Squad: false,
    Quidditch: false,
    id: 0
}

async function start() {
    await loadJSON()
    sort()
    displayList()
    setEventListeners()
}

// Event Listeners

function setEventListeners() {
    // event listeners on: sort icons, filter items, buttons, table elements
    setup_sort_listeners()
    setup_search_listener()
    setup_filters_listeners()
    setup_reset_button_listener()
    // event listener for students' details is in displayList function as it changes dynamically
    setup_pop_up_back_button_listener()
}

function setup_sort_listeners() {
    const sortName = document.querySelector("#sort_by-firstName")
    const sortLastname = document.querySelector("#sort_by-lastName")
    const sortHouseName = document.querySelector("#sort_by-house")

    sortName.addEventListener("click", changeSorting.bind(null, "firstName"))
    sortLastname.addEventListener("click", changeSorting.bind(null, "lastName"))
    sortHouseName.addEventListener("click", changeSorting.bind(null, "house"))
}

function setup_filters_listeners() {

    const container_filters = document.getElementById("filter_by")

    const house_container = container_filters.getElementsByClassName("filter-collection_elements")[0]
    const status_container = container_filters.getElementsByClassName("filter-collection_elements")[1]
    const responsibility_container = container_filters.getElementsByClassName("filter-collection_elements")[2]
    const blood_container = container_filters.getElementsByClassName("filter-collection_elements")[3]
    
    
    // add event listeners for multiple options
    // Solution with [...something] taken from StachOverflow title "Why is forEach not working for children?"
    let house_options = [...house_container.children] //to create a list with children elements
    house_options.forEach((container) => {
        container.addEventListener("click", click_filter_element.bind(null, container, "house"))
    })

    let status_options = [...status_container.children] //to create a list with children elements
    status_options.forEach((container) => {
        container.addEventListener("click", click_filter_element.bind(null, container, "status"))
    })

    let responsibility_options = [...responsibility_container.children] //to create a list with children elements
    responsibility_options.forEach((container) => {
        container.addEventListener("click", click_filter_element.bind(null, container, "responsibility"))
    })

    let blood_options = [...blood_container.children] //to create a list with children elements
    blood_options.forEach((container) => {
        container.addEventListener("click", click_filter_element.bind(null, container, "blood"))
    })


}

function setup_search_listener() {
    document.querySelector("#search_name").addEventListener("input", searchStudent)
}

function setup_reset_button_listener() {
    const resetButton = document.querySelector("#reset_button")
    resetButton.addEventListener("click", reset_filter_data)
}

function setup_pop_up_back_button_listener(){
    document.querySelector(".pop_up-button-back").addEventListener("click", function() {
        document.querySelector("#pop_up-wrapper").classList.add("hidden")
        // removing top gradient class of pop up
        const gradientElement = document.querySelector("#pop_up-wrapper").children[1].children[0]
        gradientElement.className = ''
        gradientElement.classList.add("pop_up-gradient-top")
    })
}

// Data modification functions 

function changeSorting(column) {
    // saving previous sorting column for changing design of it
    sortBy.column = sortBy.previousSortColumn
    // change global variable
    sortBy.column = column
    if (sortBy.order == 'asc') {
        sortBy.order = 'desc'
        changeDisplaySorting(column, "desc")
    } else {
        sortBy.order = 'asc'
        changeDisplaySorting(column, "asc")
    }
    sort()
    displayList()
}

function sort() {
    // sort data
    function CompareNames(a, b) {
        // this part reverses comparison (it's enough to change signs of return)
        let ordering = -1
        if (sortBy.order == 'desc') {
            ordering = 1
        }
        // this part just sorts :)
        if(a[sortBy.column] < b[sortBy.column]) {
            return ordering
        }
        else if (a[sortBy.column] === b[sortBy.column]) {
            if (a.type < b.type) {
                return ordering
            }
        }
        else {
            return ordering * -1
        }
    }
    allStudents.sort(CompareNames)
}

async function searchStudent() {
    // reset filters and students data
    await loadJSON()

    // apply filters
    filterData("house", currentFilters.house)
    filterData("status", currentFilters.status)
    filterData("responsibility", currentFilters.responsibility)
    filterData("blood", currentFilters.blood)


    let searchInput = document.querySelector("#search_name").value.toLowerCase()
    
    let found = []
    allStudents.forEach(student => {
        let name = student.firstName.toLowerCase()
        let last = student.lastName.toLowerCase()
        let middle = student.middleName.toLowerCase()

        let a = name.includes(searchInput)
        let b = last.includes(searchInput)
        let c = middle.includes(searchInput)

        if(a || b || c){
            found.push(student)
        }

    })

    allStudents = found
    sort()
    resetStats()
    prepareStats()
    showStats()
    displayList()
}

async function click_filter_element(filter_button, type) {
     // reset search input
    let searchInput = document.querySelector("#search_name")
    searchInput.value = ``

    toggle_click(filter_button.children[0])

    // save (ONE) selected filter element
    let type_name = filter_button.children[0].children[1].textContent
    const nameSplit = type_name.split(" ")
    let selectedElementsName = nameSplit[0]

    // modify selectedName for status filter
    if (selectedElementsName == 'Active') {
        selectedElementsName = false  // set expelled to false
    }
    if (selectedElementsName == 'Expelled') {
        selectedElementsName = true
    }

    // update filters
    if (currentFilters[type].includes(selectedElementsName)) {
        // removes selected filter's element name from the list if it already exist
        currentFilters[type] = currentFilters[type].filter(i => i !== selectedElementsName)
    } else {
        // adds selected filter's element name to the list if it does not already exist
        currentFilters[type].push(selectedElementsName)
    }
    // Run filter on (ALL) selected filters
    await loadJSON()

    filterData("house", currentFilters.house)
    filterData("expelled", currentFilters.status)
    filterData("responsibility", currentFilters.responsibility)
    filterData("blood", currentFilters.blood)

    // changeFiltering(type, selectedElementsName)

    sort()
    resetStats()
    prepareStats()
    showStats()
    displayList()
}

function filterData(column, values) {
    if (values.length > 0) {
        allStudents = allStudents.filter(student => {
            // values - selected filters
            // student[column] - student's one value from category from filters
            return values.includes(student[column])
        })
    }
}

async function reset_filter_data() {
    display_all_filters_as_unselected()
    
    currentFilters.house = []
    currentFilters.status = []
    currentFilters.responsibility = []
    currentFilters.blood = []

    await loadJSON()
    sort()
    displayList()
}

function changeDetailsForPopUp(student) {

   // change data, change colors for pop up details
   document.querySelector(".pop_up-image").src = student.imageFilename
   document.querySelector(".pop_up-image").addEventListener("error", () => {
    document.querySelector(".pop_up-image").src = './images/no-photo.png'
})
    // changing first name
   const popUpElement = document.querySelector("#pop_up-wrapper")
   document.querySelector("#pop_up-main-name").textContent = student.firstName + " " + student.middleName + " " + student.lastName
   document.querySelector("#pop_up-value-name").textContent = student.firstName

   // changing middle name
   document.querySelector("#pop_up-value-middlename").textContent = student.middleName
   if(student.middleName.length == 0){
    document.querySelector("#pop_up-value-middlename").textContent = "-"
   }

   // changing nick name
   document.querySelector("#pop_up-value-nickname").textContent = student.nickName
   if(student.middleName.length == 0){
    document.querySelector("#pop_up-value-nickname").textContent = "-"
   }
   
   // changing last name, gender, blood
   document.querySelector("#pop_up-value-surname").textContent = student.lastName
   document.querySelector("#pop_up-value-gender").textContent = student.gender
   document.querySelector("#pop_up-value-blood").textContent = student.blood

   // changing status
   if (student.expelled == false) {
    document.querySelector("#pop_up-value-status").textContent = "Active"
    document.querySelector("#button-expel").classList.remove("pop_up-button-expel-inactive")
    document.querySelector("#button-expel").classList.add("pop_up-button-expel-active")
   } else {
    document.querySelector("#pop_up-value-status").textContent = "Expelled"
    document.querySelector("#button-expel").classList.remove("pop_up-button-expel-active")
    document.querySelector("#button-expel").classList.add("pop_up-button-expel-inactive")
   }
   //

   // changing house name and the symbol of house
   document.querySelector("#pop_up-value-house").textContent = student.house
   document.querySelector("#pop_up-house-symbol").src = `./images/houses/hogwarts-house-${student.house}2.png`

   // changing gradient at the top of pop up
   document.querySelector("#pop_up").children[0].classList.add(`pop_up-gradient-top-${student.house}`)
 
   // changing responsibility container
   // resetting responsibility icons and texts - adding hidden class
   document.querySelector("#pop_up-responsibilities-icons").children[0].classList.add("hidden")
   document.querySelector("#pop_up-responsibilities-icons").children[1].classList.add("hidden")
   document.querySelector("#pop_up-responsibilities-icons").children[2].classList.add("hidden")
   document.querySelector("#pop_up-icon-Prefect").classList.add("hidden")
   document.querySelector("#pop_up-icon-Inquisitorial_Squad").classList.add("hidden")
   document.querySelector("#pop_up-icon-Quidditch_player").classList.add("hidden")
   document.querySelector("#no-responsibilities-text").classList.add("hidden")
   document.querySelector("#pop_up-responsibilities-icons").classList.remove("pop_up-no-responsibilities")

   // changing container's elements
   if (student.Prefect === true) {
    document.querySelector("#pop_up-responsibilities-icons").children[0].classList.remove("hidden")
    document.querySelector("#pop_up-icon-Prefect").classList.remove("hidden")
   }
   if (student.Squad === true) {
    document.querySelector("#pop_up-responsibilities-icons").children[1].classList.remove("hidden")
    document.querySelector("#pop_up-icon-Inquisitorial_Squad").classList.remove("hidden")
    }
    if (student.Quidditch === true) {
        document.querySelector("#pop_up-responsibilities-icons").children[2].classList.remove("hidden")
        document.querySelector("#pop_up-icon-Quidditch_player").classList.remove("hidden")
    }

    if ((student.Prefect === false) && (student.Squad === false) && (student.Quidditch === false)) {
    document.querySelector("#no-responsibilities-text").classList.remove("hidden")
    document.querySelector("#pop_up-responsibilities-icons").classList.add("pop_up-no-responsibilities")
    }

   // TO DO - CHANGING BUTTONS

   // Expel button
   // remove event listeners

   // add event listeners on buttons
   // NEW NEW
//    console.log("TRULU ", student.expelled)
//    if (student.expelled == false)
//    document.querySelector("#button-expel").addEventListener("click", () => {
//         student.expelled == true
//         console.log(student.expelled)
// })

   
   // unhide pop up
   popUpElement.classList.remove("hidden")
}

// Data loading functions

async function loadJSON() {
    
    const response = await fetch("https://petlatkea.dk/2021/hogwarts/students.json")
    const jsonData = await response.json()
    const responseBlood = await fetch("https://petlatkea.dk/2021/hogwarts/families.json")
    const jsonDataBlood = await responseBlood.json()
  
    // when loaded, prepare data objects
    allStudents = []
    prepareObjects(jsonData, jsonDataBlood)

    //when loaded prepare stats with numbers of students
    resetStats()
    prepareStats()
    showStats()

}

function prepareObjects(jsonData, jsonDataBlood) {
    jsonData.forEach( jsonObject => {
        
        // creating an object from the prototype
        const student = Object.create(Student)

        // EDITING OBJECT PROTOTYPE
        // splitting name to words
        jsonObject.fullname = jsonObject.fullname.trim()
        let nameSplit = jsonObject.fullname.split(" ")
        student.firstName = makeFirstLetterUppercase(nameSplit[0])

        // checks if a student has a last name
        if (nameSplit.length > 1) {
            student.lastName = makeFirstLetterUppercase(nameSplit[nameSplit.length - 1])
        }
        else {
            student.lastName = "-"
        }

        student.middleName = getMiddleName(nameSplit)
        student.nickName = getNickName(nameSplit)

        // checks exception of image file naming
        if (student.lastName.includes("Finch")){
            student.imageFilename = "./images/students-images/fletchley_j.png"
        }
        else {
            student.imageFilename = getProfileImage(student.firstName, student.lastName)
        }

        student.house = makeFirstLetterUppercase(jsonObject.house)
        student.houseColor = createHouseColor(student.house)
        student.gender = makeFirstLetterUppercase(jsonObject.gender)

        // add random ID (student identifier)
        student.id = Math.round(Math.random() * 10000)

        // for setting student.blood
        setBloodStatus(jsonDataBlood, student)

        // As default for all students expelled == false
        student.expelled = Student.expelled

        // expelling one of the students
        if (student.firstName.includes("Leanne")){
            student.expelled = true
        }


        // NEW
        // TO DELETE AFTER - examples of students with different responsibilities
        if (student.firstName.includes("Ronald")){
            student.Quidditch = true
        }

        if (student.firstName.includes("Harry")){
            student.Quidditch = true
            student.Prefect = true
        }

        if (student.firstName.includes("Draco")){
            student.Quidditch = true
            student.Prefect = true
            student.Squad = true
        }
        
        // TO DO RESPONSIBILITY

        allStudents.push(student)
    })
}

function makeFirstLetterUppercase(input) {
    input = input.trim()
    input = input.toLowerCase()
    let firstCapitalLetter = input.substring(0,1).toUpperCase()
    let result = ""

    // condition for when last name has two parts seperated by "-"
    if (input.includes("-")) {
        const hyphenIndex = input.indexOf("-")
        const secondLastname = input.substring((hyphenIndex + 1), (hyphenIndex + 2) ).toUpperCase() + input.substring((hyphenIndex + 2) )
        result = firstCapitalLetter + input.substring(1, hyphenIndex ) + "-" + secondLastname
    }
    else  {
        result = firstCapitalLetter + input.substring(1)
    }
    return result
}

function createHouseColor(houseName) {
    let houseColorHEX  = ""
    if (houseName == "Gryffindor") {
        houseColorHEX = "#821E29"
    }
    if (houseName == "Slytherin") {
        houseColorHEX = "#165142"
    }
    if (houseName == "Hufflepuff") {
        houseColorHEX = "#F3C86E"
    }
    if (houseName == "Ravenclaw") {
        houseColorHEX = "#5B9BC6"
    }
    return houseColorHEX
}

function getMiddleName(input) {
    let middleName = ""
    // checks if full name is more than 2 words
    if (input.length > 2) {
        middleName = input[1]
        if (!middleName.includes(`"`)) {
            middleName = makeFirstLetterUppercase(middleName)
        }
        // for case when middle word is a nick name
        else {
            middleName = ""
        }
    }
    else {
        middleName = ""
    }
    return middleName
}

function getNickName(input) {
    let nickName = ""
    // checks if full name is more than 2 words
    if (input.length > 2) {
        nickName = input[1]
        if (nickName.includes(`"`)) {
            nickName = nickName.substring(0,1) + nickName.substring(1,2).toUpperCase() + nickName.substring(2)
        }
        else {
            // for case when middle word is a middle name
            nickName = "-"
        }
    }
    else {
        nickName = "-"
    }
    return nickName
}

function getProfileImage(firstName, lastName) {
    let imageFilename
    // checks exeption of naming - for Parvati and Padma Patil 
    if (lastName == "Patil") {
        imageFilename = lastName.toLowerCase() + "_" + firstName.toLowerCase() + ".png"
    }
    else {
        imageFilename = lastName.toLowerCase() + "_" + firstName.substring(0,1).toLowerCase() + ".png"
    }
    let imagePath = `./images/students-images/${imageFilename}`
    return imagePath
}

function setBloodStatus(jsonDataBlood, student){
        if (jsonDataBlood.half.includes(student.lastName)) {
          student.blood = "Half"
        } else if (jsonDataBlood.pure.includes(student.lastName)) {
          student.blood = "Pure"
        }
        // addittional rule so that there will be no Mud-bloods in Slytherin
        else if (student.house == "Slytherin") {
            student.blood = "Half"
        }
        else {
          student.blood = "Mud"
        }
}

// Stats functions

function resetStats() {
    statsStudents.house.Gryffindor = 0
    statsStudents.house.Slytherin = 0
    statsStudents.house.Hufflepuff = 0
    statsStudents.house.Ravenclaw = 0

    statsStudents.status.Active = 0
    statsStudents.status.Expelled = 0

    statsStudents.responsibility.Prefect = 0
    statsStudents.responsibility.Inquisitorial = 0
    statsStudents.responsibility.Quidditch = 0

    statsStudents.blood.Pure = 0
    statsStudents.blood.Half = 0
    statsStudents.blood.Mud = 0
}

function prepareStats() {
    allStudents.forEach (student => {
        countStatsForFilters(student, "house", "Gryffindor")
        countStatsForFilters(student, "house", "Slytherin")
        countStatsForFilters(student, "house", "Hufflepuff")
        countStatsForFilters(student, "house", "Ravenclaw")

        countStatsForFilters(student, "expelled", student.expelled)

        countStatsForFilters(student, "blood", "Pure")
        countStatsForFilters(student, "blood", "Half")
        countStatsForFilters(student, "blood", "Mud")
        // TO DO MORE FILTERS NUMBERS
    })
}

function countStatsForFilters(student, category, filter) {
    // for active or expelled students category
    if ((category == "expelled") && (filter === false)) {
        statsStudents.status.Active = statsStudents.status.Active + 1
    }
    else if ((category == "expelled") && (filter === true)) {
        statsStudents.status.Expelled = statsStudents.status.Expelled + 1
    }
    // for all other categories
    else if (student[category] == filter) {
        statsStudents[category][filter] = statsStudents[category][filter] + 1
    }
    else {
        console.log("Else in countStatsForFilters function")
    }
}


// View functions

function displayList() {
    // clear the list
    document.querySelector("#students_list").innerHTML = ""

    // build a new list
    allStudents.forEach(displayStudents)

    console.log("All students: ", allStudents)
    console.log("Stats: ", statsStudents)
}

function displayStudents(student) {
    // create clone
    const clone = document.querySelector("template.student_list-element").content.cloneNode(true)
    
    // set clone data    
    const image = clone.querySelector(".student_photo")
    image.src = student.imageFilename
    image.alt = student.firstName + "'s photo"
    // checks if image exists
    image.addEventListener("error", () => {
        image.src = './images/no-photo.png'
    })
    
    clone.querySelector("p.student_name").textContent = student.firstName + " " + student.middleName
    clone.querySelector("p.student_last_name").textContent = student.lastName
    clone.querySelector("div.house-circle").classList.add("circle_" + student.house)
    clone.querySelector("p.student_house_name").textContent = student.house

    // NEWLY
    // Responsibility column changing - icons and texts for each student that has responsibility

    if (student.Prefect === true){
        clone.querySelector(".responsibility-icons").children[0].children[0].classList.remove("hidden")       
    }
    if (student.Squad === true){
        clone.querySelector(".responsibility-icons").children[0].children[1].classList.remove("hidden")       
    }
    if (student.Quidditch === true){
        clone.querySelector(".responsibility-icons").children[0].children[2].classList.remove("hidden")       
    }





    // Status changing active/expelled text, icon and style in list of students
    const iconStatusTableElement = clone.querySelector("img.element-status")
    if (student.expelled == false){
        iconStatusTableElement.parentElement.parentElement.classList.remove("table_element-expelled")
        iconStatusTableElement.src = "./images/icons/icon-active_student.png"
        iconStatusTableElement.nextSibling.textContent = "Active"
    } else {
        iconStatusTableElement.src = "./images/icons/icon-expelled_student.png"
        iconStatusTableElement.nextSibling.textContent = "Expelled"

        // changing style of whole container with student's list info
        iconStatusTableElement.parentElement.parentElement.classList.add("table_element-expelled")
    }

    // clone.querySelector("[data-field=nickName]").textContent = student.nickName
    // clone.querySelector("[data-field=gender]").textContent = student.gender

    // append clone to list
    document.querySelector("#students_list").appendChild(clone)

    // add event listeners to every element in a list of students
    let allStudentsDivs = [...document.querySelector("#students_list").children]
    let lastStudentDiv = allStudentsDivs.pop()  // last element of list is my current "clone"
    lastStudentDiv.addEventListener("click", changeDetailsForPopUp.bind(null, student))
}

function showStats() {
    // reset number displayed
    document.querySelector("#students_found").textContent = "Students found: "

    // display number of students in list
    document.querySelector("#students_found").textContent = "Students found: " + allStudents.length
    
    // display numbers in filters

    // Filter category - House name
    document.querySelector(".filter-Gryffindor li p").textContent = "Gryffindor (" + statsStudents.house.Gryffindor + ")"
    document.querySelector(".filter-Slytherin li p").textContent = "Slytherin (" + statsStudents.house.Slytherin + ")"
    document.querySelector(".filter-Hufflepuff li p").textContent = "Hufflepuff (" + statsStudents.house.Hufflepuff + ")"
    document.querySelector(".filter-Ravenclaw li p").textContent = "Ravenclaw (" + statsStudents.house.Ravenclaw + ")"

    // Filter category - Status
    document.querySelector(".filter-Active_students li p").textContent = "Active (" + statsStudents.status.Active + ")"
    document.querySelector(".filter-Expelled_students li p").textContent = "Expelled (" + statsStudents.status.Expelled + ")"

    // Filter category - Responsibility
    // TO DO

    // Filter category - Blood type
    document.querySelector(".filter-Pure-blood li p").textContent = "Pure (" + statsStudents.blood.Pure + ")"
    document.querySelector(".filter-Half-blood li p").textContent = "Half (" + statsStudents.blood.Half + ")"
    document.querySelector(".filter-Mud-blood li p").textContent = "Mud (" + statsStudents.blood.Mud + ")"

}

function toggle_click(button) {

    // changes only the visual style nothing else
    if (button.children[0].classList.contains("circle_inactive") == true) {
        button.children[0].classList.remove("circle_inactive")
        button.children[0].classList.add("circle_active")
        button.classList.add("li_item-active")
    } else {
        button.children[0].classList.remove("circle_active")
        button.children[0].classList.add("circle_inactive")
        button.classList.remove("li_item-active")
    }
}

function display_all_filters_as_unselected() {
    // looping throught currentFilters elements and making elements look unselected

    const filtersContainer = document.querySelector("#filter_by")
    
    // Solution taken from StachOverflow title "Why is forEach not working for children?"
    const filtersContainerChildren = [...filtersContainer.children]
    filtersContainerChildren.forEach(collection => {
        let collectionClasses = [...collection.classList]
        if (collectionClasses.includes("filter-collection_elements")) {
            const collectionChildren = [...collection.children]
            collectionChildren.forEach(element => {
                cleanFilterViewSelection(element)
            })
        }
    })
}

function cleanFilterViewSelection(selectedElement) {
    const eachFilterOptionContainer = selectedElement.children[0]
    eachFilterOptionContainer.classList.remove("li_item-active")
    eachFilterOptionContainer.children[0].classList.remove("circle_active")
    eachFilterOptionContainer.children[0].classList.add("circle_inactive")
}

function changeDisplaySorting(column, order) {
    // change display of previous sort header elements
    const previousTextHeader = document.querySelector(`#sort_by-${sortBy.previousSortColumn}`).getElementsByTagName("p")[0]
    previousTextHeader.classList.remove("text-active_sorting")
    document.querySelector(`#sort_by-${sortBy.previousSortColumn}`).lastElementChild.src = "./images/icons/sort-icon.png"

    // change display of current sort header elements
    const textHeader = document.querySelector(`#sort_by-${column}`).getElementsByTagName("p")[0]

    if (order == "asc") {
        document.querySelector(`#sort_by-${column}`).lastElementChild.src = "./images/icons/sort-icon-asc.png"
        textHeader.classList.remove("text-active_sorting")
        textHeader.classList.add("text-active_sorting")

        // changng values in global sortBy object
        sortBy.previousSortColumn = column
    }
    else if (order == "desc") {
        document.querySelector(`#sort_by-${column}`).lastElementChild.src = "./images/icons/sort-icon-desc.png"
        textHeader.classList.remove("text-active_sorting")
        textHeader.classList.add("text-active_sorting")
    
        // changng values in global sortBy object
        sortBy.previousSortColumn = column
    }
    else {
        console.log("changingDisplaySorting - 3rd option")
    }
    sort()
    displayList()
}