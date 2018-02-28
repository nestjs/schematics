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

| Name        | Usage                                                                                                         |
|-------------|---------------------------------------------------------------------------------------------------------------|
| application | .:application --extension=[ts OR js] --path=[your_path]                                                       |
| controller  | .:controller --extension=[ts OR js] --name=[your_name] --path=[relative_to_rooDir] --rootDir=[your_root_dir]  |
| exception   | .:exception --extension=[ts OR js] --name=[your_name] --path=[relative_to_rooDir] --rootDir=[your_root_dir]   |
| guard       | .:guard --extension=[ts OR js] --name=[your_name] --path=[relative_to_rooDir] --rootDir=[your_root_dir]       |
| interceptor | .:interceptor --extension=[ts OR js] --name=[your_name] --path=[relative_to_rooDir] --rootDir=[your_root_dir] |
| middleware  | .:middleware --extension=[ts OR js] --name=[your_name] --path=[relative_to_rooDir] --rootDir=[your_root_dir]  |
| module      | .:module --extension=[ts OR js] --name=[your_name] --path=[relative_to_rooDir] --rootDir=[your_root_dir]      |
| pipe        | .:pipe --extension=[ts OR js] --name=[your_name] --path=[relative_to_rooDir] --rootDir=[your_root_dir]        |
| service     | .:service --extension=[ts OR js] --name=[your_name] --path=[relative_to_rooDir] --rootDir=[your_root_dir]     |