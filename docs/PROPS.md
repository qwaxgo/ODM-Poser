# Adding props and objects

How to give a figure things to hold or wear, and how to put objects (boxes, walls, buildings, poles,
...) on the floor. All are drawn as simple shapes in lines and circles, and go into the rough picture.

日本語: [PROPS-JA.md](PROPS-JA.md)

## Props (the Equip tab)

1. Pick a group under **Kind** (one-handed weapons, firearms, instruments, tableware, hats, ...), then
   the prop under it. With **Preview** on, where it would go is drawn faintly first.
2. Press a button.

| Button | What it does |
|--------|--------------|
| Hold in the right / left hand | That hand holds it, its shape set for the grip (a two-handed thing gets the other hand too) |
| Wear | On the head, chest, back, waist, feet, ... |
| Place | Chairs, rides and the like go on the floor; a seat or a ride fits the body to it |

To put a thing on the floor held by no one, pick its category under **What to put** in the **Objects** tab (see
Objects below). What a figure holds and wears also shows under the body map in the **Figure** menu
(Figures), where it can be taken off. The **Reset** tab (Figure menu) has every reset of the figure in one
place; there **Attached things** works on the kinds ticked
(held and worn things, auras, the wire, pinned joints): **Take off** removes them all, **Size, colour ... back**
keeps them and puts their size, colour, turn, place and the wire's height back. Things put on the floor on
their own are left alone.

**Where it is held.** A held thing goes to the grip point of the hand's shape: a handle (swords, bats,
guns) inside the curled fingers, a cupped thing (cups, balls, phones) against the palm, a pinched thing
(pens, chopsticks) between the fingertips. Change the hand's shape later and it moves to that shape's
grip point.

Pick it in **In the scene** to:

- remove it, carry it on the back, put it down (floor / object), hold or wear it again, ground it
- reverse the grip, turn **Both hands** on or off, fit the body (chairs, rides)
- set its size, turn (forward / back, twist, sideways) and shift (across, up / down, forward / back),
  give it its own line colour, **↺ Reset**

### Side (the other side)

**Side** in the Equip tab's preview puts a thing that differs left and right on the other side before it is held or worn.

- A thing held: the right or the left hand. The preview shows in that hand (it is held in the hand of the button pressed, **Hold in the right hand / put** or **Hold in the left hand**).
- A pair for both feet or hands (skates, gloves): both, right only or left only.
- Anything else worn or put (a holster, a shoulder bag, a one-eye scouter ...): as it is, or the other side (mirrored).

Once held or worn, **To the other side** among the things out swaps it (the other hand, the other foot, a worn thing mirrored).

### Size on three axes

**A thing's size (3 axes)** in the **Equip** and **Objects** tabs sets X, Y and Z each on its own, in cm (the sliders go from 0.2 to 4 times the thing's own lengths). **Size (longest side)** in cm grows the whole thing alike. For a
held thing, Y is the way the thumb points (a sword's blade), Z the way the arm points (a gun's
barrel), X across both. The grip stays; the far end grows. The preview's fields set the size in cm before
it is placed, too.

### Section lengths (grip and blade ...)

A thing made of sections, such as a weapon, has **A thing's sections, each its length** in the **Equip** and **Objects** tabs: choose a
section and change its length alone. The chosen section is drawn heavier. A longer grip moves the blade out along
it while the hand's hold stays; the other hand of a two-handed thing and a bayonet move along too.

| Things | Sections |
|--------|----------|
| Swords, katana, knives, kunai | Grip, Blade |
| Axes, hammers, halberd | Grip, Head |
| Spear | Grip, Tip (Lance) |
| Huge lance | Shaft, Lance |
| Gun lance (bayonet type) | Stock, Barrel, Bayonet |
| Double-bladed sword | Grip, Upper blade, Lower blade |
| Guns (rifle, shotgun ...) | Stock, Barrel |
| Claws | (Grip), Claws |

Lances and the gun lance are held couched by default (under the arm, thrust forward); the gun lance is one-handed. Long weapons (spears, polearms, staffs, sticks) can be gripped or couched: the **Way of holding** choice in the Equip tab. **Where it is held** moves the grip along the thing; **↺ Way of holding and place to the start** puts both back. A plain stick is among the one-handed weapons.

