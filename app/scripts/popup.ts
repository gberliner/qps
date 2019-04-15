let sf = document.querySelector("#submitform")
let docTitle: HTMLInputElement = document.querySelector("#doctitle")
let docUrl: HTMLInputElement = document.querySelector("#docurl")
sf.addEventListener('submit', async ()=>{
    // make sure the requested url is available
    let response: Response
    let responseJson
    try {
        response = await fetch("https://tinyurl.com" + docUrl.value);
        if (response.status !== 404) {
            alert("Your requested url is not available; please a different one")
            return
        }
        //alert('submitted');
    } catch(rejectedReason) {

    }
    try {
        responseJson = await response.json()
        if (!!responseJson.error) {

        }
    } catch (rejectedReason) {

    }
    window.close()
    let message = {
        doPrint: true,
        docTitle: docTitle.value,
        docUrl: docUrl.value
    }
    chrome.runtime.sendMessage(message)
})