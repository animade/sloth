# The lost sloth

Source of the game "The lost sloth", developed by [Max Stoiber](http://mxs.is/@) and designed and animated by [Bee Grandinetti](https://www.behance.net/grandinetti).

## Technical details

On page load `initial.js` gets downloaded, which preloads all the necessary game files. This includes the game script, `script.js`, the HTML5 Canvas fallback, `flashcanvas.js` and `flashcanvas.swf`, and the WebAudio API fallback, `waapisim.js` and `waapisim.swf`.

The main game is composed of four different layers

Outside (`<canvas/>`)
----
Sloth animation (`.gif`)
----
Other animations (`.gif`)
----
Inside (`.svg`)

with the loading screen, the game overlay (the audiobutton, the infobutton and the text), the success screen and the info screen being above those four layers.

### X-Ray

The hole in the canvas (outside) is accomplished by drawing an arc counterclockwise onto a clockwise rectangle, which creates a compound path.

The initial idea was to use SVG masks, but because the inner layer would've been above the outer layer, complex animations couldn't have been supported, so I switched to canvas.

### Directional Audio

The goal of this feature was to increase and decrease the volume of a sound relative to how far away the cursor is from the designated source of the sound. Used in conjunction with animated objects, this feature makes for a great game experience.

After initial testing, the WebAudio API was chosen for its smooth volume transitions. The calculation is accomplished in four steps:

1) Calculate the diagonal of the playing field.
2) Determine in which quadrant of the coordinate plane around the source the cursor is.
3) Calculate the distance of the cursor to the source.
4) Calculate the ratio of the cursor-source distance to the page diagonal.

This provides me with a value between 0 and 1, which is the supported range of the WebAudio API gain nodes - perfect for the purpose.

### Randomized sloth placement

By using five different sloth animation files whose sloth positions correspond to five different, transparent rectangles in the `inside.svg`, randomized sloth placement is a matter of loading the new animation and changing the target.

That also explains the reason behind the .svg in the background, not only because of the scalability but also because of the relieved target search for the sloth and the sound sources.

#### Why is the outside image a `.png`?

I initially used a `.svg` for the outside image that get's drawn onto the canvas, but ran into huge performance problems. Switching over to a `.png` file got rid of them immediately, so I sacrificed a bit of loading time and image sharpness for a much improved playing experience.

## Code License

Copyright 2015 Chambers Judd Limited

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.