**↺ This section back** and **↺ All sections back** restore the lengths. A mod's props can have sections too (`segs` in the mod docs).

### Moving things put down

Things on the floor (**Place**, **Place on its own**, **Put down (floor / object)**) are dragged in
**Place** mode (Shift + drag: up / down, the 3-axis handles turn it). The 3-axis handles move and turn them and set their
X, Y and Z sizes. While the handles show, a drag only selects; the handles do the moving (hide them to
drag things). However many figures there are, things put down move whichever figure is being edited.

## Objects (the Objects tab)

Pick a kind under **Objects (floors, walls, buildings, poles ...)** and press **Place**: box, floor,
wall, building, step, prism, cylinder, pyramid, cone and pole, each sized in cm (width, height, depth).
With grounding on, figures stand on their tops too. Drag them in Place mode; the 3-axis handles set
their width, height and depth.

### Objects (shapes, floors, walls, ceilings and things in one place)

Under **What to put** in the **Objects** tab, pick "Shapes, floors, walls, ceilings" or a thing's category
(weapons, tools, hats ...), then a kind, and press **Put**. Everything put is listed under **Out in the scene**;
choose one to change it:

| Field | Shapes, floors, walls, ceilings | Things |
|-------|--------------------------------|--------|
| Place | left / right, up / down, front / back | the same |
| Turn | X (tip forward / back), Y (facing), Z (tip sideways) | the same |
| Size | width, height, depth (a prism's or pyramid's sides and top too) | size and X, Y, Z (as when held); section lengths below it |

**Put on the ground** sets it on the ground or on what is under it by its lowest point, turned or not; figures
stand on a tilted face at its height. Walls and ceilings are objects (slabs) too, as many as you like, turned on
all three axes (the wall and ceiling of the Place tab in earlier versions become slabs when a file opens).
In Place mode they are also dragged and moved, turned and scaled with the 3-axis handles.

### Selecting, moving together, copying

| Do | What it does |
|----|--------------|
| Click a thing | Select it (to Place mode with automatic switching on) |
| Drag from an empty place (cursor: Drag) | Select what the box takes in (Shift: add to the selection) |
| Ctrl (⌘) + click (Place mode) | Add it to the selection or take it out (the last one added is what the group turns about) |
| Ctrl + Shift + click (on one selected) | The group turns about this one |
| Click an empty place (Place mode) | Let the selection go |
| Click (Camera mode: always the hand cursor) | A joint: to Pose mode (Shift: Body mode); a thing: to Place mode. A drag turns the camera |
| Shift + click a joint (Pose, Body mode) | Switch between Pose and Body |
| Delete (Backspace) | Take the selected away |
| Ctrl + X / Ctrl + C / Ctrl + V | Cut / copy / paste (put a little apart; the copy stays in this browser) |
| **Delete**, **Cut**, **Copy**, **Paste** on the view's left | The same as buttons (for phones and tablets; shown only with something selected or to paste; behind “…” on a narrow screen) |

Switching modes by what is clicked (“Switch modes by what is clicked” in the Pose tab, on at first) is set out in the [manual](MANUAL.md).

With several selected, the 3-axis handles move them together and turn them together on X, Y, Z about the leading one's pivot (scaling is one at a
time). **Drag** and **Hand** on the view's left switch the cursor (V and H keys); with Hand, a drag anywhere turns
the camera (Shift: moves it).

### Pivot (what it turns about)

A thing turns about its pivot, its middle unless moved. Under **Pivot** in the Objects tab, set it as numbers
**from the object** (it moves and turns with the thing) or in the **world** (the place in the scene);
**To the middle** and **To the bottom's middle** put it back. While the 3-axis handles' **Pivot** is pressed,
the move handles move only the pivot.

## Your own (mods)

Props, object kinds, auras and hand shapes the editor lacks can come from a mod. A prop is made of
cylinders, boxes, balls, discs, cones, rings, domes and lines in cm (not pictures or 3D models). See
**Props** and **Adding things** in [MODDING.md](MODDING.md).

- A held prop's origin is where it is held (a handle's middle); `grip` can say where instead
- `api.props.add(key, def)` adds a prop, `api.solids.addKind(...)` an object kind
- What a mod adds is saved in the pose file, and opens without breaking in an editor that lacks the mod
