import { mock } from "vitest-mock-extended";
import { DEFAULT_METADATA_KEYS } from "~/settings";
import { TFile as TFileClass } from "obsidian";

import type {
	App,
	Vault,
	TFolder,
	TFile,
	FileStats,
	CachedMetadata,
	FrontMatterCache,
} from "obsidian";
import type { MarkdownCodeBlockTimelineProcessingContext } from "~/types";

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

	return {
		PluginSettingTab: null,
		TFile: TFile,
	};
});

export function mockHTMLElement(): HTMLElement {
	return {
		...mock<HTMLElement>(),
		createDiv: vi.fn(() => {
			return mockHTMLElement() as HTMLDivElement;
		}),
		classList: {
			...mock<HTMLElement["classList"]>(),
			add: vi.fn(() => {
				return;
			}),
		},
	};
}

export function mockObsidianApp(): App {
	return {
		...mock<App>(),
		vault: {
			...mock<App["vault"]>(),
			getMarkdownFiles: vi.fn(() => {
				return [mock<TFile>(), mock<TFile>()];
			}),
		},
		metadataCache: {
			...mock<App["metadataCache"]>(),
			getFileCache: vi
				.fn<[], CachedMetadata | null>(() => {
					return {
						...mock<CachedMetadata>(),
						frontmatter: {
							...mock<FrontMatterCache>(),
							[DEFAULT_METADATA_KEYS.metadataKeyEventStartDate]:
								mock<number>(),
							[DEFAULT_METADATA_KEYS.metadataKeyEventEndDate]:
								mock<number>(),
						},
					};
				})
				.mockReturnValueOnce(null),
		},
	};
}

export function mockVault(): Vault {
	return mock<Vault>({
		getResourcePath: (file: TFile) => {
			return "sample";
		},
		cachedRead: async (file: TFile) => {
			return "---\n---\n---\nSample file data";
		},
	});
}

export function mockMarkdownCodeBlockTimelineProcessingContext(): MarkdownCodeBlockTimelineProcessingContext {
	const vault = mockVault();
	return mock<MarkdownCodeBlockTimelineProcessingContext>({
		app: {
			vault,
			metadataCache: {
				getFirstLinkpathDest(
					linkpath: string,
					sourcePath: string
				): TFile | null {
					return new TFileClass();
				},
			},
		},
		file: {
			basename: "basename",
			vault,
		},
		settings: DEFAULT_METADATA_KEYS,
		cachedMetadata: {
			frontmatter: {
				"aat-render-enabled": true,
				[DEFAULT_METADATA_KEYS.metadataKeyEventPictureOverride]:
					undefined,
				[DEFAULT_METADATA_KEYS.metadataKeyEventBodyOverride]: undefined,
				[DEFAULT_METADATA_KEYS.metadataKeyEventStartDate]:
					"1000-1000-1000",
				[DEFAULT_METADATA_KEYS.metadataKeyEventTitleOverride]:
					undefined,
			},
		},
	});
}
