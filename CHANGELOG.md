# Change Log

All notable changes to the "cunneen-copy-breadcrumbs" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0]

- Rename command back to "Copy Breadcrumb" to match the docs; (I'd accidentally included the command itself
  when I did a global find-and-replace of the extension's name upon publication!)
- Redo the screen recording. The previously-published screenshot in the Readme was too low-res and pixellated.

### Breaking Changes

- The default for the `cunneen-copy-breadcrumbs.pasteToTerminal` config option has changed to `false` (was previously `true`). It no longer automatically pastes to the terminal unless you configure it to do so.
- The default for the `cunneen-copy-breadcrumbs.separationString` config option has changed to `" > "` (was previously `"."`). This better represents the visual view in VSCode's editor.

## [1.0.0]

- Add GitHub project
- Add Readme
- Renamed to 'cunneen-copy-breadcrumbs'
- Add feature to configure breadcrumb separator
- Remove ignoring of filename extensions
- Remove ignoring of everything other than method/type/class

## [0.0.1] - 2023-03-07 - Scott Blair's initial version

### Added

- Initial publication to VSCode Marketplace as `scott-blair.copy-breadcrumbs`
