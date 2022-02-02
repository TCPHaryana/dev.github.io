uileafletdraw
==============




### Purpose:

To extend ui-leaflet directives to add [Leaflet.Draw](https://github.com/michaelguild13/Leaflet.draw).

### Basic use:

In general the main goal of this direcitve to bind an attribute `lf-draw` within the leaflet directive to a field which
represent [Leaflet.Draw options]

Follows the same event driven architecture of `leafletDirectiveDraw[someEvent]` being fired from root scope. The events are
[here]

### API

For basic use it is described in a enough extent in [Basic use]

### Unique Options

- **options.control** - (*note: this will probably go away infavor of leafletData*)

  - **promised(promise)**:
    - **promise**: **type:** Promise which resolves:
      - **type** object
        - **control:** drawControl leaflet object
        - **map:**: leaflet map instance


