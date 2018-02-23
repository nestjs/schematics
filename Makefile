.PHONY: test

prepare:
	@docker build -t nestjs/schematics .
	@docker run \
		-v $$(pwd):/usr/local/app \
		nestjs/schematics \
		/bin/sh -c "npm install"

lint:
	@docker run \
		-v $$(pwd):/usr/local/app \
		nestjs/schematics \
		/bin/sh -c "npm run -s lint:test && npm run -s lint:src"

test:
	@docker run \
		-v $$(pwd):/usr/local/app \
		nestjs/schematics \
		/bin/sh -c "npm run -s test"

build:
	@docker run \
		-v $$(pwd):/usr/local/app \
		nestjs/schematics \
		/bin/sh -c "\
			rm -rf schematics && mkdir schematics && \
			npm run -s build && \
			cp -R src/* schematics && \
			find schematics/ -name '*.ts' -delete && \
			cp -R LICENSE package.json package-lock.json README.md schematics"
	@docker run \
		-v $$(pwd)/schematics:/usr/local/app \
		nestjs/schematics \
		/bin/sh -c "npm pack"

publish:
	@docker run \
		-v $$(pwd):/usr/local/app \
		nestjs/schematics \
		/bin/sh -c "\
			echo //registry.npmjs.org/:_authToken=$$NPM_TOKEN>>.npmrc &&\
			$$(echo $$(find schematics -name nestjs-schematics-*.tgz))"
