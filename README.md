# Aprils automatic timelines

A theme agnostic timeline generator for [obsidian](https://obsidian.md/)

<img src="https://user-images.githubusercontent.com/1866440/232319031-7eeb18ef-da01-488d-b0cc-f528e7760574.png" width=480 />

This plugins allows you to tag notes to generate timelines. It's designed with story telling in mind.

### How to use

Start by adding some metadata to the notes that you want to appear in your timeline.

```yml
aat-event-start-date: 359 # Required
aat-event-end-date: 435 # Optional, can be set to `true` if you want it to span troughout the entire timeline
aat-render-enabled: true # Enables this note to be rendered in a timeline
timelines: [timeline, event] # This note should be rendered in the timeline with the name "timeline" or "event"
```

Once you tagged at least one note create a new note and add a new markdow code block using three backquotes and flagging it as `aat-vertical` and adding the name of the timeline as it's content

![image](https://user-images.githubusercontent.com/1866440/232321979-f450c212-f03c-491d-a992-a12f0c5e2420.png)

This will scan the vault for all notes flagged to render inside the `timeline` timeline

Behind the scenes the plugin will parse the content and generate a card for each note. The only manual content needed to create a card in a timeline is the start date.
