"use strict";

window.addEventListener("DOMContentLoaded", start)

const allStudents = []
const statStudents = {
    house: {
        griffindor: 0,
        slytherin: 0,
        hufflepuff: 0,
        ravenclaw: 0
    },
    status: {
        active: 0,
        expelled: 0
    },
    responsibility: {
        prefect: 0,
        inquisitor: 0,
        quiddich: 0
    },
    blood: {
        pure: 0,
        half: 0,
        mud: 0
    }
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
    gender: "x"
}

function start( ) {
    console.log("ready")
    setEventListeners()
    loadJSON()
}

function setEventListeners() {
    // event listeners on: sort icons, filter items, buttons, table elements
}


function loadJSON() {
    fetch("https://petlatkea.dk/2021/hogwarts/students.json")
    .then( response => response.json() )
    .then( jsonData => {
        // when loaded, prepare objects
        prepareObjects( jsonData )
        prepareStats()
    })
}

function prepareObjects( jsonData ) {
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
        // console.log(student)
    })
    
    displayList()
    displayNumberOfResults()
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
        houseColorHEX = "#8C2631"
    }
    if (houseName == "Slytherin") {
        houseColorHEX = "#165142"
    }
    if (houseName == "Hufflepuff") {
        houseColorHEX = "#F3C86E"
    }
    if (houseName == "Ravenclaw") {
        houseColorHEX = "#5B8BC6"
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



function prepareStats() {
    allStudents.forEach (student => {
        let gryffindorStudents = countNumbersForFilters(student, "Gryffindor")
        let slytherinStudents = countNumbersForFilters(student, "Slytherin")
        let hufflepuffStudents = countNumbersForFilters(student, "Hufflepuff")
        let RavenclawStudents = countNumbersForFilters(student, "Ravenclaw")
    })
}

function countNumbersForFilters(student, filter) {
    if (student.house === filter) {
        console.log("HOUSE", filter)
    }
}


// VIEW

function displayList() {
    // clear the list
    document.querySelector("#students_list").innerHTML = ""

    // build a new list
    allStudents.forEach( displayStudents )
}

function displayStudents( student ) {
    // create clone
    const clone = document.querySelector("template.student_list-element").content.cloneNode(true)
    
    // set clone data

    //TO DO - no-photo



    // if (student.imageFilename == "./images/students-images/-_l.png") {
    //     clone.querySelector(".student_photo").src = "./images/no-photo.png"
    // }

    // console.log(student.imageFilename)
    
    const image = clone.querySelector(".student_photo")
    image.src = student.imageFilename
    image.alt = student.firstName + "'s photo"
    // checks if image exists
    image.addEventListener("error", () => {
        image.src = './images/no-photo.png'
    });
    
    clone.querySelector("p.student_name").textContent = student.firstName + " " + student.middleName
    clone.querySelector("p.student_last_name").textContent = student.lastName
    clone.querySelector("div.house-circle").classList.add("circle_" + student.house)
    clone.querySelector("p.student_house_name").textContent = student.house

    // TO DO - responsibility + icon
    // TO DO - status active/expelled + icon
    // TO DO - a href link
    // myCopy.querySelector("#productlistLink").href = `../product-view.html?id=${data._id}`;

    // clone.querySelector("[data-field=nickName]").textContent = student.nickName
    // clone.querySelector("[data-field=gender]").textContent = student.gender

    // append clone to list
    document.querySelector("#students_list").appendChild( clone )
}

function displayNumberOfResults() {
    // display number of students in list
    document.querySelector("#students_found").textContent = "Students found: " + allStudents.length
    
    // display numbers in filters
    document.querySelector(".filter-Gryffindor li p").textContent = "Gryffindor (" + "??????" + ")"


}