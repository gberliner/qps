import {Client} from "chomex"
const tinyUrl = "https://tinyurl.com/"
let sf = document.querySelector("#submitform")
let docTitle: HTMLInputElement = document.querySelector("#docname")
let docUrl: HTMLInputElement = document.querySelector("#memlink")
let bg = chrome.extension.getBackgroundPage()
let client = new Client(chrome.runtime)
const bgPage = chrome.extension.getBackgroundPage()

interface CheckUrl {
    success?: string
    error?: string
}
function checkUrl() {
    // make sure the requested url is available
    let res: CheckUrl
    let validUrl = docUrl.value
    let invalidUrl = validUrl

    let containsInvalidChars = invalidUrl.match(/[^0-9a-zA-Z-_]/)
    if (!!containsInvalidChars) {
      return ({
          error: `Your URL ${invalidUrl} is malformed (should contain only alphanumerics and dash '-' or underscore '_')`
      })
    }
    console.log(`checking url ${validUrl} with background script`);
    // (async()=>{
    //     let resp: Response
    //     try {
    //         resp = await fetch(tinyUrl+validUrl,{
    //             method: 'GET'
    //         })
    //         if (resp.status === 404) {
    //             res = {
    //                 success: `URL ${validUrl} available`
    //             }
    //         } else {
    //             res = {
    //                 error: `URL ${validUrl} not available or could not be verified`
    //             }
    //         }
    //     } catch (reason) {
    //         res = {
    //             error: `Problem verifying URL, ${chrome.runtime.lastError}`
    //         }
    //     }
    // })()
    let xhr = new XMLHttpRequest
    xhr.open('GET', tinyUrl+validUrl,false)
    xhr.send()
    if (xhr.status === 404) {
        res = {
            success: "URL available"
        }

    } else {
        res = {
            error: "URL UNAVAILABLE"
        }
    }
    return res
}
sf.addEventListener('submit',  () => {
    let resp = checkUrl()
    

    if (!!resp) {
        if (!!resp.success) {
            alert(resp.success)
            window.close()
        } else if (!!resp.error) {
            alert(resp.error)
        } else {
            let jsonstr = JSON.stringify(resp)
            alert(`weird message: ${jsonstr}`)
        }
    } else {
        alert(`Bad response returned from checkUrl, error ${chrome.runtime.lastError}`)
    }
})