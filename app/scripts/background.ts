const tinyUrl = "https://tinyurl.com/"
class BackgroundSettings {
  constructor() {
    
  }
  public DocumentTitle = "";
  public Url = ""
}

let currentSettings = new BackgroundSettings
interface CheckUrlResult {
  success?:string
  error?:string
}
chrome.runtime.onInstalled.addListener((details) => {
  console.log('previousVersion', details.previousVersion)
})
chrome.printerProvider.onGetPrintersRequested.addListener((chromeCallback)=>{
  let printerInfo: chrome.printerProvider.PrinterInfo = {
    description: "Save webpages to Google Drive",
    id: "quickPageSaver",
    name: "Quick Page Saver Extension"
  }
  let piArray = [printerInfo]
  // pass our virtual printer's printerInfo back to the chrome runtime
  chromeCallback(piArray)
})

chrome.runtime.onConnect.addListener((port)=>{
  if (port.name === "checkUrl") {
    
  }
})

chrome.printerProvider.onGetCapabilityRequested.addListener((printerId,chromeCallback)=>{
  let cdd = {
    version: 1,
    capabilities: {}
  }
  let printerCdd = {
    "version": "1.0",
    "capabilities": {
      "supported_content_type": [
        {"content_type": "application/pdf", "min_version": "1.5"},
        {"content_type": "image/jpeg"},
        {"content_type": "text/plain"}
      ],
      "input_tray_unit": [
        {
          "vendor_id": "tray",
          "type": "INPUT_TRAY"
        }
      ],
      "marker": [
        {
          "vendor_id": "black",
          "type": "INK",
          "color": {"type": "BLACK"}
        },
        {
          "vendor_id": "color",
          "type": "INK",
          "color": {"type": "COLOR"}
        }
      ],
      "cover": [
        {
          "vendor_id": "front",
          "type": "CUSTOM",
          "custom_display_name": "front cover"
        }
      ],
      "vendor_capability": [],
      "color": {
        "option": [
          {"type": "STANDARD_MONOCHROME"},
          {"type": "STANDARD_COLOR", "is_default": true},
          {
            "vendor_id": "ultra-color",
            "type": "CUSTOM_COLOR",
            "custom_display_name": "Best Color"
          }
        ]
      },
      "copies": {
        "default": 1,
        "max": 100
      },
      "media_size": {
        "option": [
          {
            "name": "ISO_A4",
            "width_microns": 210000,
            "height_microns": 297000,
            "is_default": true
          },
          {
            "name": "NA_LEGAL",
            "width_microns": 215900,
            "height_microns": 355600
          },
          {
            "name": "NA_LETTER",
            "width_microns": 215900,
            "height_microns": 279400
          }
        ]
      }
    }
  }
  chromeCallback(printerCdd);
})

chrome.printerProvider.onPrintRequested
.addListener((printJob,resultCb)=>{
  let docName = printJob.title;
  printJob.contentType
  chrome.runtime.sendMessage({getDocname: docName},(response)=>{
    if (!!response.newDocName) {
      docName = response.newDocName;
    }
  })
})

function checkUrl(url) {
  let xhr = new XMLHttpRequest
  xhr.open('GET', tinyUrl + url,false)
  xhr.send()
  if (xhr.status === 404) {
    return ({success: `ÙRL ${url} available`})
  } else {
    return ({error: `URL ${url} UNAVAILABLE or error getting status`})
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse)=>{
  if (!!message && !!message.randomMsg) {
    console.log("received randommsg request in background listener")
    sendResponse({
      randomResponse: "09-09iokm;lkasdf"
    })
    return true
  }
  if (!!message && !!message.checkUrl) {
    console.log("received message inside background listener")
    if (true) {
      sendResponse({
        success: "background:itsallaok"
      })
      return true
    }
    let xhr = new XMLHttpRequest
    xhr.open('GET',tinyUrl+message.validUrl,false)
    try {
      xhr.send()
    } catch (reason) {
      let reasonToPrint = reason
      if (typeof reason === 'object') {
        reasonToPrint = JSON.stringify(reason)
      }
      console.log("caught exception in background during xhr.send, ", reasonToPrint)
    } finally {
      if (!!chrome.runtime.lastError) {
        console.log("error checked in background xhr: " + chrome.runtime.lastError)
      } else {
        console.log("lastError not set during background xhr")
      }
      if (!!xhr && xhr.status === 404) {
        
        console.log("attempting to sendResponse from background, status 404..")
        sendResponse({
          success: `URL ${message.validUrl} is available (via background)`
        })
      } else {
        let status = ""
        if (!!xhr && !!xhr.status) {
          status = xhr.status.toLocaleString()
        }
        if (!!xhr && !!xhr.statusText) {
          status += xhr.statusText
        }
        console.log("attempting to sendResponse from background, status NOT 404." + "(" + status + ")")
        sendResponse({
          error: `URL ${message.validUrl} is UNAVAILABLE or could not be checked (via background)`
        })
      }
      return true  
    }
  }
  //return true
})
