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
| Pose | Move joints (the 3-axis handles: rotate, and move for arms, legs, shoulders and thigh roots) |
| Body | Change bone lengths, circle thickness, shoulder and hip widths (handles: scale) |
| Camera | Move the camera and the lens (perspective) |
| Place | Move objects, things and the whole figure |

### Switch modes by what is clicked

The setting of that name in the Pose tab (on at first) changes the mode to fit what you click.

| Clicked | Mode |
|---------|------|
| A joint (from Place or Camera) | Pose |
| Shift + a joint | Body (switches Pose ⇄ Body) |
| The hips' middle | Place (moves the whole figure; the 3-axis handles: move) |
| Shift + the hips' middle | Pose (turns the whole body; the 3-axis handles: rotate) |
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

- The arrows (move) keep to the scene's X, Y, Z wherever the thing is.
- The rings (rotate) and squares (scale) keep to the selected thing's own axes: a joint's (Y along its bone, Z toward the body's front), an object's or thing's (as it is turned). A square stretches the object's width, height or depth. With several objects selected, the rings keep to the scene's X, Y, Z.
- In Pose mode the shoulders and thigh roots have the move arrows too. Their bone from the chest / pelvis keeps its length and moves within the joint limits (a shoulder shrugs and goes forward or back; a thigh root barely), so the body's sizes stay and only the torso's and pelvis' trapezoids lean.
- In Body mode the head has three squares, **Length**, **Width** and **Depth**, which stretch its ball that way (as **Head shape** in the Body tab; the head's size stays). It grows from where the neck meets it (the head's bottom stays), so the neck gets neither shorter nor longer. A stretched head is drawn as an ellipsoid turned with the head, and the face's cross follows it.
- On a joint in Pose mode, the green (Y) ring twists along the bone (as **Twist** in the joint panel: on the elbow the forearm turns about the upper arm; on the head it looks left and right where it is). The hips' green ring turns the whole body about up.
- Where rings lie on each other, the one nearest to the press is taken (about as near: the green one).
- The arrow or ring held is drawn heavier, the others fade.
- Their size fits the screen (about 1.35 times on a phone, 1.5 on a tablet, 1.75 on a large screen).
- While they show, dragging a joint or a thing only selects it; the handles do the moving.
- In Place mode with a thing selected, **Pivot** is available: while pressed, the move handles move what it turns about (numbers in the Objects tab; see [props and objects](PROPS.md)).

## Selecting and editing things (Place mode)

Select by clicking, by a box, or Ctrl (⌘) + click to add or take out. Figures can be selected with them too, by a box or Ctrl + click (the other figures as well; a selected figure gets a dashed frame). Several selected move together with the 3-axis handles and turn together on X, Y, Z about one thing's pivot: the last one added (a figure's is its hips); Ctrl + Shift + click on another selected one makes it the centre (until the selection goes). Delete, cut and copy take only the objects; the figures stay. Ctrl + click in another mode goes to Place mode.

Ctrl + click the body (nothing selected): takes the figure by its hips to move it (drag along the floor, or with the 3-axis handles' arrows and ring).

| Do | Key | Button on the view's left |
|----|-----|---------------------------|
| Take away | Delete (Backspace) | Delete |
| Cut, copy, paste | Ctrl + X, C, V | Cut, Copy, Paste |

On a narrow screen (a phone sideways) the menu on the left does not fit even in two columns, so “…” swaps the 3-axis handles with the cursor and edit buttons.

## Standing on a face

A figure can stand on the floor, a wall, the ceiling or a face of an object put (slopes too). The whole body turns to the face: sideways on a wall, upside down on a ceiling, square to a slope.

What touches the face is the body's nearest, lowest point. By the pose that may be a knee, a hand, the head or the hips, not only the soles (each joint's circle counted). While the figure is on an object's face (its top too), a wall or the ceiling, its lowest point stays on the face however the pose changes: lift one foot and the other stays on it; kneel and the knees touch. On the floor, the **Grounding** setting in the Place tab decides. A pinned hips joint wins over this.

- In Place mode, drag the hips to bring the body near a face (any part within 15 cm) and the figure stands on it (**Stand on a near face when the hips move** in the Place tab turns this on and off).
- Press **Click a face to stand on** (Place or Objects tab), then click a face (Esc stops).
- Select an object in the Objects tab and press **Stand on the near face**: the figure stands on that object's face nearest to its body. **Stand on it** also puts the lowest point on the top and keeps the figure on it.
- The body does not go through to a face's other side or turn over. Pushed behind the face it stands on, it comes back onto it. Bringing the hips near does not take a face the hips are behind, nor one that would turn the body upside down (a ceiling, an object's underside). For those, turn on **Also stand on faces that turn the body over** in the Place tab, or use **Click a face to stand on**.
- Grounding starts as **No sinking into the floor or objects** (when starting afresh or after a reset).
- While on any face but the floor, dragging the hips moves the figure along the face. Pulled away from it (with the 3-axis handles, say), the figure lets go.
- **Stand upright again** turns a tilted body upright.

