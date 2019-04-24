import {browser} from "webextension-polyfill-ts"
import {drive_v3,GoogleApis,google} from "googleapis"
const tinyUrl =  "https://tinyurl.com/"
class BackgroundSettings {
    private docName: string
    private tinyUrl: string
    get url() {
        return this.tinyUrl
    }
    set url(url: string) {
        this.tinyUrl = url
    }
}
const backgroundSettings = new BackgroundSettings();
function doFetch(url) {
    return fetch(tinyUrl + url,{
        method: 'GET'
    }).then((resp)=>{
        if (resp.status === 404) {
            backgroundSettings.url = url
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


function createGdriveUpload(name: string,blob: Blob) {
    let blockSize = 4096
    let startOffset: number = 0
    let endOffset: number = 0
    let rs = new ReadableStream<any>({
        start(controller) {
            return pump()
            function pump() {
                let fr = new FileReader
                let done = false
                fr.onloadend = ()=>{
                    controller.enqueue(fr.result)
                }
                if (blob.size > endOffset + blockSize) {
                    startOffset = endOffset
                    endOffset += blockSize
                } else if (endOffset < blockSize) {
                    startOffset = endOffset
                    endOffset = blockSize
                } else {
                    done = true
                }
                if (!done) {
                    fr.readAsArrayBuffer(blob.slice(startOffset,endOffset))
                } else {
                    controller.close()
                    return
                }
            }
        }

    })
    google.drive("v3").files.create({
        requestBody: {
            name,
            shared: true,
            mimeType: "application/pdf"
        },
        media: {
            mimeType: "application/pdf",
            body: rs
        }        
    }).then(res=>{
        let webLink = res.data.webViewLink
        let encodedUrl = encodeURI(webLink)
        fetch(tinyUrl + `create.php?alias=${backgroundSettings.url}&url=${encodedUrl}`,{
            method: 'GET'
        }).then(resp=>{
            if (resp.status !== 200) {
                alert("Your file has been saved, but your tinyurl was unavailable")
            } else {
                alert(`Your file has been saved and published to ${tinyUrl + backgroundSettings.url}`);
            }
        })
    })
}

chrome.printerProvider.onPrintRequested
.addListener((printJob,resultCb)=>{
  let docName = printJob.title;
  printJob.contentType
  chrome.runtime.sendMessage({getDocname: docName},(response)=>{
    if (!!response.newDocName) {
      docName = response.newDocName;
    }
  })
  createGdriveUpload(printJob.title,printJob.document)
  
})


browser.runtime.onMessage.addListener((msg,sender)=>{
    console.log("inside background sendmessage event handler")
    if (!!msg && msg.verifyUrl && msg.url) {
        return doFetch(msg.url)
    }
    if (!!msg && msg.url && msg.createUpload) {
        
    }
})