import {browser} from "webextension-polyfill-ts"
const tinyUrl =  "https://tinyurl.com/"
function doFetch(url) {
    return fetch(tinyUrl + url,{
        method: 'GET'
    }).then((resp)=>{
        if (resp.status === 404) {
            return(Promise.resolve({success: `URL ${url} is available`}))
        } else {
            return Promise.reject({error: `URL ${url} unavailable`})
        }
    }).catch(reason=>{
        if (typeof reason === 'string') {
            return ({error: `URL ${url}: could not verify (${reason})`})
        } else {
            return reason
        }
    })
}
browser.runtime.onMessage.addListener((msg,sender)=>{
    console.log("inside background sendmessage event handler")
    if (!!msg && msg.url) {
        return doFetch(msg.url)
    }
})