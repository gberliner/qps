import {browser} from "webextension-polyfill-ts"
const tinyUrl =  "https://tinyurl.com/"
function doFetch(url) {
    return fetch(tinyUrl + url,{
        method: 'GET'
    }).then((resp)=>{
        if (resp.status === 404) {
            return (Promise.resolve({success: `URL ${url} is available`}))
        } else {
            throw ({error: `URL ${url} unavailable`})
        }
    }).catch(reason=>{
        if (typeof reason === 'string') {
            console.log(`caught rejection in doFetch: ${reason}`)

            throw({error: `URL ${url}: could not verify (${reason})`})
        } else {
            if (reason.error) {
                reason.error += " (passed through catch)"
            }
            console.log('caught rejection in doFetch: ', reason)
            throw(reason)
        }
    })
}
browser.runtime.onMessage.addListener((msg,sender)=>{
    console.log("inside background sendmessage event handler")
    if (!!msg && msg.url) {
        return doFetch(msg.url)
    }
})