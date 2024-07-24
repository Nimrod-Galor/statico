console.log('Admin script')

function deleteItemClick(itemId){
    if(confirm("delete Item?")){
        console.log('delete', itemId)
    }
}

function editItemClick(itemId){
    console.log('edit', itemId)
}

// function toggleModelView(){
//     document.querySelector('.horizontal-collapse').classList.toggle('open')
// }

function openModelView(modelName){
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
    
    // open div
    document.querySelector('.horizontal-collapse').classList.add('open')
}

function closeModelView(){
    document.querySelector('.horizontal-collapse').classList.remove('open')
}

function validateCreateModel(modelName){
    console.log(modelName)
    return true
}