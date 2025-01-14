import * as extensionizer from 'extensionizer';
import { Environment, ConnectRequest } from '@core/types';
import PortStream from '@core/PortStream';
import PostMessageStream from 'post-message-stream';

function setupConnection() {
  const backgroundPort = extensionizer.runtime.connect({
    name: Environment.CONTENT,
  });
  const backgroundStream = new PortStream(backgroundPort);

  const pageStream = new PostMessageStream({
    name: Environment.CONTENT,
    target: 'page',
  });

  pageStream.pipe(backgroundStream).pipe(pageStream);
}

function injectScript() {
  try {
    const container = document.head || document.documentElement;
    const scriptTag = document.createElement('script');
    scriptTag.setAttribute('async', 'false');
    scriptTag.setAttribute('src', chrome.extension.getURL('inpage.js'));
    container.insertBefore(scriptTag, container.children[0]);
    container.removeChild(scriptTag);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Sourc3 web client injection failed.', error);
  }
}

function doctypeCheck() {
  const { doctype } = window.document;
  if (doctype) {
    return doctype.name === 'html';
  }
  return true;
}

function suffixCheck() {
  const prohibitedTypes = [/\.xml$/u, /\.pdf$/u];
  const currentUrl = window.location.pathname;
  for (let i = 0; i < prohibitedTypes.length; i += 1) {
    if (prohibitedTypes[i].test(currentUrl)) {
      return false;
    }
  }
  return true;
}

function documentElementCheck() {
  const documentElement = document.documentElement.nodeName;
  if (documentElement) {
    return documentElement.toLowerCase() === 'html';
  }
  return true;
}

function shouldInjectProvider() {
  return doctypeCheck() && suffixCheck() && documentElementCheck();
}

let extensionPort = extensionizer.runtime.connect({ name: Environment.CONTENT_REQ });

document.documentElement.setAttribute('sourc3-extension-installed', 'true');
window.addEventListener('message', (event) => {
  if (event.source !== window) {
    return;
  }

  const reqData: ConnectRequest = {
    type: event.data.type,
    apiver: event.data.apiver,
    apivermin: event.data.apivermin,
    appname: event.data.appname,
    is_reconnect: event.data.is_reconnect,
  };

  if (event.data.type === 'create_sourc3_api') {
    if (event.data.is_reconnect) {
      extensionPort = extensionizer.runtime.connect({ name: Environment.CONTENT_REQ });
      extensionPort.postMessage(reqData);
    } else {
      setupConnection();
      extensionPort = extensionizer.runtime.connect({ name: Environment.CONTENT_REQ });
      extensionPort.postMessage(reqData);
      extensionPort.onMessage.addListener((msg) => {
        if (msg.result && shouldInjectProvider()) {
          injectScript();
        } else if (!msg.result) {
          window.postMessage('rejected', window.origin);
        }
      });
    }
  }
});
