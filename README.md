Emphasis-Anchors
========

Emphasis-Anchors is a fork of NYT Emphasis which removes the highlighting utility
and is intended to only provide consistent content deep-linking.

This is a real jQuery plugin, unlike NYT Emphasis.

Options
-------------

To initialize emphasis-anchors do something like

`$('p').emphasisAnchors({/*options*/});`

There are some available options, these are the defaults

```javascript
{
    dataKeyAttribute: "data-emphasis-key",
    dataOrdinalAttribute: "data-emphasis-ord",
    anchorTargetClass: "emphasis-target",
    onMovedToAnchor: Function.prototype,
    onEmphasisDone: Function.prototype
}
```

This is something of a utility plugin and it won't look like much has happened on the page
after initialization. If you inspect the page, each applied paragraph should have some
data attributes like `data-emphasis-key` and `data-emphasis-ordinal`.

For real utility, you'll want to be using something that consumes those data attributes.

Out of the box, emphasis-anchors will jump down to any matching or close to matching
paragraphs if it finds a hash when the page loads. It will also add the `anchorTargetClass`
and after that is done call `onMovedToAnchor` which is enough to do basic paragraph
highlighting and generally know when the user has been delivered to your content.


Dependencies
------------

jQuery (Tested with 1.7)


Thanks
------

Levenshtein calculation in the script is based on some nice code by Andrew Hedges
http://andrew.hedges.name/experiments/levenshtein/

