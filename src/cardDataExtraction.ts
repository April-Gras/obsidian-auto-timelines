/**
 * Returns a list of tags to for in a note based of plugin settings, note frontmatter and note tags.
 *
 * @param { AutoTimelineSettings } settings - The plugins settings.
 * @param { FrontMatterCache } metaData - The frontematter cache.
 * @param { TagCache[] | undefined } tags - Potencial tags.
 * @returns A list of tags to look for in a note.
 */
export function getTagsFromMetadataOrTagObject(
	settings: AutoTimelineSettings,
	metaData: FrontMatterCache,
	tags?: TagCache[]
): string[] {
	let output = [] as string[];
	const timelineArray = metaData[settings.metadataKeyEventTimelineTag];

	if (isDefinedAsArray(timelineArray))
		output = timelineArray.filter(isDefinedAsString);
	// Breakout earlier if we don't check the tags
	if (!settings.lookForTagsForTimeline) return output;
	if (isDefinedAsArray(tags))
		output = output.concat(tags.map(({ tag }) => tag.substring(1)));

	// Tags in the frontmatter
	const metadataInlineTags = metaData.tags;
	if (!isDefined(metadataInlineTags)) return output;
	if (isDefinedAsString(metadataInlineTags))
		output = output.concat(
			metadataInlineTags.split(",").map((e) => e.trim())
		);
	if (isDefinedAsArray(metadataInlineTags))
		output = output.concat(metadataInlineTags.filter(isDefinedAsString));
	// .substring called to remove the initial `#` in the notes tags
	return output;
}

export function getAbstractDateFromData(
	groupsToCheck: string[],
	metadataString: string,
	reg: RegExp | string
): AbstractDate | undefined {
	const matches = metadataString.match(reg);

	if (!matches || !matches.groups) return undefined;

	const { groups } = matches;

	const output = groupsToCheck.reduce((accumulator, groupName) => {
		const value = Number(groups[groupName]);

		// In the case of a faulty regex given by the user in the settings
		if (!isNaN(value)) accumulator.push(value);
		return accumulator;
	}, [] as AbstractDate);

	// Malformed payload bail out
	if (output.length !== groupsToCheck.length) return undefined;

	return output;
}
