import "./obsidianMocks";
import {
  mockMarkdownCodeBlockTimelineProcessingContext,
  mockCompleteCardContext,
} from "./obsidianMocks";

import { SETTINGS_DEFAULT } from "~/settings";
import {
  getDataFromNoteBody,
  getDataFromFantasyCalendarSpanEvents,
  getInlineEventData,
} from "~/inlineEventData";

describe.concurrent("Inline Event Data", () => {
  test("[getDataFromNoteBody] - ok empty", async () => {
    const {
      context,
      cardData: { body },
    } = mockCompleteCardContext();

    expect(
      await getDataFromNoteBody(body, context, ["timeline"]),
    ).toStrictEqual([]);
  });

  test("[getDataFromNoteBody] - ok nothing to parse", async () => {
    const {
      context,
      cardData: { body },
    } = mockCompleteCardContext({
      context: mockMarkdownCodeBlockTimelineProcessingContext(),
      cardData: {
        body: "%%aat-inline-event\n%%\nsampletext",
      },
    });

    expect(
      await getDataFromNoteBody(body, context, ["timeline"]),
    ).toStrictEqual([]);
  });

  test("[getDataFromNoteBody] - ok no matches", async () => {
    const {
      context,
      cardData: { body },
    } = mockCompleteCardContext({
      context: mockMarkdownCodeBlockTimelineProcessingContext(),
      cardData: {
        body: "nothing here",
      },
    });

    expect(
      await getDataFromNoteBody(body, context, ["timeline"]),
    ).toStrictEqual([]);
  });

  test("[getDataFromNoteBody] - ok tags are not valid", async () => {
    const {
      context,
      cardData: { body },
    } = mockCompleteCardContext({
      context: mockMarkdownCodeBlockTimelineProcessingContext(),
      cardData: {
        body: "'%%aat-inline-event\naat-event-start-date: 54\naat-event-end-date: true\naat-render-enabled: true\ntimelines: [nottimeline]\n%%",
      },
    });

    expect(
      await getDataFromNoteBody(body, context, ["timeline"]),
    ).toStrictEqual([]);
  });

  test("[getDataFromNoteBody] - ko missing render key with true", async () => {
    const {
      context,
      cardData: { body },
    } = mockCompleteCardContext({
      context: mockMarkdownCodeBlockTimelineProcessingContext(),
      cardData: {
        body: "'%%aat-inline-event\naat-event-start-date: 54\naat-event-end-date: true\naat-render-enabled: false\ntimelines: [nottimeline]\n%%",
      },
    });

    expect(
      await getDataFromNoteBody(body, context, ["timeline"]),
    ).toStrictEqual([]);
  });

  test("[getDataFromNoteBody] - ok tags are valid", async () => {
    const {
      context,
      cardData: { body },
    } = mockCompleteCardContext({
      context: mockMarkdownCodeBlockTimelineProcessingContext(),
      cardData: {
        body: "'%%aat-inline-event\naat-event-start-date: 54\naat-event-end-date: true\naat-render-enabled: true\ntimelines: [timeline]\n%%",
      },
    });

    expect(
      (await getDataFromNoteBody(body, context, ["timeline"])).length,
    ).toBe(1);
  });

  // START FC Component

  test("[getDataFromFantasyCalendarSpanEvents] - ok empty", async () => {
    const {
      context,
      cardData: { body },
    } = mockCompleteCardContext({
      context: {
        settings: SETTINGS_DEFAULT,
      },
    });

    expect(
      await getDataFromFantasyCalendarSpanEvents(body, context, ["timeline"]),
    ).toStrictEqual([]);
  });

  test("[getDataFromFantasyCalendarSpanEvents] - ok nothing to parse", async () => {
    const {
      context,
      cardData: { body },
    } = mockCompleteCardContext({
      context: mockMarkdownCodeBlockTimelineProcessingContext(),
      cardData: {
        body: "<span data-name='nothing' />\n",
      },
    });

    expect(
      await getDataFromFantasyCalendarSpanEvents(body, context, ["timeline"]),
    ).toStrictEqual([]);
  });

  test("[getDataFromFantasyCalendarSpanEvents] - ok no matches", async () => {
    const {
      context,
      cardData: { body },
    } = mockCompleteCardContext({
      context: mockMarkdownCodeBlockTimelineProcessingContext(),
      cardData: {
        body: "nothing here",
      },
    });

    expect(
      await getDataFromFantasyCalendarSpanEvents(body, context, ["timeline"]),
    ).toStrictEqual([]);
  });

  test("[getDataFromFantasyCalendarSpanEvents] - ok tags are not valid", async () => {
    const {
      context,
      cardData: { body },
    } = mockCompleteCardContext({
      context: mockMarkdownCodeBlockTimelineProcessingContext(),
      cardData: {
        body: "<span data-name='hehe' data-date='54' data-end='true' timelines='[nottimeline]' />",
      },
    });

    expect(
      await getDataFromFantasyCalendarSpanEvents(body, context, ["timeline"]),
    ).toStrictEqual([]);
  });

  test("[getDataFromFantasyCalendarSpanEvents] - ok tags are valid", async () => {
    const {
      context,
      cardData: { body },
    } = mockCompleteCardContext({
      context: mockMarkdownCodeBlockTimelineProcessingContext(),
      cardData: {
        body: `<div
					data-name='hehe'
					data-date='54'
					data-end='true'
					timelines='[
						timeline,
						nottimelines
					]'
				/>`,
      },
    });

    expect(
      (await getDataFromFantasyCalendarSpanEvents(body, context, ["timeline"]))
        .length,
    ).toBe(1);
  });

  test("[getInlineEventData] - No inline data method available from settings", async () => {
    const {
      context,
      cardData: { body },
    } = mockCompleteCardContext({
      context: mockMarkdownCodeBlockTimelineProcessingContext(),
      cardData: {
        body: `<div
					data-name='hehe'
					data-date='54'
					data-end='true'
					timelines='[
						timeline,
						nottimelines
					]'
				/>

				%%aat-inline-event
				aat-event-start-date: 54
				aat-event-end-date: true
				aat-render-enabled: true
				timelines: [timeline]
				%%
			`,
      },
    });

    context.settings.lookForCalendariumSpanEvents = false;
    context.settings.lookForInlineEventsInNotes = false;
    expect((await getInlineEventData(body, context, ["timeine"])).length).toBe(
      0,
    );

    context.settings.lookForInlineEventsInNotes = true;
    expect((await getInlineEventData(body, context, ["timeine"])).length).toBe(
      0,
    );
    context.settings.lookForCalendariumSpanEvents = true;
    expect((await getInlineEventData(body, context, ["timeine"])).length).toBe(
      0,
    );
  });
});
