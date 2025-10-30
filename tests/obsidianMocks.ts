/* eslint-disable @typescript-eslint/no-unused-vars */
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
  TAbstractFile,
  EventRef,
  Editor,
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
      this.basename = "sample file base";
      this.extension = mock<string>();
      this.vault = mock<Vault>();
      this.path = mock<string>();
      this.name = mock<string>();
      this.parent = mock<TFolder | null>();
    }
  }

  class EditorSuggest {
    constructor(_app: ObsidianApp) {
      return;
    }
  }

  class Plugin {
    containerEl: HTMLElement;
    app: ObsidianApp;

    constructor(app: ObsidianApp, _manifest: Record<string, unknown>) {
      this.containerEl = mock<HTMLElement>();
      this.app = app;
      return;
    }

    saveData = vi.fn();
    registerEditorSuggest = vi.fn();
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
    EditorSuggest: EditorSuggest,
    TFile: TFile,
    MarkdownRenderer: {
      async render(
        _: string,
        __: HTMLElement,
        ___: string,
        ____: ObsidianComponent,
      ): Promise<void> {
        return;
      },
    },
    MarkdownRenderChild,
    Plugin,
  };
});

/**
 * Mock a native HTMLElement object.
 *
 * @returns - The mocked native HTMLElement object.
 */
export function mockHTMLElement(): HTMLElement {
  // @ts-expect-error very agressive mock.
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
    // @ts-expect-error agressive assign but it works
    createEl: vi.fn(
      <K extends keyof HTMLElementTagNameMap>(
        _: K,
        __?: DomElementInfo | string,
        ___?: (el: HTMLElementTagNameMap[K]) => void,
      ): HTMLElementTagNameMap[K] => {
        return mockHTMLElement() as HTMLElementTagNameMap[K];
      },
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

/**
 * Quickhand function to mock the obsidian `mockGetFileCache` function.
 *
 * @returns - The mocked obsidian `mockGetFileCache` function.
 */
export function mockGetFileCache() {
  return vi.fn<() => CachedMetadata | null>(() => {
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

/**
 * Quickhand function to mock a obsidian App Class.
 *
 * @returns - the mocked obsidian App class.
 */
export function mockObsidianApp(): App {
  return mock<App>({
    vault: mockVault(),
    metadataCache: {
      getFileCache: mockGetFileCache().mockReturnValueOnce(null),
    },
  });
}

/**
 * Quickhand function to mock the obsidian TFile class.
 *
 * @param basename Basename override.
 * @returns - The mocked obsidian TFile.
 */
export function mockTFile(basename = "sample") {
  return mock<TFile>({
    vault: {
      cachedRead: vi.fn(async (_: TFile) => {
        return "---\n---\n---\nSample file data";
      }),
    },
    basename,
    path: `./${basename}Path`,
  });
}

/**
 * Quickhand function to mock a Obsidian Vault.
 *
 * @returns - The mocked vault.
 */
export function mockVault(): Vault {
  return mock<Vault>({
    getResourcePath: vi.fn((_file: TFile) => {
      return "sample";
    }),
    on: vi.fn(
      (
        _name: "create" | "delete" | "modify" | "rename" | "closed",
        _cb: (file: TAbstractFile) => unknown,
        _ctx?: unknown,
      ) => {
        return {} as EventRef;
      },
    ) as Vault["on"],
    cachedRead: vi.fn(async (_file: TFile) => {
      return "---\n---\n---\nSample file data";
    }),
    getMarkdownFiles: vi.fn(() => {
      return [mockTFile(), mockTFile()];
    }),
  });
}

/**
 * Quickly mock a MarkdownCodeBlockTimelineProcessingContext. A lot of default are set so inspect the function for further details.
 *
 * @returns - The mocked object.
 */
export function mockMarkdownCodeBlockTimelineProcessingContext(): MarkdownCodeBlockTimelineProcessingContext {
  const vault = mockVault();
  return mock<MarkdownCodeBlockTimelineProcessingContext>({
    app: {
      vault,
      metadataCache: {
        getFirstLinkpathDest: vi.fn(
          (_linkpath: string, _sourcePath: string): TFile | null => {
            return new TFileClass();
          },
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

/**
 * Quickly mock a card context object.
 *
 * @returns - The mocked card content.
 */
export function mockCardContext() {
  return mock<CardContent>({
    startDate: [1000, 0, 0],
    endDate: true,
    body: "Sample body",
    imageURL: "https://sampleURL.png",
    title: "Sample title",
  });
}

/**
 * Mocks a Range object.
 *
 * @param defaultVal - Value override for user defined cases.
 * @returns -  A mocked range object.
 */
export function mockRange(defaultVal: DeepPartial<Range> = {}): Range {
  return mock<Range>(defaultVal);
}

/**
 * Mocks the complete card context.
 *
 * @param defaultVal - Value override for user defined cases.
 * @returns -  The complete card context mock object.
 */
export function mockCompleteCardContext(
  defaultVal: DeepPartial<CompleteCardContext> = {},
): CompleteCardContext {
  return mock<CompleteCardContext>(defaultVal);
}

/**
 * Mocks the obsidian editor object.
 *
 * @param defaultVal - Value override for user defined cases.
 * @returns the newly created mock.
 */
export function mockObsidianEditor(defaultVal: DeepPartial<Editor> = {}) {
  return mock<Editor>(defaultVal);
}
