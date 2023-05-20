import { mock } from "vitest-mock-extended";
import { DEFAULT_METADATA_KEYS } from "~/settings";

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
	class TfileStub {
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
		TFile: TfileStub,
	};
});

export const HTMLElementMock: HTMLElement = {
	...mock<HTMLElement>(),
	createDiv: vi.fn(() => {
		return HTMLElementMock as HTMLDivElement;
	}),
	classList: {
		...mock<HTMLElement["classList"]>(),
		add: vi.fn(() => {
			return;
		}),
	},
};

export const ObsidianAppMock: App = {
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

export const mockMarkdownCodeBlockTimelineProcessingContext: MarkdownCodeBlockTimelineProcessingContext =
	mock<MarkdownCodeBlockTimelineProcessingContext>({
		settings: DEFAULT_METADATA_KEYS,
		cachedMetadata: {
			frontmatter: {
				[DEFAULT_METADATA_KEYS.metadataKeyEventStartDate]:
					"1000-1000-1000",
			},
		},
	} as MarkdownCodeBlockTimelineProcessingContext) as MarkdownCodeBlockTimelineProcessingContext;
