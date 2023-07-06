import { mock } from "vitest-mock-extended";
import { SETTINGS_DEFAULT } from "~/settings";
import {
	TFile as TFileClass,
	Component as ObsidianComponent,
	App as ObsidianApp,
} from "obsidian";

import type {
	App,
	Vault,
	TFolder,
	TFile,
	FileStats,
	CachedMetadata,
	FrontMatterCache,
} from "obsidian";
import type { DeepPartial } from "ts-essentials";
import type {
	CardContent,
	CompleteCardContext,
	MarkdownCodeBlockTimelineProcessingContext,
	Range,
} from "~/types";

vi.mock("obsidian", () => {
	class TFile {
		stat: FileStats;
		basename: string;
		extension: string;
		vault: Vault;
		path: string;
		name: string;
		parent: TFolder | null;
		constructor() {
			this.stat = mock<FileStats>();
			this.basename = mock<string>();
			this.extension = mock<string>();
			this.vault = mock<Vault>();
			this.path = mock<string>();
			this.name = mock<string>();
			this.parent = mock<TFolder | null>();
		}
	}

	class Plugin {
		containerEl: HTMLElement;
		app: ObsidianApp;

		constructor(app: ObsidianApp, manifest: Record<string, unknown>) {
			this.containerEl = mock<HTMLElement>();
			this.app = app;
			return;
		}

		saveData = vi.fn();

		loadData = vi.fn(async () => ({ someKey: "someValue" }));
		addSettingTab = vi.fn();
		registerMarkdownCodeBlockProcessor = vi.fn();
	}

	class MarkdownRenderChild {
		containerEl: HTMLElement;

		constructor(containerEl: HTMLElement) {
			this.containerEl = containerEl;
			return;
		}
	}

	return {
		PluginSettingTab: Plugin,
		TFile: TFile,
		MarkdownRenderer: {
			async renderMarkdown(
				markdown: string,
				el: HTMLElement,
				sourcePath: string,
				component: ObsidianComponent
			): Promise<void> {
				return;
			},
		},
		MarkdownRenderChild,
		Plugin,
	};
});

export function mockHTMLElement(): HTMLElement {
	// @ts-expect-error
	return mock<HTMLElement>({
		children: {
			item: vi
				.fn((_: number) => null as Element | null)
				.mockImplementationOnce(mockHTMLElement),
		},
		createDiv: vi.fn(() => {
			return mockHTMLElement() as HTMLDivElement;
		}),
		offsetTop: 0,
		innerHeight: 0,
		// @ts-expect-error
		createEl: vi.fn(
			<K extends keyof HTMLElementTagNameMap>(
				_: K,
				__?: DomElementInfo | string,
				___?: (el: HTMLElementTagNameMap[K]) => void
			): HTMLElementTagNameMap[K] => {
				return mockHTMLElement() as HTMLElementTagNameMap[K];
			}
		),
		addClass: vi.fn(() => {
			return;
		}),
		classList: {
			add: vi.fn(() => {
				return;
			}),
		},
	});
}

export function mockGetFileCache() {
	return vi.fn<[], CachedMetadata | null>(() => {
		return {
			frontmatter: {
				...mock<FrontMatterCache>(),
				timelines: ["timeline"],
				"aat-render-enabled": true,
				[SETTINGS_DEFAULT.metadataKeyEventStartDate]: mock<number>(),
				[SETTINGS_DEFAULT.metadataKeyEventEndDate]: mock<number>(),
			},
		};
	});
}

export function mockObsidianApp(): App {
	return mock<App>({
		vault: mockVault(),
		metadataCache: {
			getFileCache: mockGetFileCache().mockReturnValueOnce(null),
		},
	});
}

export function mockTFile() {
	return mock<TFile>({
		vault: {
			cachedRead: vi.fn(async (file: TFile) => {
				return "---\n---\n---\nSample file data";
			}),
		},
	});
}

export function mockVault(): Vault {
	return mock<Vault>({
		getResourcePath: vi.fn((file: TFile) => {
			return "sample";
		}),
		cachedRead: vi.fn(async (file: TFile) => {
			return "---\n---\n---\nSample file data";
		}),
		getMarkdownFiles: vi.fn(() => {
			return [mockTFile(), mockTFile()];
		}),
	});
}

export function mockMarkdownCodeBlockTimelineProcessingContext(): MarkdownCodeBlockTimelineProcessingContext {
	const vault = mockVault();
	return mock<MarkdownCodeBlockTimelineProcessingContext>({
		app: {
			vault,
			metadataCache: {
				getFirstLinkpathDest: vi.fn(
					(linkpath: string, sourcePath: string): TFile | null => {
						return new TFileClass();
					}
				),
			},
		},
		file: {
			basename: "basename",
			vault,
		},
		elements: {
			cardListRootElement: mockHTMLElement(),
			timelineRootElement: mockHTMLElement(),
		},
		settings: SETTINGS_DEFAULT,
		cachedMetadata: {
			frontmatter: {
				"aat-render-enabled": true,
				[SETTINGS_DEFAULT.metadataKeyEventPictureOverride]: undefined,
				[SETTINGS_DEFAULT.metadataKeyEventBodyOverride]: undefined,
				[SETTINGS_DEFAULT.metadataKeyEventStartDate]: "1000-1000-1000",
				[SETTINGS_DEFAULT.metadataKeyEventTitleOverride]: undefined,
			},
		},
	});
}

export function mockCardContext() {
	return mock<CardContent>({
		startDate: [1000, 0, 0],
		endDate: true,
		body: "Sample body",
		imageURL: "https://sampleURL.png",
		title: "Sample title",
	});
}

export function mockRange(defaultVal: DeepPartial<Range> = {}): Range {
	return mock<Range>(defaultVal);
}

export function mockCompleteCardContext(
	defaultVal: DeepPartial<CompleteCardContext> = {}
): CompleteCardContext {
	return mock<CompleteCardContext>(defaultVal);
}
