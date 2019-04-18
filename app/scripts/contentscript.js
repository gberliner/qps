"use strict";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  let response = {};

  if (!!message && !!message.doPrint && message.doPrint === true) {
    window.print();
  }

  sendResponse(response);
});