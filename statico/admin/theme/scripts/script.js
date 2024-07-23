console.log('Admin script')

function deleteItemClick(itemId){
    if(confirm("delete Item?")){
        console.log('delete', itemId)
    }
}

function editItemClick(itemId){
    console.log('edit', itemId)
}