# Licenses & Third-Party Notices

## Project license

**TakaRunway** is released under the **MIT License** — full text in [`LICENSE`](./LICENSE).

Copyright (c) 2026 Riyad and the TakaRunway contributors.

---

## Third-party dependencies

TakaRunway bundles the following open-source packages. Each is distributed under
its own license; all are permissive (MIT / ISC / Apache-2.0) and compatible with
this project's MIT license. Full license texts ship inside each package under
`node_modules/<package>/`.

### Runtime dependencies

| Package | Version | License |
| --- | --- | --- |
| [`next`](https://github.com/vercel/next.js) | ^15.1.7 | MIT |
| [`react`](https://github.com/facebook/react) | ^19.0.0 | MIT |
| [`react-dom`](https://github.com/facebook/react) | ^19.0.0 | MIT |
| [`@supabase/supabase-js`](https://github.com/supabase/supabase-js) | ^2.112.4 | MIT |
| [`@supabase/ssr`](https://github.com/supabase/auth-helpers) | ^0.12.5 | MIT |
| [`zustand`](https://github.com/pmndrs/zustand) | ^5.0.3 | MIT |
| [`clsx`](https://github.com/lukeed/clsx) | ^2.1.1 | MIT |
| [`tailwind-merge`](https://github.com/dcastil/tailwind-merge) | ^3.0.1 | MIT |
| [`lucide-react`](https://github.com/lucide-icons/lucide) | ^0.475.0 | ISC |

### Build & development dependencies

| Package | Version | License |
| --- | --- | --- |
| [`typescript`](https://github.com/microsoft/TypeScript) | ^5.7.3 | Apache-2.0 |
| [`tailwindcss`](https://github.com/tailwindlabs/tailwindcss) | ^3.4.17 | MIT |
| [`postcss`](https://github.com/postcss/postcss) | ^8.5.2 | MIT |
| [`autoprefixer`](https://github.com/postcss/autoprefixer) | ^10.4.20 | MIT |
| [`@types/node`](https://github.com/DefinitelyTyped/DefinitelyTyped) | ^22.13.4 | MIT |
| [`@types/react`](https://github.com/DefinitelyTyped/DefinitelyTyped) | ^19.0.10 | MIT |
| [`@types/react-dom`](https://github.com/DefinitelyTyped/DefinitelyTyped) | ^19.0.4 | MIT |

Transitive dependencies (installed automatically by npm) carry their own
licenses; run `npx license-checker --summary` for a full resolved report.

---

## Assets

- **Icons** — [Lucide](https://lucide.dev) (ISC License), via `lucide-react`.
- **Fonts** — system font stack only; no bundled font files.

---

## License texts

### MIT License

```
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### ISC License

```
Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
```

### Apache License 2.0

`typescript` is licensed under the Apache License, Version 2.0. Full text:
<https://www.apache.org/licenses/LICENSE-2.0>. See
`node_modules/typescript/LICENSE.txt` for the copy distributed with this project.
