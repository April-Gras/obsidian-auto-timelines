import type { App, EventRef, TFile } from "obsidian";

/**
 * Quickhand to (re)-watch for file changes and execute a callback.
 *
 * @param app - The obsidian `app` object.
 * @param filesToWatch - An array of strings representing the files to watch.
 * @param callback - The callback to call when one of the changed files is updated.
 * @param fileWatcher - The previously returned file watcher, if any.
 * @param timerClampTime - Defaults at 100. The time in ms left for obsidians cache to re-compute before applying the callback.
 * @returns FileWatcher - The new `EventRef` that watches over the files.
 */
export function watchFiles(
  app: App,
  filesToWatch: TFile[],
  callback: () => unknown,
  fileWatcher: null | EventRef = null,
  timerClampTime = 100,
): EventRef {
  if (fileWatcher) app.vault.offref(fileWatcher);
  let timerClamp = null as null | ReturnType<typeof setTimeout>;

  fileWatcher = app.vault.on("modify", (file) => {
    if (!filesToWatch.some((usedFile) => usedFile.path === file.path))
      return false;
    if (timerClamp) clearTimeout(timerClamp);
    timerClamp = setTimeout(callback, timerClampTime);
    return true;
  });
  return fileWatcher;
}
