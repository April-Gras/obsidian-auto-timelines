import type { App } from "obsidian";
import type {
  AutoTimelineSettings,
  MarkdownCodeBlockTimelineProcessingContext,
} from "~/types";

/**
 * A preliminary helper to fetch all the needed context to handle the timeline creation.
 *
 * @param app - The app context provided by obsidian.
 * @param element - The root element of this timeline.
 * @param timelineFile - The file path of the timeline.
 * @param settings - The plugin's settings.
 * @returns the nessessary context to build a timeline.
 */
export function setupTimelineCreation(
  app: App,
  element: HTMLElement,
  timelineFile: string,
  settings: AutoTimelineSettings,
) {
  const { vault, metadataCache } = app;
  const fileArray = vault.getMarkdownFiles();
  const root = element.createDiv();
  const cardListRootElement = root.createDiv();
  const timelineRootElement = root.createDiv();

  element.classList.add("aat-root-container");
  root.classList.add("aat-vertical-timeline");
  cardListRootElement.classList.add("aat-card-list-root");
  timelineRootElement.classList.add("aat-timeline-root");

  const dataBundleArray = fileArray.reduce((accumulator, file) => {
    const cachedMetadata = metadataCache.getFileCache(file);

    if (cachedMetadata)
      accumulator.push({
        app,
        settings,
        timelineFile,
        file,
        cachedMetadata,
        elements: {
          timelineRootElement,
          cardListRootElement,
        },
      });
    return accumulator;
  }, [] as MarkdownCodeBlockTimelineProcessingContext[]);

  return dataBundleArray;
}
