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
- `find schematics/ -name '*.ts' -delete`
- `find src -name '*.js' -delete`
- `cp -R LICENSE package.json package-lock.json README.md .npmrc schematics`

## Usages:
### With @angular-devkit/schematics-cli
install @angular-devkit/schematics-cli globally.

run `schematics [path_to_nestjs_schematics]:<nestjs_schematic_name> [...options]`

## Schematics:

| Name        | Options     | Usage                                                                                                         |
|-------------|-------------|---------------------------------------------------------------------------------------------------------------|
| application | - extension | .:application --extension=[ts OR js] --path=[your_path]                                                       |
|             | - path      |                                                                                                               |
| controller  | - extension | .:controller --extension=[ts OR js] --name=[your_name] --path=[relative_to_rooDir] --rootDir=[your_root_dir]  |
|             | - name      |                                                                                                               |
|             | - path      |                                                                                                               |
|             | - rootDir   |                                                                                                               |
| exception   | - extension | .:exception --extension=[ts OR js] --name=[your_name] --path=[relative_to_rooDir] --rootDir=[your_root_dir]   |
|             | - name      |                                                                                                               |
|             | - path      |                                                                                                               |
|             | - rootDir   |                                                                                                               |
| guard       | - extension | .:guard --extension=[ts OR js] --name=[your_name] --path=[relative_to_rooDir] --rootDir=[your_root_dir]       |
|             | - name      |                                                                                                               |
|             | - path      |                                                                                                               |
|             | - rootDir   |                                                                                                               |
| interceptor | - extension | .:interceptor --extension=[ts OR js] --name=[your_name] --path=[relative_to_rooDir] --rootDir=[your_root_dir] |
|             | - name      |                                                                                                               |
|             | - path      |                                                                                                               |
|             | - rootDir   |                                                                                                               |
| middleware  | - extension | .:middleware --extension=[ts OR js] --name=[your_name] --path=[relative_to_rooDir] --rootDir=[your_root_dir]  |
|             | - name      |                                                                                                               |
|             | - path      |                                                                                                               |
|             | - rootDir   |                                                                                                               |
| module      | - extension | .:module --extension=[ts OR js] --name=[your_name] --path=[relative_to_rooDir] --rootDir=[your_root_dir]      |
|             | - name      |                                                                                                               |
|             | - path      |                                                                                                               |
|             | - rootDir   |                                                                                                               |
| pipe        | - extension | .:pipe --extension=[ts OR js] --name=[your_name] --path=[relative_to_rooDir] --rootDir=[your_root_dir]        |
|             | - name      |                                                                                                               |
|             | - path      |                                                                                                               |
|             | - rootDir   |                                                                                                               |
| service     | - extension | .:service --extension=[ts OR js] --name=[your_name] --path=[relative_to_rooDir] --rootDir=[your_root_dir]     |
|             | - name      |                                                                                                               |
|             | - path      |                                                                                                               |
|             | - rootDir   |                                                                                                               |