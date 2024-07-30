console.log('Admin script')

function deleteItemClick(itemId){
    if(confirm("delete Item?")){
        console.log('delete', itemId)
    }
}

function createItemClick(contentType, fields){
    const form = document.getElementById(`create-${contentType}`)
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

function editItemClick(contentType, data){
    data = JSON.parse(data)
    const form = document.getElementById(`create-${contentType}`)
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

        // for(const key in data){
        //     if(form.elements[elmId].name === key.toLowerCase()){
        //         console.log("input", key, 'type:', form.elements[elmId].type)
        //         switch(form.elements[elmId].type){
        //             case 'checkbox':
        //                 form.elements[elmId].checked = data[key]
        //             break;
        //             case 'select-one':
        //                 for(const op of form.elements[elmId].options){
        //                     if(op.label === data[key]){
        //                         op.selected = true
        //                     }
        //                 }
        //             break
        //             default:
        //                 form.elements[elmId].value = data[key]
        //             break
        //         }
        //         continue
        //     }
        // }
    }

    openModelView(`model-${contentType}`, `Edit ${capitalizeFirstLetter(contentType)}`, 'Update')
}

// function toggleModelView(){
//     document.querySelector('.horizontal-collapse').classList.toggle('open')
// }

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
    const form = event.currentTarget
    form.classList.add('was-validated')
    
    if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
        return false
    }
    return true
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}