## Body and sizes

The **Body** tab now holds the sex, height and overall size together with each part's size (locked parts, head and torso, arms and legs, head shape). The height and the heads count are in one place, the **Body** section, with sliders; **Keep, when the height, heads or a part changes** chooses whether the heads count is kept (the whole body alike) or the height (the rest of the body makes up).
A thing's size (3 axes) and its sections' lengths are in the Equip and Objects tabs.

Switching **Female** / **Male** keeps your adjustments (part lengths, left-right differences, thickness, head size): each part and the height change only by the difference between the sexes.
For the sex's own starting body, use **↺ This figure back to its sex's default** in the Reset tab, or a body preset.

## Perspective ruler and guide shapes

The Ruler tab shows 1-, 2- or 3-point lines. In the Objects tab, tick **Put as a guide (perspective ruler)** and put a
shape: it becomes a guide shape turned to the ruler (boxes, cylinders, prisms, pyramids ..., as many as you like).

- Guides show only while the ruler does, drawn in its colours with their edges carried on to the vanishing points; they are not in the rough picture, but are in the ruler picture.
- The 3-axis handles' arrows and squares follow the guide's edges. **Scale** lengthens only the side pulled; the other side stays (the edges without a vanishing point change too, for the height or width).
- Guides are always linked to the perspective ruler. Turning a guide with **Rotate** turns the ruler and the other guides with it. Tipped forward or sideways, the vanishing points leave the eye level, as a box tipped over is drawn. **Stand the ruler on the floor** in the Ruler tab takes the lean away. In 1-point the ruler faces the camera, so it does not turn left or right.
- A guide can sit at any angle off the ruler. Turn the guide about to be put with the 3-axis handles' green ring, or a guide put with **Turn (facing, Y)** in the Objects tab, and that guide alone turns (the ruler stays). It keeps that angle when the ruler turns. At an angle off the ruler, its edges do not go to the vanishing points.
- While the ruler shows, the floor grid turns with it, and it is drawn far (8 m round the figure).
- With **Snap the ruler to the floor grid** on, a guide moved sticks by its corner to the grid's points (every 40 cm) and by its bottom to the floor. The ruler is not kept to quarter turns; it turns freely.
- Objects and things turn freely. **Snap objects to the ruler** sticks their place to the floor, the ceiling and walls when near. The turn sticks (to a ruler direction, every 90°, within ±5°) only with **Turns stick to the ruler too** on (off at first).
- When the camera tilts, the perspective ruler tilts with the scene.
- The **box guide** of earlier versions becomes a guide box when a file opens.

## Sizes before putting

In the Objects and Equip tabs, set the sizes before putting (or holding) a thing while its faint dashed preview shows:
a shape's width, height, depth (a prism's or pyramid's sides and top); a thing's size, X, Y, Z and each section's length. It gets those sizes when put.

The top of the kind list is **Neutral (nothing chosen)**: no preview and no handles. The tab starts at Neutral and goes back to it after putting (or holding) a thing, so what was put can be moved right away. To put another, choose a kind again; choosing a category picks its first kind.

In Place mode with nothing selected, the 3-axis handles (move, rotate, scale, pivot) act on the preview; **Put** puts it just where, as turned and as sized as it is. Changing the kind or putting it starts the preview afresh.

## Camera

In the Camera tab, **Camera direction** (left-right, up-down, roll; degrees) turns the camera where it stands; **Camera position** (left-right, up-down, front-back; cm) moves it without turning it.


| Do | What it does |
|----|--------------|
| Wheel | Zoom (over things too) |
| Ctrl + Alt + wheel | Lens (wider: stronger perspective) |
| Middle button / Alt + drag | Turn the camera (Shift: move, Ctrl: zoom) |
| Numpad 1, 3, 7 | Front, right, top |
| Two fingers (phone) | Pinch to zoom, move to pan |
| Camera pad (phone) | Bottom left turns, bottom right moves, the right edge zooms |

## More pages

- [Props and objects](PROPS.md): holding and placing, sizes, selecting, the pivot
- [Export](EXPORT.md), [poses](POSES.md), [mods](MODDING.md)
