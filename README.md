[![Build Status](https://travis-ci.org/nestjs/schematics.svg?branch=master)](https://travis-ci.org/nestjs/schematics)
# @nestjs/schematics
Nestjs project and architecture element generation based on @angular-dekit/schematics engine

## Build :
- `git clone https://github.com/nestjs/schematics.git`

### Steps with Docker
in the schematics folder :
- `make prepare`
- `make build`

### Steps without Docker
in the schematics folder :
- `npm install`
- `rm -rf schematics && mkdir schematics`
- `npm run -s build`
- `cp -R src/* schematics`
- `cp -R LICENSE package.json package-lock.json README.md .npmrc schematics`
- `find src -name '*.js' -delete`

## Usages:
### With @angular-devkit/schematics-cli
install @angular-devkit/schematics-cli globally.

run `schematics [path_to_nestjs_schematics]:<nestjs_schematic_name> [...options]`

## Schematics:
### application:
| Option | description | required | default value |
|--------|-------------|:--------:|:-------------:|
| directory | The directory name to create the app in. | true | |

### module:
| Option | description | required | default value |
|--------|-------------|:--------:|:-------------:|
| name | The name of the module. | true | |
| path | The path to create the module. | false | 'app' |
| sourceDir | The path of the source directory. | false | 'src' |