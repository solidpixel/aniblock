Aniblock is a lightweight library for creating animated block diagrams
that can be shown in a browser. It provides an API to create a structured
scene canvas, and then animate elements being placed on, moved on, and
removed from that canvas.

There are two fundamental elements types which can be used: Blocks, and Links.
Blocks define the major elements of the diagram, Links define the pathways
between the blocks in the diagram.


Animation capability
--------------------

The underlying animation engine is provided by the [GreenSock Animation
Platform (GSAP)](https://greensock.com/gsap/). Aniblock provides a set of
utilities built around GSAP that aim to simplify the creation of block diagram
animation.

It should be noted that Aniblock only exposes a small subset of what GSAP is
capable of directly though the API; this is a deliberate attempt to keep the
API as simple as possible.


Styling capability
------------------

Aniblock fixes many diagram animation properties, in particular what gets
animated and how fast each animation is rendered.

Diagram elements are simple SVG elements, so styling is provided via the
webpage's CSS style sheet. Users assign each element to one or more CSS classes
when it is created.


License
-------

The source code for Aniblock itself is licensed under the MIT license.

However, note that Aniblock itself requires use of the GSAP package which has
a custom license with some restrictions on commercial use. Please check the
[GreenSock Animation Platform (GSAP)](https://greensock.com/gsap/) website for
details of their license terms.
