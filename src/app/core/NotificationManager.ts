import ExtensionPlatform from './Extension';

const NOTIFICATION_HEIGHT = 600;
const NOTIFICATION_WIDTH = 375;

let contentPort;
let contentPort2;

export default class NotificationManager {
  platform = null;

  private popupId = null;

  static setPort(port) {
    contentPort = port;
  }

  static setPort2(port) {
    contentPort2 = port;
  }

  static getPort() {
    return contentPort;
  }

  static getPort2() {
    return contentPort2;
  }

  constructor() {
    this.platform = new ExtensionPlatform();
  }

  async showPopup() {
    const popup = await this.getPopup();

    if (popup) {
      await this.platform.focusWindow(popup.id);
    } else {
      let left = 0;
      let top = 0;
      try {
        const lastFocused = await this.platform.getLastFocusedWindow();
        top = lastFocused.top;
        left = lastFocused.left + (lastFocused.width - NOTIFICATION_WIDTH);
      } catch (_) {
        const { screenX, screenY, outerWidth } = window;
        top = Math.max(screenY, 0);
        left = Math.max(screenX + (outerWidth - NOTIFICATION_WIDTH), 0);
      }

      const popupWindow = await this.platform.openWindow({
        url: 'notification.html',
        type: 'popup',
        width: NOTIFICATION_WIDTH,
        height: NOTIFICATION_HEIGHT,
        left,
        top,
      });

      if (popupWindow.left !== left && popupWindow.state !== 'fullscreen') {
        await this.platform.updateWindowPosition(popupWindow.id, left, top);
      }
      this.popupId = popupWindow.id;
    }
  }

  private async getPopup() {
    const windows = await this.platform.getAllWindows();
    return this.getPopupIn(windows);
  }

  private getPopupIn(windows) {
    return windows
      ? windows.find((win) => (win && win.type === 'popup' && win.id === this.popupId))
      : null;
  }
}