# Manual

How to use the ODM Poser (立体人形装置) screen. Press “?” in the editor for a list of operations for the device you are on (the hints).

日本語: [MANUAL-JA.md](MANUAL-JA.md)

## The screen

- **The views**: front (camera) and side. On the top left: undo / redo, the modes, the 3-axis handles and the cursors; on the top right: the display switches (joint limits, hidden lines, solid torso, side view, panel, theme, language, hints).
- **The panel**: outside the views. Category (Make, View, Output, About ODM-Poser) → tab → the items.
- Drag the edge between the views and the panel to give either more room (double-click or double-tap: back).

### The layout on each device

| Device | Views | Panel |
|--------|-------|-------|
| Computer, wide screens | left | right (left, top or bottom with the Panel and Menu buttons) |
| Tablet, tall monitor (upright) | top (50–85 % of the height) | bottom: items side by side over two rows of tabs and the category bar; ⇅ moves the bar and menu to the top |
| Phone (upright) | the whole screen | a category bar at the bottom; a full-screen menu opens from it with a simplified view above; drag the grip down to close |
| Phone, tablet (sideways) | left | right (top or bottom with Split screen) |

The panel's place and the views' share are kept apart for upright and sideways.

## Modes

Switch with the buttons on the view's top left, or by clicking a joint or a thing.

| Mode | What it does |
|------|--------------|
| Pose | Move joints (the 3-axis handles: rotate, and move for arms and legs) |
| Body | Change bone lengths, circle thickness, shoulder and hip widths (handles: scale) |
| Camera | Move the camera and the lens (perspective) |
| Place | Move objects, things and the whole figure |

### Switch modes by what is clicked

The setting of that name in the Pose tab (on at first) changes the mode to fit what you click.

| Clicked | Mode |
|---------|------|
| A joint (from Place or Camera) | Pose |
| Shift + a joint | Body (switches Pose ⇄ Body) |
| An object or a thing | Place (and selects it) |
| Empty space (from Pose or Body) | Camera |
| Empty space (Place) | Lets the selection go |

## Cursors: Drag and Hand

**Drag** and **Hand** on the view's left (V and H keys).

- **Drag**: a drag from an empty place selects what the box takes in (Shift adds).
- **Hand**: a drag anywhere turns the camera (Shift moves it).
- **Camera mode is always the hand.** A click let go without a drag switches the mode (the table above).

## 3-axis handles

Arrows and rings (move, rotate, scale) on the selected joint or thing. **3-axis handles** / **Off** on the view's left show and hide them; **Move**, **Rotate**, **Scale** (G, R, S keys) switch the tool.

- The arrows, rings and squares always follow the scene's X, Y, Z, however the thing is turned, and it turns about those axes. A square (scale) stretches the thing's side nearest to its axis.
- The arrow or ring held is drawn heavier, the others fade.
- Their size fits the screen (about 1.35 times on a phone, 1.5 on a tablet, 1.75 on a large screen).
- While they show, dragging a joint or a thing only selects it; the handles do the moving.
- In Place mode with a thing selected, **Pivot** is available: while pressed, the move handles move what it turns about (numbers in the Objects tab; see [props and objects](PROPS.md)).

## Selecting and editing things (Place mode)

Select by clicking, by a box, or Ctrl (⌘) + click to add or take out. Several selected move together and turn together on X, Y, Z about one thing's pivot: the last one added; Ctrl + Shift + click on another selected one makes it the centre (until the selection goes).

Ctrl + click the body (Place mode): takes the figure by its hips to move it (drag along the floor, or with the 3-axis handles' arrows and ring).

| Do | Key | Button on the view's left |
|----|-----|---------------------------|
| Take away | Delete (Backspace) | Delete |
| Cut, copy, paste | Ctrl + X, C, V | Cut, Copy, Paste |

On a narrow screen (a phone sideways) the menu on the left does not fit even in two columns, so “…” swaps the 3-axis handles with the cursor and edit buttons.

## Camera

| Do | What it does |
|----|--------------|
| Wheel | Zoom |
| Ctrl + Alt + wheel | Lens (wider: stronger perspective) |
| Middle button / Alt + drag | Turn the camera (Shift: move, Ctrl: zoom) |
| Numpad 1, 3, 7 | Front, right, top |
| Two fingers (phone) | Pinch to zoom, move to pan |
| Camera pad (phone) | Bottom left turns, bottom right moves, the right edge zooms |

## More pages

- [Props and objects](PROPS.md): holding and placing, sizes, selecting, the pivot
- [Export](EXPORT.md), [poses](POSES.md), [mods](MODDING.md)
