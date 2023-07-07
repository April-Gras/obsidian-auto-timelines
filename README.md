# Aprils automatic timelines

A theme agnostic timeline generator for [obsidian](https://obsidian.md/)

<img src="https://user-images.githubusercontent.com/1866440/232319031-7eeb18ef-da01-488d-b0cc-f528e7760574.png" width=480 />

This plugins allows you to tag notes to generate timelines. It's designed with story telling in mind.

## Sample vault with basic examples
[TimelineSampleVault.zip](https://github.com/April-Gras/obsidian-auto-timelines/files/11983177/TimelineSampleVault.zip)

Here's a zip file of a obsidian vault with various basic examples to help you build timelines.
Alternatively [Josh Plunkett](https://www.youtube.com/@JoshPlunkett) did [a tutorial video](https://www.youtube.com/watch?v=992o1j8zRSk) covering the basics

### How to use

Start by adding some metadata to the notes that you want to appear in your timeline.

```yml
aat-event-start-date: 359 # Required
aat-event-end-date: 435 # Optional, can be set to `true` if you want it to span troughout the entire timeline
aat-render-enabled: true # Enables this note to be rendered in a timeline
timelines: [timeline, event] # This note should be rendered in the timeline with the name "timeline" or "event"
```

Once you tagged at least one note create a new note and add a new markdow code block using three backquotes and flagging it as `aat-vertical` and adding the name of the timeline as it's content.
You can also give multiple names to your timeline by seperating the values with a `,` (This value can be changed in the settings)

![image](https://github.com/April-Gras/obsidian-auto-timelines/assets/1866440/78de88e6-7048-47a6-b943-fe7bbae58c69)

This will scan the vault for all notes flagged to render inside the `timeline` timeline

Behind the scenes the plugin will parse the content and generate a card for each note. The only manual content needed to create a card in a timeline is the start date.

#### Aditional metadata keys

Sometimes the content of a note is not exacly what you want to appear in the card.
To remedy that, the plugin exposes three keys that are by default:

```yml
aat-event-title: New title # Used to override the title of a generated card.
aat-event-body: New card body # Used to override the text content of a generated card.
aat-event-picture: https://f4.bcbits.com/img/a1344871335_65 #Some external link, support for internal links is missing for now
```

#### Avanced date formats

Sometimes good old `year-month-day` timeformat just doesn't cut it for your world and you have a more complex timesystem in use.
The plugin exposes 3 majors settings to help achieve your desired time format.
Before getting into too many details make sure you're familliar with RegExps and named capture groups within them. If this is not the case fireship.io has a [great video for begginers](https://www.youtube.com/watch?v=sXQxhojSdZM) to start your learning journey.

##### Date Parser Regex

By default the plugin will rely on this RegExp

```regex
(?<year>-?[0-9]*)-(?<month>-?[0-9]*)-(?<day>-?[0-9]*)
```

As you can see it will capture any date that follows the following format: `numbers-numbers-numbers`.
But there's a little subtlety here. The named capture groups `<year>` `<month>` and `<day>`. These will becomme important latter down the line.

##### Date Parser Group Priority

This setting should be built directly off the previously created RegExp. In the case of the default regex we have 3 main tokens. `year` `month` and `day`. You can find them in the named capture groups.

In this setting you should order the tokens per weights. So in our case: `year,month,day`
Every token should follow same syntax used in the named capture groups from the previous RegExp and be separated by a single comma (`,`).

##### Date Display Format

The most straight forward of all three date format settings. This is the template for the actually in card display. Just wrap every token in `{}` and format it the way you like. For example to display `yyyy-MM-dd` we'll write: `{year}-{month}-{day}`.

##### Example fantasy date formats.

###### cycle-moon-phase-day

Let's get a little wild and imagine a world where time is tracked this way

-   `Cycles` are the hightest value of time, each cycle can see 3 moons come and go.
-   `Moons` are more frequent than cycles and are comprised of phases.
-   `Phases` are more frequent than moons per cycle and are comprised of days.
-   `Days` are the lowest relevant time unit in this system.

Let's say in our metadata we want to store the value as such

```yml
# 14 phases & 23 days on the 2'nd moon of the 687'th cycle
aat-event-start-date: 14&23-2M-687C
```

Our regex would look something like this

```regexp
(?<phase>[0-9]*)\&(?<day>[0-9]*)-(?<moon>[0-9]*)M-(?<cycle>[0-9]*)C
```

One capture group per date token can be found.
Now to set our date parser group priority:
`cycle,moon,phase,day`

And let's say we want a fairly minimal display format where only the cycle and the moon are displayed.

```
cycle {cycle}, {moon}
```

The end result for our initaly declared metadata would look something like: `cycle 687, 2`.

##### Date token types

In some cases numbers displaying your dates as plain numbers won't really cut it. This is where date token types come in. For now they come in two flavors

- `numerical`: These date tokens should be displayed as default, for example the day and the year in `06 july 2018` are numerical date tokens. The `day` token has a minial length of `2` and the `year` token has a minimal length of `4`.
- `string`: These are a bit more cumbersome to configure but add great visibility. For instance in our previous example (`06 july 2018`) the `month` token is a `string` date token.
To configure your date tokens head to the plugins settings and use the `Date Format Settings` setup flow or edit them using advanced mode.

---

## Developement

As per obsidians [unofficial documentation](https://marcus.se.net/obsidian-plugin-docs/getting-started):

-   clone the repository in a test vault
-   `npm install` to install dependencies
-   `npm run dev` to launch dev watcher

## Testing

Before launching the unit tests, make sure to install the dependencies with `npm run install` and use `npm run prepare-vitest` to setup some changes for vitests to work correctly with obsidians package.

Once that's out of the way use `npm run test` to just launch the tests.
`npm run test-ui` to run the UI and see coverage in your browser.
