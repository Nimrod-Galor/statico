function deleteItemClick(contentType, id, header){
    if(confirm(`delete Item (${header})?`)){
        // console.log('delete', itemId)
        // Send Delet user
        const dataToSend = {id, header}
        fetchData(`/admin/api/delete/${contentType}`, "DELETE", dataToSend)
    }
}

function editItemClick(contentType, data){
    data = JSON.parse(data)
    const form = document.getElementById(`create-${contentType}`)
    form.action = "/admin/api/edit/user"
    form.classList.remove('was-validated')
    // fill form
    for(const elmId in form.elements){
        // get value from data object
        let key = Object.keys(data).find(item => form.elements[elmId].name === item.toLowerCase())
        if(key === undefined){
            // set input as not required
            form.elements[elmId].required = false
        }else{
            switch(form.elements[elmId].type){
                case 'checkbox':
                    form.elements[elmId].checked = data[key]
                break;
                case 'select-one':
                    for(const op of form.elements[elmId].options){
                        if(op.label === data[key]){
                            op.selected = true
                        }
                    }
                break
                default:
                    form.elements[elmId].value = data[key]
                break
            }
        }
    }

    openModelView(`model-${contentType}`, `Edit ${capitalizeFirstLetter(contentType)}`, 'Update')
}

function createItemClick(contentType, fields){
    const form = document.getElementById(`create-${contentType}`)
    form.action = "/admin/api/create/user"
    form.classList.remove('was-validated')
    // reset inputs
    for(const elmId in form.elements){
        let key = JSON.parse(fields).find(item => form.elements[elmId].name === item.key.toLowerCase())
        if(key === undefined){
            // set input as required
            form.elements[elmId].required = true
        }
        switch(form.elements[elmId].type){
            case 'checkbox':
                form.elements[elmId].checked = true
            break;
            case 'select-one':
                form.elements[elmId].options[0].selected = true
            break
            default:
                form.elements[elmId].value = ''
            break
        }
    }

    openModelView(`model-${contentType}`, `Create ${capitalizeFirstLetter(contentType)}`, 'Create')
}

function openModelView(modelName, titleText, buttonText){
    // hide all forms
    const mfs = document.querySelectorAll('.content-type-wrapp')
    mfs.forEach((mf) => {
        if(mf.id == modelName){
            // show selected model form
            mf.classList.remove('d-none')
        }else{
            mf.classList.add('d-none')
        }
    })

    // change title
    document.getElementById(modelName).querySelector('h3').innerText = titleText
    // change button
    document.getElementById(modelName).querySelector('button[type="submit"]').innerText = buttonText
    
    // open div
    document.querySelector('.horizontal-collapse').classList.add('open')
}

function closeModelView(){
    document.querySelector('.horizontal-collapse').classList.remove('open')
}

function toggleClass(objId, className){
    document.getElementById(objId).classList.toggle(className);
    event.currentTarget.classList.toggle(className);
}

function validateForm(event){
    event.preventDefault();
    const form = event.currentTarget
    form.classList.add('was-validated')
    
    if (!form.checkValidity()) {// validation Failed
        event.preventDefault()
        event.stopPropagation()
        return
    }

    //Post form data
    const formData = new FormData(form);
    const dataToSend = Object.fromEntries(formData);
    fetchData(form.action, "POST", dataToSend)
}

async function fetchData(action, method, dataToSend){
    await fetch(action, {
        method,
        body: JSON.stringify(dataToSend),
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(res => res.json())
    .then(data => {
        console.log('data', data)
        
        topAlert(data.messageType, data.messageTitle, data.messageBody)
    })
    .catch(err => {
        console.log('error', err)
    })
}


function topAlert(type, title, body){
    document.getElementById('top-alert').classList.add('open');
    document.getElementById('top-alert').querySelector('.alert').className = `alert alert-${type}`
    document.getElementById('top-alert-title').innerHTML = title;
    document.getElementById('top-alert-body').innerHTML = `<ul><li>${body}</li></ul>`;
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}