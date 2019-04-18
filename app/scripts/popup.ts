
const tinyUrl = "https://tinyurl.com/"
let sf = document.querySelector("#submitform")
let docTitle: HTMLInputElement = document.querySelector("#docname")
let docUrl: HTMLInputElement = document.querySelector("#memlink")
let bg = chrome.extension.getBackgroundPage()
let packageGlobalResp = undefined

function setPackageGlobal(resp: any) {
    packageGlobalResp = resp
}
const bgPage = chrome.extension.getBackgroundPage()

interface CheckUrl {
    success?: string
    error?: string
}
function checkUrl(urlToCheck: string) {
    // make sure the requested url is available
    let res: CheckUrl
    let validUrl = urlToCheck || docUrl.value
    let invalidUrl = validUrl

    let containsInvalidChars = invalidUrl.match(/[^0-9a-zA-Z-_]/)
    if (!!containsInvalidChars) {
      return ({
          error: `Your URL ${invalidUrl} is malformed (should contain only alphanumerics and dash '-' or underscore '_')`
      })
    }

    console.log("performing sendMessage to background..")
    chrome.runtime.sendMessage({
        checkUrl: true,
        validUrl
        },
        (resp)=>{
            res = resp
        }
    )
    if (!!chrome.runtime.lastError) {
        console.log("error detected after sendmessage was called, ", chrome.runtime.lastError)
    } else {
        console.log("sendmessage was called without apparent errors")
    }
    if (!!res && !!res.success) {
        console.log("sendmessage succeeded, returning result")
        return res
    }
    if (!!res && !!res.error) {
        console.log("sendmessage returned error, returning result")
        return res
    }
    if (!!res) {
        console.log("sendmessage returned a result, we will use it...")
        return res
    } else {
        console.log("sendmessage returned NO result, falling back to local xhr via async IIFE now...")
    }

    console.log(`checking url ${validUrl} with async IIFE`);
    (async()=>{
        let resp: Response
        console.log('entering fetch try loop..')
        try {
            console.log('inside fetch try loop..')

            resp = await fetch(tinyUrl+validUrl,{
                method: 'GET'
            })
            console.log('fetch done..')
            if (!!chrome.runtime.lastError) {
                console.log("lasterror checed during local fetch,", chrome.runtime.lastError)
            } else {
                console.log("no lasterror during local fetch")
            }
            if (resp.status === 404) {
                res = {
                    success: `URL ${validUrl} available`
                }
            } else {
                res = {
                    error: `URL ${validUrl} not available or could not be verified`
                }
            }
        } catch (reason) {
            console.log('fetch attempted, exception caught..')

            res = {
                error: `Problem verifying URL, ${chrome.runtime.lastError}`
            }
        }
    })()
    if (!!res) {
        return res
    } else {
        console.log("result not obtained from async IIFE, trying direct xhr..")
    }

    let xhr = new XMLHttpRequest
    xhr.open('GET', tinyUrl+validUrl,false)
    try {
        xhr.send()
    } catch (reason) {
        res = {
            error: reason
        }
    }

    if (xhr.status === 404) {
        res = {
            success: "URL available"
        }

    } else {
        let errorAppend = ""
        if (!!res && !!res.error) {
            errorAppend = res.error
        }
        res = {
            error: "URL UNAVAILABLE " + errorAppend
        }
    }
    return res
}
function randomMsg() {
    let res
    let outerscope = "blablabla"
    chrome.runtime.sendMessage({
        randomMsg: true
    },(resp)=>{
        res = resp
        setPackageGlobal(resp)
        console.log("my argument was: ",resp)
        console.log("inside sendresponse, outerscope variable = " + outerscope)
        console.log("inside of sendresponse, i should have set the result value!")
        if (!!resp && !!JSON.stringify(resp) && JSON.stringify(resp).trim() !== "") {
            console.log("returning an actual result in sendresponse, " + JSON.stringify(resp))
            console.log("typeof resp = " + typeof resp)
        } else {
            console.log("hardcoding result to BS in sendresponse...")
            res = {
                bs: true
            }
        }
    })
    if (!!res) {
        console.log("received back response from sendmessage: ", JSON.stringify(res))
    } else {
        console.log("no response received from sendmessage :-(")
    }
    if (!!packageGlobalResp) {
        console.log("packageGlobalResponse set: " + JSON.stringify(packageGlobalResp))
    } else {
        console.log("no love: packageGlobalResponse not set after sendmessage")
    }
}

console.log("doing standalone checurl for nodets-quickstart...")
checkUrl("nodets-quickstart")
randomMsg()
sf.addEventListener('submit',  () => {
    let resp = checkUrl()
    

    if (!!resp) {
        if (!!resp.success) {
            if (!!resp.error) {
                alert(resp.success + " (BTW: there was also this warning: " + resp.error + ")")
            } else {
                alert(resp.success)
            }
            
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
    return true
})