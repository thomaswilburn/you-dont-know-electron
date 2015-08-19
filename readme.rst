You Don't Know Electron
=======================

Well, maybe you do. *I* didn't. Now I do, a little.

This is a simple test project to demonstrate writing a multiplayer game using Electron and websockets.

Setup
-----

Download `Electron <https://github.com/atom/electron>`_ for your operating system, then clone this repo into the ``resources`` folder, renaming it to ``app``. You'll also need to run an NPM install from that folder. Once that's done, running the main Electron executable should start You Don't Know Electron.

Usage
-----

The game is a very simple trivia quiz. What makes it special is that it works as a party game: when you start the app, you'll see a QR code. Scan this code with a phone that's on the same network as the host, and it'll open a "buzzer" web app. Once everyone is signed in, click the button at the bottom to start the quiz, or to advance to the next question.

There will be bugs.

Tech
----

Under the hood, this exploits the fact that Electron is basically portable Node, spinning up a Hapi server for the host/buzzer pages and a websocket connection to tie them together. The front-ends of both are basically very, very simplistic Angular thin clients.
