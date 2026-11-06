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

### Size on three axes

**A thing's size (3 axes)** in the **Sizes** tab stretches X, Y and Z each on its own (20–400 %). For a
held thing, Y is the way the thumb points (a sword's blade), Z the way the arm points (a gun's
barrel), X across both. The grip stays; the far end grows. The preview's fields set the size before
it is placed, too.

### Section lengths (grip and blade ...)

A thing made of sections, such as a weapon, has **A thing's sections, each its length** in the **Sizes** tab: choose a
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
**Place** mode (Shift + drag: up / down, wheel: turn). The 3-axis handles move and turn them and set their
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
| Size | width, height, depth (a prism's or pyramid's sides and top too) | size and X, Y, Z (as when held); section lengths in Sizes |

**Put on the ground** sets it on the ground or on what is under it by its lowest point, turned or not; figures
stand on a tilted face at its height. Walls and ceilings are objects (slabs) too, as many as you like, turned on
all three axes (the wall and ceiling of the Place tab in earlier versions become slabs when a file opens).
In Place mode they are also dragged and moved, turned and scaled with the 3-axis handles.

## Your own (mods)

Props, object kinds, auras and hand shapes the editor lacks can come from a mod. A prop is made of
cylinders, boxes, balls, discs, cones, rings, domes and lines in cm (not pictures or 3D models). See
**Props** and **Adding things** in [MODDING.md](MODDING.md).

- A held prop's origin is where it is held (a handle's middle); `grip` can say where instead
- `api.props.add(key, def)` adds a prop, `api.solids.addKind(...)` an object kind
- What a mod adds is saved in the pose file, and opens without breaking in an editor that lacks the mod
