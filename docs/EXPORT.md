# Export (pictures, OpenPose, the pose file)

Save what you made from the **Export** menu, as pictures or as a file.

日本語: [EXPORT-JA.md](EXPORT-JA.md)

## Size

| Field | What it does |
|-------|--------------|
| Aspect ratio | 1:1, 3:4, 16:9, A / B paper, ... **Custom ratio** for any width and height parts |
| Long side | The long side in pixels, with a ratio chosen |
| Width, height | The picture's size in pixels. Typing them sets the ratio to free |

The front (camera) view's frame takes this ratio: what is inside the frame is what is exported. If the
device cannot draw a picture that big, the editor makes it as big as it can and says so.
Changing the ratio or size leaves the camera where it is: what the picture's height shows stays, and the sides widen or are cut.

## What to export

| Button | What it holds | For |
|--------|---------------|-----|
| Rough picture | Lines and circles of the figures, props (simple shapes) and auras on white; with **What the rough picture shows** on Composition (the default), the objects, floor and walls too | Sketches, img2img |
| OpenPose picture | The body's 18 points and 21 for each hand in the standard colours, on black | ControlNet (OpenPose) |
| Pose (.json) | Everything as it is: figures, props, objects, floor and walls, camera, ... | Going on later, handing it to someone |
| Composition picture | Only what **In the composition picture** below has on | Backgrounds, a layout sketch |

A picture is shown whole before it is saved: **Save** saves it, **Cancel** goes back. In the app
([DOWNLOAD.md](DOWNLOAD.md)) a "save as" window asks where.

### What the rough picture shows

**Composition (figures, things, objects, surroundings)** (the default) also draws the objects, floor and walls on white, as the **In the composition picture** checks below say (no ruler). **Figures and things only** is the rough picture as before, without them.

### The composition picture

**In the composition picture** turns figures, props, objects, surroundings (floor, walls, ceiling),
the ruler and auras on or off one by one. The background is **White**, **Transparent** or **Theme** (as
on screen); transparent gives the lines alone.

### Figures in the picture

With two figures or more, **Figures in the picture** is **Everyone** or one of them. With one, the rough,
OpenPose and composition pictures show only that figure (and what it holds). Things put down,
objects, the floor and walls are drawn either way.

## Opening a pose file

**Open** → **Open a pose file** opens a pose you exported (.json): figures, props, objects and the camera
come back. Files from earlier versions open too.

## Posting and links

**Post to social media** posts to X, Bluesky, Misskey, Mastodon and more. With **Attach the composition picture** on (the default), the post carries the composition as it is now (the same as Export's composition picture, on white, its long side up to 2048 pixels): a phone hands the picture and the post's text to the share menu (pick the network's app there); a computer opens the post page and copies the picture: paste it into the post box with Ctrl+V (⌘V on a Mac). A browser that cannot copy pictures shows the picture to save instead. The link's card (the picture under a link) stays the site's own: with no server behind the site, a card cannot show each composition. With **Link with the editing
data** on, whoever opens it gets the same figures, props and camera in their
editor. **Copy the link** takes the link alone.
