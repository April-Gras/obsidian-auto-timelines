import {
  createElementShort,
  isDefined,
  getChildAtIndexInHTMLElement,
  compareAbstractDates,
} from "~/utils";

import type { Range } from "~/types";

/**
 * The color palette that obsidian defined in it's css bundle.
 * Useful for applying colors to elements programatically.
 */
const AVAILABLE_COLORS = [
  "red",
  "orange",
  "yellow",
  "green",
  "cyan",
  "blue",
  "purple",
  "pink",
] as const;

/**
 * Renders the little stripes in the gutter of the timeline.
 *
 * @param ranges - A collection of ranges.
 * @param rootElement - The root of all elements for this complete timeline.
 */
export function renderRanges(ranges: Range[], rootElement: HTMLElement) {
  const endDates: (number[] | true | undefined)[] = AVAILABLE_COLORS.map(
    () => undefined,
  );

  ranges.forEach((range) => {
    const {
      relatedCardData: {
        cardData: { startDate, endDate },
      },
    } = range;

    const offsetIndex = endDates.findIndex(
      (date) =>
        !isDefined(date) ||
        (date !== true && compareAbstractDates(startDate, date) > 0),
    );

    // Over the color limit
    if (offsetIndex === -1) return;

    renderSingleRange(range, offsetIndex, rootElement);
    endDates[offsetIndex] = endDate;
  });
}

/**
 * Renders a single range element based off the offset computed previously.
 *
 * @param param0 - A single range.
 * @param param0.index - The index of the card.
 * @param param0.targetPosition - The target position of a given range. This determines where the rage should end.
 * @param param0.cardRelativeTopPosition - The ammount of pixel from the top of the timeline relative to a given card.
 * @param param0.relatedCardData - The associated card data.
 * @param param0.relatedCardData.context - The associated runtime context for this card.
 * @param param0.relatedCardData.context.elements - The HTMLElements exposed for this context.
 * @param param0.relatedCardData.context.elements.cardListRootElement - The right side of the timeline, this is where the carads are spawned.
 * @param param0.relatedCardData.context.elements.timelineRootElement - The base layer for the timeline.
 * @param offset - The left offet index for this range.
 * @param rootElelement - The root HTMLElement of the timeline elements.
 *
 * @returns Nothing, but it renders a single range inside it's target element.
 */
export function renderSingleRange(
  {
    relatedCardData: {
      context: {
        elements: { timelineRootElement, cardListRootElement },
      },
    },
    targetPosition,
    cardRelativeTopPosition,
    index,
  }: Range,
  offset: number,
  rootElelement: HTMLElement,
) {
  const el = createElementShort(
    timelineRootElement,
    "div",
    "aat-range-element",
  );

  el.style.height = `${targetPosition - cardRelativeTopPosition}px`;
  el.style.top = `${cardRelativeTopPosition}px`;
  el.style.left = `${offset * 12}px`;
  el.style.backgroundColor = `var(--color-${AVAILABLE_COLORS[offset]})`;

  // Setup highlight link
  const relativeCardClassName = "aat-highlight-relative-card-to-range";

  el.onmouseenter = () => {
    const relativeCard = getChildAtIndexInHTMLElement(
      cardListRootElement,
      index,
    );

    relativeCard.classList.add(relativeCardClassName);
  };

  el.onmouseleave = () => {
    const relativeCard = getChildAtIndexInHTMLElement(
      cardListRootElement,
      index,
    );

    relativeCard.classList.remove(relativeCardClassName);
  };

  // Setup click event
  el.onclick = () => {
    const el = window.document.querySelector(
      ".markdown-reading-view > .markdown-preview-view",
    );

    if (!el) return;

    el.scrollTo({
      top: cardRelativeTopPosition + rootElelement.offsetTop - 8,
      behavior: "smooth",
    });
  };

  return el;
}
