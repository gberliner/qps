import {browser} from "webextension-polyfill-ts"
import {drive_v3,GoogleApis,google} from "googleapis"
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
        if (browser.runtime.lastError) {
            console.log(`last error: ${browser.runtime.lastError}`)
        }
        if (chrome.runtime.lastError) {
            console.log(`last error: ${chrome.runtime.lastError}`)
        }
        if (typeof reason === 'string') {
            console.log(`caught rejection in doFetch: ${reason}`)
            throw new Error(reason)
        } else {
            if (reason.error) {
                reason.error += " (passed through catch)"
                throw new Error(reason.error)
            }
            console.log('caught rejection in doFetch: ', reason)

            throw new Error(reason.message)
        }
    })
}
// TODO: implement createGdriveUpload
// function createGdriveUpload(name,) {
//     let rs = new ReadableStream<any>({
//         start(controller) {

//         },
//         pull(controller) {

//         },
//         cancel() {

//         },

//     })
//     google.drive("v3").files.create({
//         requestBody: {
//             name,
//             mimeType: "application/pdf"
//         },
//         media: {
//             mimeType: "application/pdf",
//             body: readableStream
//         }        
//     })
// }

chrome.printerProvider.onPrintRequested
.addListener((printJob,resultCb)=>{
  let docName = printJob.title;
  printJob.contentType
  chrome.runtime.sendMessage({getDocname: docName},(response)=>{
    if (!!response.newDocName) {
      docName = response.newDocName;
    }
  })
  printJob.document
})


browser.runtime.onMessage.addListener((msg,sender)=>{
    console.log("inside background sendmessage event handler")
    if (!!msg && msg.verifyUrl && msg.url) {
        return doFetch(msg.url)
    }
    if (!!msg && msg.url && msg.createUpload) {
        // TODO: implement createGdriveUpload
        // Promise.all([doFetch(msg.url),createGdriveUpload()])
    }
})