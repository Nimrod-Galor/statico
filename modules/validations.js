export default function isValid(data, type,){
    const regUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/
    const regObjectID = /^[a-f\d]{24}$/i
    const regUserName = /^[A-Za-z][A-Za-z0-9_\-]{6,29}$/
    //const isValidUserName = /^([a-zA-Z0-9_\-\.]).{4,12}$/
    const regPassword = /^(?=.*?[0-9])(?=.*?[A-Za-z]).{8,32}$/
    const regEmail = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    const regString = /^[A-Z][a-z]*/

    switch(type.toLowerCase()){
        case "objectid":
            return regObjectID.test(data)
        break;
        case "boolean":
            return typeof(data) === 'boolean'
        break;
        case "username":
            return regUserName.test(data)
        break;
        case "password":
            return regPassword.test(data)
        break;
        case "email":
            return regEmail.test(data)
        case "string":
            return regString.test(data)
        break;
        case "uuid":
            // todo
        break;
    }

    return false
}