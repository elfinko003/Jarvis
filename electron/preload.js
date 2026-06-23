const { contextBridge, shell, Notification } = require("electron");

contextBridge.exposeInMainWorld("jarvisSystem", {
  openUrl: (url) => shell.openExternal(url),
  notify: (title, body) => new Notification({ title, body }).show(),
  platform: process.platform,
});
