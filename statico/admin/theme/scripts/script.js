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
    // create model form
    
    // open div
    document.querySelector('.horizontal-collapse').classList.add('open')
}

function closeModelView(){
    document.querySelector('.horizontal-collapse').classList.remove('open')
}