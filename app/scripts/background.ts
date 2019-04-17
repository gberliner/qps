import {Router} from "chomex"
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
const router = new Router;
router.on("/url/available",msg=>{
    let res: CheckUrlResult
    
    fetch(tinyUrl + msg.validUrl,{
      method: "GET"
    }).then((resp)=>{
      res = {
        success: ""
      }
      if (resp.status === 404) {
        res.success = `URL ${msg.validUrl} available`
      } else {
        res = {
          error: `URL ${msg.validUrl} UNAVAILABLE`
        }
      }
    }).catch((reason)=>{
      res = {
        error: `Problem checking URL ${msg.validUrl}`
      }
    });
    return res;
  }
)
// chrome.runtime.onMessage.addListener(router.listener());
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
  if (!!message && !!message.checkUrl) {
    let xhr = new XMLHttpRequest
    xhr.open('GET',tinyUrl+message.validUrl,false)
    xhr.send()
    if (xhr.status === 404) {
      sendResponse({
        success: `URL ${message.validUrl} is available`
      })
    } else {
      sendResponse({
        error: `URL ${message.validUrl} is UNAVAILABLE or could not be checked`
      })
    }
  }
  return true
})
