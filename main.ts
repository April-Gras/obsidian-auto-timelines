import { Plugin } from "obsidian";

import type {
	AutoTimelineSettings,
	MarkdownCodeBlockTimelineProcessingContext,
} from "~/types";
import { setupTimelineCreation, getMetadataKey } from "~/utils";
import { DEFAULT_METADATA_KEYS } from "~/settings";

const DEFAULT_SETTINGS: AutoTimelineSettings = {};

export default class MyPlugin extends Plugin {
	settings: AutoTimelineSettings;

	async onload() {
		await this.loadSettings();

		this.registerMarkdownCodeBlockProcessor(
			"aat-vertical",
			async (source, element, _ctx) => {
				console.time("[April's auto-timeline plugin] - Run time");
				const {
					app: { vault, metadataCache },
				} = this;
				// Find what tags we need
				const tagsToFind = source.split(" ");
				const creationContext = await setupTimelineCreation(
					vault,
					metadataCache,
					element
				);

				console.time("[April's auto-timeline plugin] - Data fetch");
				const cards = (
					await Promise.all(
						creationContext.map((e) =>
							getCardDataFromContext(e, tagsToFind)
						)
					)
				)
					.filter(isDefined)
					.sort(
						(
							{ cardData: { startDate: a } },
							{ cardData: { startDate: b } }
						) => {
							// Since these are numbers we can't check with `!`
							if (a === undefined && b === undefined) return 0;
							if (a === undefined) return 1;
							if (b === undefined) return -1;
							return a - b;
						}
					);
				console.timeEnd("[April's auto-timeline plugin] - Data fetch");

				console.time("[April's auto-timeline plugin] - Render");
				cards.forEach(({ context, cardData }) =>
					createCardFromBuiltContext(context, cardData)
				);
				console.timeEnd("[April's auto-timeline plugin] - Render");
				console.timeEnd("[April's auto-timeline plugin] - Run time");
			}
		);
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

const RENDER_GREENLIGHT_METADATA_KEY = ["aat-render-enabled"];
async function getCardDataFromContext(
	context: MarkdownCodeBlockTimelineProcessingContext,
	tagsToFind: string[]
) {
	const { cachedMetadata } = context;
	const { frontmatter: metaData } = cachedMetadata;

	if (!metaData) return undefined;
	if (!RENDER_GREENLIGHT_METADATA_KEY.some((key) => metaData[key] === true))
		return undefined;
	if (
		!metaData.timelines ||
		!(metaData.timelines instanceof Array) ||
		!metaData.timelines.length
	)
		return undefined;
	const timelineTags = metaData.timelines.filter(isDefinedAsString);

	// TimelineTags is not defined as an array :<
	if (!timelineTags.length || !timelineTags.some(() => tagsToFind.includes))
		return undefined;

	return {
		cardData: await getCardContentFromContext(context),
		context,
	} as const;
}

function createElementShort(
	el: HTMLElement,
	element: keyof HTMLElementTagNameMap,
	classes?: string[] | string,
	content?: string | number
) {
	const out = el.createEl(element);

	if (classes instanceof Array) out.addClass(...classes);
	else if (classes) out.addClass(classes);
	if (content !== undefined) out.innerHTML = content.toString();
	return out;
}

function createCardFromBuiltContext(
	{
		elements: { cardListRootElement },
		file,
	}: MarkdownCodeBlockTimelineProcessingContext,
	{ body, title, imageURL, startDate }: CardContent
) {
	const cardBaseDiv = createElementShort(cardListRootElement, "a", [
		"internal-link",
		"aat-card",
	]);
	cardBaseDiv.setAttribute("href", file.path);

	if (imageURL) {
		createElementShort(cardBaseDiv, "img", "aat-card-image").setAttribute(
			"src",
			imageURL
		);
		cardBaseDiv.addClass("aat-card-has-image");
	}

	const cardTextWraper = createElementShort(
		cardBaseDiv,
		"div",
		"aat-card-text-wraper"
	);

	const titleWrap = createElementShort(
		cardTextWraper,
		"header",
		"aat-card-head-wrap"
	);

	createElementShort(titleWrap, "h2", "aat-card-title", title);
	console.log({ startDate });
	if (startDate !== undefined)
		createElementShort(titleWrap, "h4", "aat-card-start-date", startDate);

	// TODO image styles

	createElementShort(
		cardTextWraper,
		"p",
		"aat-card-body",
		body ? body : "No body for this note :("
	);
}

type CardContent = Awaited<ReturnType<typeof getCardContentFromContext>>;
async function getCardContentFromContext(
	context: MarkdownCodeBlockTimelineProcessingContext
) {
	const { file, cachedMetadata } = context;
	const rawFileContent = await file.vault.cachedRead(file);
	const fileTitle = file.basename;

	return {
		title: fileTitle,
		body: getBodyFromContextOrDocument(rawFileContent, context),
		imageURL: getImageUrlFromContextOrDocument(rawFileContent, context),
		startDate: getMetadataKey(
			cachedMetadata,
			DEFAULT_METADATA_KEYS.eventStartDate,
			"number"
		),
	} as const;
}

function getBodyFromContextOrDocument(
	rawFileText: string,
	context: MarkdownCodeBlockTimelineProcessingContext
): string | null {
	const {
		cachedMetadata: { frontmatter: metadata },
	} = context;
	const overrideBody = metadata?.["aat-body"] ?? null;

	if (!rawFileText) return overrideBody;

	const rawTextArray = rawFileText.split("\n");
	rawTextArray.shift();
	const processedArray = rawTextArray.slice(rawTextArray.indexOf("---") + 1);
	const finalString = processedArray.join("\n").trim();

	return (
		finalString
			// Remove vanilla links
			.replace(/\[\[([a-z0-9 ]*)\]\]/gi, "<b>$1</b>")
			// Remove named links
			.replace(/\[\[[a-z0-9 ]*\|([a-z0-9 ]*)\]\]/gi, "<b>$1</b>")
			// Remove clutter
			.replace(/#|!\[\[.*\]\]/gi, "")
			.trim()
	);
}

function getImageUrlFromContextOrDocument(
	rawFileText: string,
	context: MarkdownCodeBlockTimelineProcessingContext
): string | null {
	const {
		cachedMetadata: { frontmatter: metadata },
	} = context;
	const matchs = rawFileText.match(/!\[\[(?<src>.*)\]\]/);

	if (!matchs || !matchs.groups || !matchs.groups.src)
		return metadata?.["aat-image-url"] || null;

	return `app://local/home/mgras/book/Book/${encodeURI(matchs.groups.src)}`;
}

function isDefined<T>(argument: T | undefined): argument is T {
	return !!argument;
}
function isDefinedAsString(argument: unknown): argument is string {
	return typeof argument === "string";
}
