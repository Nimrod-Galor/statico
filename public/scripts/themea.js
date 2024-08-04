console.log('themea.js')

function toggleClass(objId, className){
    document.getElementById(objId).classList.toggle(className);
    event.currentTarget.classList.toggle(className);
}

function topAlert(type, title, body){
    document.getElementById('top-alert').classList.add('open', type);
    document.getElementById('top-alert-title').innerHTML = title;
    document.getElementById('top-alert-body').innerHTML = body;
}

function profileDropdownClick(){
    event.stopPropagation()
    let obj = document.getElementById("profileDropdown")
    if(obj.classList.contains("show")){
        obj.classList.remove("show")
        document.body.removeEventListener('click', profileDropdownClick)
    }else{
        obj.classList.add("show")
        document.body.addEventListener('click', profileDropdownClick)
    }
}

function validateForm(event){
    const form = event.currentTarget
    form.classList.add('was-validated')

    if (!form.checkValidity()) {// validation Failed
        event.preventDefault()
        event.stopPropagation()
        return false
    }

    // start submit button spiner
    form.classList.add('disabled')
    // disabel submit buttn
    event.submitter.disabled = true
    
    return true
}

function encodeHTML(str) {
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#39;');
}