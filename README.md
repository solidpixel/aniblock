Aniblock is a library for creating animated SVG block diagrams that are
rendered in a web browser. The API provides a means to animate blocks on the
diagram appearing, moving, changing size, linking to other blocks, and
disappearing. An example containing most of the supported animations is shown
below:

<p align="center">
  <img src="./docs/sample.gif" alt="A sample Aniblock animation" />
</p>

The underlying animation engine is provided by the [GreenSock Animation
Platform (GSAP)](https://greensock.com/gsap/). Aniblock is a wrapper around
GSAP which simplifies the creation of block diagram animations. I only expose a
small subset of what GSAP is capable of directly though the Aniblock API; this
is a deliberate attempt to keep the API as simple as possible.


License
-------

Aniblock itself is licensed under the [MIT license](./LICENSE).

Aniblock depends on the GreenSock Animation Platform (GSAP) package which has a
custom license with restrictions on some types of commercial use. Please check
the [GreenSock License](https://greensock.com/licensing/) for details of their
license terms and commercial use restrictions.
