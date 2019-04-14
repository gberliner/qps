chrome.runtime.onInstalled.addListener((details) => {
  console.log('previousVersion', details.previousVersion)
})
chrome.printerProvider.onGetPrintersRequested.addListener((rCb)=>{
  let printerInfo: chrome.printerProvider.PrinterInfo = {
    description: "Save webpages to Google Drive",
    id: "quickPageSaver",
    name: "Quick Page Saver Extension"
  }
  let piArray = [printerInfo]
  rCb(piArray)
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
console.log(`'Allo 'Allo! Event Page`)
