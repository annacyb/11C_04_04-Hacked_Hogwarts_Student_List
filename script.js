"use strict";

window.addEventListener("DOMContentLoaded", start)

let allStudents = []

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
    order: 'asc'  // asc - ascending (A-Z), desc - descending (Z-A)
}

// creating object prototype
const Student = {
    firstName: "x",
    lastName: "x",
    middleName: "x",
    nickName: "x",
    imageFilename: "x",
    house: "x",
    houseColor: "",
    gender: "x",
    status: "x"
}

async function start() {
    setEventListeners()
    await loadJSON()
    // hack to wait for loadJSON to finish fetching data
    setTimeout(sort, 999)
    setTimeout(displayList, 1000)
}

// Event Listeners

function setEventListeners() {
    // event listeners on: sort icons, filter items, buttons, table elements
    setup_sort_listeners()
    setup_search_listener()
    setup_filters_listeners()
    setup_reset_button_listener()
    // setup_students_details_listener()
}

function setup_sort_listeners() {
    const sortName = document.querySelector("#sort_by-name")
    const sortLastname = document.querySelector("#sort_by-lastname")
    const sortHouseName = document.querySelector("#sort_by-house_name")
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

// Data modification functions 

function changeSorting(value) {
    // change global variable
    sortBy.column = value
    if (sortBy.order == 'asc') {
        sortBy.order = 'desc'
    } else {
        sortBy.order = 'asc'
    }
    sort()
    displayList()
}

function sort() {
    console.log('sort')
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
    console.log('search')
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
     console.log('filter')
    let searchInput = document.querySelector("#search_name")
    searchInput.value = ``

    toggle_click(filter_button.children[0])

    // save (ONE) selected filter element
    let type_name = filter_button.children[0].children[1].textContent
    const nameSplit = type_name.split(" ")
    const selectedElementsName = nameSplit[0]
    
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
    filterData("status", currentFilters.status)
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
    if(values.length > 0) {
        allStudents = allStudents.filter(student => {
            // values - selected filters
            // student[column] - student's one value from category from filters
            return values.includes(student[column])
        })
    }
}

async function reset_filter_data() {
    console.log('reset')
    display_all_filters_as_unselected()
    
    currentFilters.house = []
    currentFilters.status = []
    currentFilters.responsibility = []
    currentFilters.blood = []

    await loadJSON()
    sort()
    displayList()
}

// Data loading functions

async function loadJSON() {
    await fetch("https://petlatkea.dk/2021/hogwarts/students.json")
        .then( response => response.json() )
        .then( jsonData => {
            //
            // when loaded, prepare objects and stats
            allStudents = []
            prepareObjects( jsonData )
            resetStats()
            prepareStats()
            showStats()
            console.log('load Finish')
        })
}

function prepareObjects(jsonData) {
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

        // TO DO MORE FILTERS NUMBERS
    })
}

function countStatsForFilters(student, category, filter) {
    if (student[category] == filter) {
        statsStudents[category][filter] = statsStudents[category][filter] + 1
    }
}

// View functions

function displayList() {
    // clear the list
    document.querySelector("#students_list").innerHTML = ""

    // build a new list
    allStudents.forEach( displayStudents )
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

    // TO DO - responsibility + icon
    // TO DO - status active/expelled + icon

    // clone.querySelector("[data-field=nickName]").textContent = student.nickName
    // clone.querySelector("[data-field=gender]").textContent = student.gender

    // append clone to list
    document.querySelector("#students_list").appendChild( clone )
}

function showStats() {
    // reset number displayed
    document.querySelector("#students_found").textContent = "Students found: "

    // display number of students in list
    document.querySelector("#students_found").textContent = "Students found: " + allStudents.length
    
    // display numbers in filters
    document.querySelector(".filter-Gryffindor li p").textContent = "Gryffindor (" + statsStudents.house.Gryffindor + ")"
    document.querySelector(".filter-Slytherin li p").textContent = "Slytherin (" + statsStudents.house.Slytherin + ")"
    document.querySelector(".filter-Hufflepuff li p").textContent = "Hufflepuff (" + statsStudents.house.Hufflepuff + ")"
    document.querySelector(".filter-Ravenclaw li p").textContent = "Ravenclaw (" + statsStudents.house.Ravenclaw + ")"

    // TO DO MORE FILTERS
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