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