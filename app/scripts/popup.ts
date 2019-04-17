let sf = document.querySelector("#submitform")
let docTitle: HTMLInputElement = document.querySelector("#docname")
let docUrl: HTMLInputElement = document.querySelector("#memlink")
async function checkUrl() {
    // make sure the requested url is available
    let validUrl = docUrl.value
    let invalidUrl = validUrl

    let containsInvalidChars = invalidUrl.match(/[^0-9a-zA-Z-_]/)
    if (!!containsInvalidChars) {
      return new Promise<any>((resolve,reject)=>{
          reject(`Your URL ${invalidUrl} is malformed (should contain only alphanumerics and dash '-' or underscore '_')`)
      })
    }
    console.log(`checking url ${validUrl} with background script`)
    return new Promise<any> ( (resolve,reject) => {
        chrome.runtime.sendMessage({
            checkUrl: true,
            validUrl,
    
        },(respMsg)=>{
            console.log("receiving responsemsg, ", respMsg)
            if (!!respMsg && !!respMsg.success) {
                resolve(respMsg)
            } else {
                reject(respMsg)
            }
        })
    });
}
sf.addEventListener('submit',  () => {
    (async ()=>{
        let resp
        try {
            resp = await checkUrl()
            if (!!resp && !!resp.success) {
                alert(`sucess, ${resp.success}`)
            } else {
                alert(`got weird message, ${resp}`)
            }
        } catch (reason) {
            if (!!reason && !!reason.error) {
                alert(`something bad happened, ${reason.error}`)
    
            } else {
                alert(`something bad happened, ${reason}`)
    
            }
        }
    })()
    return true
})