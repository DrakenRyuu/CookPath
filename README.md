# CookPath

CookPath is a 30-day cooking practice app with five self-confirmed tasks and ten untimed multiple-choice questions per day. It includes 150 tasks and 300 questions. Progress is stored in the browser on the device where you use the app.

## Run locally

To preview, open `index.html` in a browser. For the installable app shell, serve this folder from localhost or HTTPS. A simple local server is included; if you have Node.js installed, run:

```sh
node server.mjs
```

Then visit <http://127.0.0.1:4173>.

Tasks are marked complete by the learner; no photos are collected or evaluated in this version. Future days remain previewable, while actual progress follows the midnight unlock schedule. A rotating set of chef quotes appears on the welcome page, with source links. Open `developer.html` to review every lesson, all three-choice questions, and answer explanations without changing learner progress.

The PWA manifest and service worker are included. Home-screen installation requires serving the app from HTTPS (or localhost during development).
