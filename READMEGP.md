Aniblock is a library for creating animated SVG block diagrams that are
rendered in a web browser. The API provides a means to animate blocks on the
diagram appearing, moving, changing size, linking to other blocks, and
disappearing. An example containing most of the supported animations is shown
below:

<p align="center">
  <img src="media://sample.gif" alt="An Aniblock sample animation" />
</p>

The underlying animation engine is provided by the [GreenSock Animation
Platform (GSAP)](https://greensock.com/gsap/). Aniblock is a wrapper around
GSAP which simplifies the creation of block diagram animations. I only expose a
small subset of what GSAP is capable of directly though the Aniblock API; this
is a deliberate attempt to keep the API as simple as possible.


License
=======

Aniblock itself is licensed under the [MIT license](./LICENSE).

Aniblock depends on the GreenSock Animation Platform (GSAP) package which has a
custom license with restrictions on some types of commercial use. Please check
the [GreenSock License](https://greensock.com/licensing/) for details of their
license terms and commercial use restrictions.


Getting Started
===============

Prerequisites
-------------

Aniblock builds use Node.js and NPM for package management, so make sure these are installed and available on your command line `PATH`.

Check out
---------

Check out the repository and install required package dependencies using:

    git clone https://github.com/solidpixel/aniblock.git
    cd aniblock
    npm install --save-dev webpack

Build
-----

Build the API documentation, JavaScript library and debug source map using:

    webpack

Build outputs:

* `apidocs`: The library API documentation.
* `www\dist\aniblock.js`: The Aniblock library.
* `www\dist\aniblock.js.map`: The Aniblock source map, useful for debugging.
