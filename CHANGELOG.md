# Changelog

All notable changes to [drag-tabs](https://github.com/bpmn-io/drag-tabs) are documented here. We use [semantic versioning](http://semver.org/) for releases.

## Unreleased

___Note:__ Yet to be released changes appear here._

## 3.0.0

* `CHORE`: turn into ESM only module
* `DEPS`: update to `min-dash@5.0.0`
* `DEPS`: update to `min-dom@5.2.0`

## 2.3.1

* `DEPS`: use `mitt@3`
* `DEPS`: update dev dependencies

## 2.3.0

* `FEAT`: add ability to suppress drag image

## 2.2.0

* `FIX`: check containment when dragging tabs

## 2.1.1

* `FIX`: correct left to right dragging

## 2.1.0

* `DOCS`: improve documentation
* `CHORE`: mark as side-effect free
* `CHORE`: expose `module` field to allow tree shaking
* `CHORE`: remove internal `DragTabs#get` API

## 2.0.0

* `FEAT`: emit start event (`{ dragTab, initialIndex }`)
* `FEAT`: lazy bind drag events
* `CHORE`: improve dragging from left to right
* `CHORE`: simplify implementation
* `CHORE`: drop `options.thresold`
* `FIX`: support Firefox

#### Breaking Changes

* `options.threshold` has been removed without replacement

## 1.0.3

* `FIX`: remove unused `raf` dependency and move `puppeteer` to dev dependencies

## 1.0.2

* `FIX`: add missing `.babelrc`

## 1.0.1

* `DOCS`: fix typo and merge error

## 1.0.0

### Breaking Changes

* `CHORE`: migrate to ES modules

## ...

Check `git log` for earlier history.