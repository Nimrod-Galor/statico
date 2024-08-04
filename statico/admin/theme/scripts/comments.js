async function postComment(event){

    console.log("create comments")
    
    event.preventDefault()
    event.stopPropagation()

    const form = event.currentTarget
    form.classList.add('was-validated')

    if (!form.checkValidity()) {// validation Failed
        return false
    }

    // start submit button spiner
    form.classList.add('disabled')
    // disabel submit buttn
    // event.submitter.disabled = true

    //Post form data
    const formData = new FormData(form);
    const dataToSend = Object.fromEntries(formData);

    // disabel fieldset
    form[0].disabled = true
    //  send data
    await fetchData(form.action, "POST", dataToSend)
    .then(data => {
        console.log('data', data)
        const form = document.getElementById('create-comment')
        form.classList.remove('disabled', 'was-validated')
        form[0].disabled = false
        form.reset()
        alertComment(data)
    })
}

function fetchData(action, method, dataToSend){
    return fetch(action, {
        method,
        body: JSON.stringify(dataToSend),
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(res => res.json())
    // .then(data => {
    //     console.log('data', data)
    //     // close model
    //     closeModelView()
    //     // show alert message
    //     topAlert(data.messageType, data.messageTitle, data.messageBody)
    //     // reload page
    //     // ***ToDo
    // })
    .catch(err => {
        console.log('error', err)
    })
}

function alertComment(data){
    document.getElementById('comment-alert-type').classList.add(`alert-${data.messageType}`)
    document.getElementById('comment-alert-title').innerText = data.messageTitle
    document.getElementById('comment-alert-body').innerHTML = `<ul><li>${data.messageBody}</li></ul>`
    document.getElementById('comment-alert').classList.add('open')
}