## [1.3.3](https://github.com/AtomiCloud/ketone.new-cyanprint/compare/v1.3.2...v1.3.3) (2026-03-24)


### 🐛 Bug Fixes 🐛

* add .cyan_output/ and .cyan_backup*/ to gitignore files [CU-86ex0z8ug] ([656d949](https://github.com/AtomiCloud/ketone.new-cyanprint/commit/656d949050e2d6fb3e8faf6b85b62b1df427a674))
* add .cyan_output/ and .cyan_backup*/ to language-specific gitignore [CU-86ex0z8ug] ([63d40bc](https://github.com/AtomiCloud/ketone.new-cyanprint/commit/63d40bc85ab8b5147f405cf5ffd2412092f9a866))

## [1.3.2](https://github.com/AtomiCloud/ketone.new-cyanprint/compare/v1.3.1...v1.3.2) (2026-03-23)


### 🐛 Bug Fixes 🐛

* correct .gitignore/.dockerignore formatting [CU-86ex0x2zd] ([a8e5313](https://github.com/AtomiCloud/ketone.new-cyanprint/commit/a8e5313de4ef91398f0f8a58d59f389da82e2126))
* correct .gitignore/.dockerignore formatting [CU-86ex0x2zd] ([#8](https://github.com/AtomiCloud/ketone.new-cyanprint/issues/8)) ([374451e](https://github.com/AtomiCloud/ketone.new-cyanprint/commit/374451ee727c3e358df2ce644ac52d723a0ac68e))

## [1.3.1](https://github.com/AtomiCloud/ketone.new-cyanprint/compare/v1.3.0...v1.3.1) (2026-03-23)


### 📜 Documentation 📜

* add implementation plans for CU-86ex0j5k7 ([9060c88](https://github.com/AtomiCloud/ketone.new-cyanprint/commit/9060c8843abedfcbc4bf5a3d187f8b6449944c09))
* add task spec for CU-86ex0j5k7 ([afda3a8](https://github.com/AtomiCloud/ketone.new-cyanprint/commit/afda3a8280baea00041cf38242a28ea430bac1d9))
* fix qemu/buildx order in plan-1.md [CU-86ex0j5k7] ([fc2cd32](https://github.com/AtomiCloud/ketone.new-cyanprint/commit/fc2cd32efe9924ef829ea59ab5c1ac5c1f200543))
* remove contradictory out-of-scope item [CU-86ex0j5k7] ([b9d9cf4](https://github.com/AtomiCloud/ketone.new-cyanprint/commit/b9d9cf419558c52271019e03319564ae1b21c4ce))


### 🐛 Bug Fixes 🐛

* add GHCR permissions and env var guards [CU-86ex0j5k7] ([ee0636b](https://github.com/AtomiCloud/ketone.new-cyanprint/commit/ee0636b5fc09e7b1fff5c452a21ded73ad8535b5))
* address CodeRabbit review feedback [CU-86ex0j5k7] ([47a4ce9](https://github.com/AtomiCloud/ketone.new-cyanprint/commit/47a4ce94a7769d361b10f044dd95a1a47ccb533b))
* migrate CI/CD Docker builds to cyanprint --build [CU-86ex0j5k7] ([2136c2f](https://github.com/AtomiCloud/ketone.new-cyanprint/commit/2136c2f1b5ca54cb1fd4ca7d84e411aefa1b112f))

## [1.3.0](https://github.com/AtomiCloud/ketone.new-cyanprint/compare/v1.2.2...v1.3.0) (2026-03-22)


### 📜 Documentation 📜

* add spec v5 and implementation plans [CU-86ewy2jep] ([72bf60f](https://github.com/AtomiCloud/ketone.new-cyanprint/commit/72bf60f4aad94160b3896782fd899447a1f320aa))


### ✨ Features ✨

* add resolver support, build/push, automated testing, skills & SDK v2.1.0 [CU-86ewy2jep] ([04b41b6](https://github.com/AtomiCloud/ketone.new-cyanprint/commit/04b41b6c99a9446827618b4eda0e5f249ac9d39f))
* fix cyan generators, improve skills, fix CLAUDE.md/publish.sh [CU-86ewy2jep] ([77c29d4](https://github.com/AtomiCloud/ketone.new-cyanprint/commit/77c29d43288dd12f73f1cf1caff18c8c11e14319))


### 🐛 Bug Fixes 🐛

* chown /app before USER app in dotnet Dockerfiles [CU-86ewy2jep] ([db7d8ff](https://github.com/AtomiCloud/ketone.new-cyanprint/commit/db7d8ffa36c279aa972f4c5febc8d01665c95793))
* clarify IDeterminism usage, varSyntax default, and artifact types [CU-86ewy2jep] ([9cdd6c0](https://github.com/AtomiCloud/ketone.new-cyanprint/commit/9cdd6c0870026683e05916fd548b7b1378a78be5))
* regenerate snapshots after MD040 fence language fix [CU-86ewy2jep] ([009581f](https://github.com/AtomiCloud/ketone.new-cyanprint/commit/009581f7c54c4e7f8216239e1bd39011d615854b))
* remove phantom content and fix skill inaccuracies [CU-86ewy2jep] ([6b190dd](https://github.com/AtomiCloud/ketone.new-cyanprint/commit/6b190dd3c2fb5a95ae5ee9f5440cee2ba47e617f))
* remove UTF-8 BOM from dotnet Dockerfiles [CU-86ewy2jep] ([20b53a8](https://github.com/AtomiCloud/ketone.new-cyanprint/commit/20b53a8d0e75491fb0657c8f20326a1229814d90))
* revert USER app from processor Dockerfile [CU-86ewy2jep] ([a9cfde1](https://github.com/AtomiCloud/ketone.new-cyanprint/commit/a9cfde110f70aeea1664538de7dd22c00dad1da2))
* run dotnet containers as non-root user [CU-86ewy2jep] ([41a1a75](https://github.com/AtomiCloud/ketone.new-cyanprint/commit/41a1a7587eff48c8f721bb10a0a89a654bc01f30))


### 🔼 Dependency Upstreams 🔼

* cyanprint upgrades ([471b9f2](https://github.com/AtomiCloud/ketone.new-cyanprint/commit/471b9f23c7dd09fefc9b81af72f27c74c2d421d1))

## [1.2.2](https://github.com/AtomiCloud/ketone.new-cyanprint/compare/v1.2.1...v1.2.2) (2026-02-10)

### 🐛 Bug Fixes 🐛

- incorrect image name ([9a08eb2](https://github.com/AtomiCloud/ketone.new-cyanprint/commit/9a08eb24dec59fd884915f1afe6b50c33271dc67))

## [1.2.1](https://github.com/AtomiCloud/ketone.new-cyanprint/compare/v1.2.0...v1.2.1) (2026-02-10)

### 🐛 Bug Fixes 🐛

- compatibility with v2, which allows for multiple templates ([35ea68a](https://github.com/AtomiCloud/ketone.new-cyanprint/commit/35ea68a64c69b6a28dcb73e784dff3242524470b))

## [1.2.0](https://github.com/AtomiCloud/ketone.new-cyanprint/compare/v1.1.0...v1.2.0) (2026-02-10)

### ✨ Features ✨

- cyan update ([fbd67bc](https://github.com/AtomiCloud/ketone.new-cyanprint/commit/fbd67bcdd4382ebde6c09dd92c7a3fa032b86d37))

## [1.1.0](https://github.com/AtomiCloud/ketone.new-cyanprint/compare/v1.0.0...v1.1.0) (2026-02-04)

### ✨ Features ✨

- skill upgrade ([75c74cf](https://github.com/AtomiCloud/ketone.new-cyanprint/commit/75c74cf277c63a031c28c0fd56e0ef7f1a6bdbe0))
- upgraded all runtimes ([c4972d9](https://github.com/AtomiCloud/ketone.new-cyanprint/commit/c4972d93e4f2d61c5d3c0de73040de28a9f774da))
- upgraded flakes ([420ed96](https://github.com/AtomiCloud/ketone.new-cyanprint/commit/420ed9645da7d8f174b6315a48a19c06868a2c62))

## 1.0.0 (2025-08-03)

### ✨ Features ✨

- **nix:** add sg to development environment ([ce29c78](https://github.com/AtomiCloud/ketone.new-cyanprint/commit/ce29c78619810eef12683a1d33d141cbadb91e4e))
- initial commit ([d4d66a7](https://github.com/AtomiCloud/ketone.new-cyanprint/commit/d4d66a7b04663531293e2e98d2deca7fa7fd1f85))
- **processors:** pin processors used ([80d3cf2](https://github.com/AtomiCloud/ketone.new-cyanprint/commit/80d3cf28cd57ba7bbc3cb6a8ab2d23e443afc359))
- upgrade all systems ([b96ddc3](https://github.com/AtomiCloud/ketone.new-cyanprint/commit/b96ddc357a667bd809d3432a851ecb72bb546311))
- upgrade docker images ([eedb9cf](https://github.com/AtomiCloud/ketone.new-cyanprint/commit/eedb9cfee9675bdfdc54882393608e850c569c58))
- upgrade nix-registry ([cfae0d1](https://github.com/AtomiCloud/ketone.new-cyanprint/commit/cfae0d1957145d0fd375d79adedb7e39bf0309cf))
- upgrade to v2 SDK ([4481a16](https://github.com/AtomiCloud/ketone.new-cyanprint/commit/4481a168209804548ccd85ab183163c4ba59e4d9))

### 🐛 Bug Fixes 🐛

- **nix:** add missing shells ([9cc3295](https://github.com/AtomiCloud/ketone.new-cyanprint/commit/9cc32959c31f9c63cf979ff52284f1823a7179a1))
- clean up nix configurations ([ea557bc](https://github.com/AtomiCloud/ketone.new-cyanprint/commit/ea557bc6df232d0d1ef9bbaf65e3604ea7b77f0c))
- **default:** don't pin, pinning only in cyan.yaml ([b198127](https://github.com/AtomiCloud/ketone.new-cyanprint/commit/b198127d9fd1f0d79bd22ef80a414268579aaeaf))
- PR comments ([a53b45b](https://github.com/AtomiCloud/ketone.new-cyanprint/commit/a53b45b56807e6e08dc85985e71ef2368656967e))
- **ci:** remove CI-CD workflow and update nix environment ([4e025d8](https://github.com/AtomiCloud/ketone.new-cyanprint/commit/4e025d847003c6079ba531d514144d5baf833e25))
- **dep:** update aiohttp to fix security vulnerability ([d88da6a](https://github.com/AtomiCloud/ketone.new-cyanprint/commit/d88da6a37446bb7566bbfbb8d8754ccf6accc596))
- **dep:** update docker upstream versions ([8124ffa](https://github.com/AtomiCloud/ketone.new-cyanprint/commit/8124ffa7871eb2a63dde7ddb1588366bc06a0288))

### 🔼 Dependency Upstreams 🔼

- bump atomi flakes to v2 ([ca07caa](https://github.com/AtomiCloud/ketone.new-cyanprint/commit/ca07caa928e566193db9d710e41b3e8b99f0e71f))
