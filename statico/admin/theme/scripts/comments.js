let activeForm
const postComments = {
    total: 0,
    loaded: 0,
    page: 1,
    comments: []
}


async function countComments(){
    const postid = document.getElementById('post-id').value
    const dataToSend = {postid}
    await fetchData('api/count/comments', "POST", dataToSend)
    .then(data => {
        if(data.messageType === 'data'){
            postComments.total = parseInt(data.messageBody)
            if(postComments.total > 0){
                // load comments
                getComments(1)
            }else{
                // no comments
                document.querySelector('#loadin-comments').classList.add('d-none')
                document.querySelector('#no-comments').classList.remove('d-none')
            }
        }else{// Error
            alertComment(data)
        }
    })
}

async function getComments(page = 1){
    console.log('get Comments')
    const post = document.getElementById('post-id').value
    const dataToSend = {post, page}

    // hide load more comments
    document.getElementById('load-more-comment-btn').classList.add('d-none')

    await fetchData('api/comments', "POST", dataToSend)
    .then(data => {
        console.log('data', data)
        // hide loading comments info
        document.getElementById('loadin-comments').classList.add('d-none')

        if(data.messageType === 'data'){
            constractComment(document.getElementById('comments'), data.messageBody, true)
            if(postComments.total < postComments.loaded){
                document.getElementById('load-more-comment-btn').classList.remove('d-none')
            }

            postComments.comments.push(...data.messageBody)
            postComments.loaded += data.messageBody.length
        }else{// Error
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
            clone.querySelector('.comment-index').innerText = postComments.loaded + 1 +i
        }
        clone.querySelector('.comment-author').innerText = data[i].author.userName
        clone.querySelector('.comment-createdat').innerText = data[i].createdAt
        clone.querySelector('.comment-content').innerText = data[i].comment
        clone.querySelector('.btn-reply').dataset.parentComment = data[i].id
        clone.querySelector('.btn-reply').addEventListener('click', (event) => {
            if(activeForm){
                // if we have selected Form remove it from DOM
                activeForm.remove()
            }
            // Select Comment Form
            const form = document.querySelector('.create-comment-form')
            // Clone Comment Form
            activeForm = form.cloneNode(true)
            // reset id
            activeForm.id = "reply-alert"
            // Update Legend
            activeForm.querySelector('legend').innerText = 'Reply Comment'
            // Mark form as reply Form
            // activeForm.classList.add("reply-alert")
            //Update hidden input parent comment id
            activeForm.querySelector('#parent-comment').value = event.target.dataset.parentComment

            //  Update alert close buttn click event
            const closebtn = activeForm.querySelector('.close-btn')
            closebtn.onclick = () => {
                activeForm.remove()
                activeForm = undefined
            }

            // upadate rest Button
            const cancelBtn = activeForm.querySelector('.reset')
            cancelBtn.type = 'button'
            cancelBtn.addEventListener('click', (event) => {
                event.target.parentNode.parentNode.remove()
            })

            // Append to fieldset
            event.target.parentNode.appendChild(activeForm)
        })

        // append item to list
        parentObj.appendChild(clone)

        if(data[i].replies && data[i].replies.length > 0){
            // create new item
            const li = document.createElement('li')
            // create new list
            const ul = document.createElement('ul')
            li.appendChild(ul)
            // append new list to parenrt element
            parentObj.appendChild(li)
            constractComment(ul, data[i].replies)
        }
    }
}

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
        if(activeForm.id == 'reply-alert'){// reply form
            //remove Form Elements from DOM (but not the Alert)
            activeForm.querySelector('.form-floating').remove()
            activeForm.querySelectorAll('.btn').forEach(element => {
                element.remove()
            });
        }else{// new comment form
            activeForm.classList.remove('disabled', 'was-validated')
            activeForm[0].disabled = false
            activeForm.reset()
        }
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
    activeForm.querySelector('.top-alert-type').classList.add(`alert-${data.messageType}`)
    activeForm.querySelector('.top-alert-title').innerText = data.messageTitle
    activeForm.querySelector('.top-alert-body').innerHTML = `<li>${data.messageBody}</li>`
    activeForm.querySelector('.top-alert').classList.add('open')
}

document.addEventListener('DOMContentLoaded', countComments())