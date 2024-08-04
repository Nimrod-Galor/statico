async function getComments(page = 1){
    console.log('get Comments')
    const post = document.getElementById('post-id').value
    const dataToSend = {post, page}

    await fetchData('api/comments', "POST", dataToSend)
    .then(data => {
        console.log('data', data)

        if(data.messageType === 'data'){
            const comments = document.getElementById('comments')
            constractComment(comments, data.messageBody, page)
        }else{
            alertComment(data)
        }
    })
}

function constractComment(parentObj, data, commentIndex){
    for(let i = 0; i< data.length; i++){
        // create comment item
        const commentTemplate = document.querySelector("#comment-template")

        // Clone the new row and insert it into the table
        const clone = commentTemplate.content.cloneNode(true)

        if(commentIndex){
            clone.querySelector('.comment-index').innerText = commentIndex + i
        }
        clone.querySelector('.comment-author').innerText = data[i].author.userName
        clone.querySelector('.comment-createdat').innerText = data[i].createdAt
        clone.querySelector('.comment-content').innerText = data[i].comment
        clone.querySelector('.btn-replay').dataset.parentComment = data[i].id
        clone.querySelector('.btn-replay').addEventListener('click', (event) => {
            const form = document.getElementById('create-comment')
            const clone = form.cloneNode(true)

            clone.querySelector('legend').innerText = 'Replay Comment'
            clone.querySelector('#parent-comment').value = event.target.dataset.parentComment
            const cancelBtn = clone.querySelector('.reset')
            cancelBtn.type = 'button'
            cancelBtn.addEventListener('click', (event) => {
                event.target.parentNode.parentNode.remove()
            })
            event.target.parentNode.appendChild(clone)
        })

        // append item to list
        parentObj.appendChild(clone)

        if(data[i].replies && data[i].replies.length > 0){
            // create new list
            const ul = document.createElement('ul')
            // append new list to parenrt element
            parentObj.appendChild(ul)
            constractComment(ul, data[i].replies)
        }
    }
}

let activeForm

async function postComment(event){

    console.log("create comments")
    
    event.preventDefault()
    event.stopPropagation()

    activeForm = event.currentTarget
    activeForm.classList.add('was-validated')

    if (!activeForm.checkValidity()) {// validation Failed
        return false
    }

    // start submit button spiner
    activeForm.classList.add('disabled')
    // disabel submit buttn
    // event.submitter.disabled = true

    //Post form data
    const formData = new FormData(activeForm);
    const dataToSend = Object.fromEntries(formData);

    // disabel fieldset
    activeForm[0].disabled = true
    //  send data
    await fetchData(activeForm.action, "POST", dataToSend)
    .then((data) => {
        console.log('data', data)
        activeForm.classList.remove('disabled', 'was-validated')
        activeForm[0].disabled = false
        activeForm.reset()
        alertComment(data, activeForm)
    })
}

async function fetchData(action, method, dataToSend){
    return fetch(action, {
        method,
        body: JSON.stringify(dataToSend),
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(res => res.json())
    .catch(err => {
        console.log('error', err)
    })
}

function alertComment(data, activeForm){
    activeForm.querySelector('#comment-alert-type').classList.add(`alert-${data.messageType}`)
    activeForm.querySelector('#comment-alert-title').innerText = data.messageTitle
    activeForm.querySelector('#comment-alert-body').innerHTML = `<ul><li>${data.messageBody}</li></ul>`
    activeForm.querySelector('#comment-alert').classList.add('open')
}

document.addEventListener('DOMContentLoaded', getComments(1))