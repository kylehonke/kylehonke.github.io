# Personal Website

A professional portfolio website built with React, Vite, and Vanilla CSS. Features automated daily stats fetching via GitHub Actions and seamless 
integration with multiple third-party APIs.

<h3 align="center">Check it out <a href="https://kylehonke.github.io/">Here</a></h3>


## Metadata regression tests

Run `npm ci`, then `npx playwright install chromium` (or
`npx playwright install --with-deps chromium` on a fresh Linux CI host).
Run `npm test` to build the site and test client navigation, browser history,
unknown routes, tag cleanup, and direct-load metadata with JavaScript disabled.
Run `npm run lint` separately.
