.PHONY: test

prepare:
	@docker build -t nestjs/schematics .
	@docker run -t \
		-v $$(pwd):/usr/local/app \
		nestjs/schematics \
		/bin/sh -c "npm install"

lint:
	@docker run -t \
		-v $$(pwd):/usr/local/app \
		nestjs/schematics \
		/bin/sh -c "npm run -s lint:test && npm run -s lint:src"

test:
	@docker run -t \
		-v $$(pwd):/usr/local/app \
		nestjs/schematics \
		/bin/sh -c "npm run -s test"

build:
	@docker run -t \
		-v $$(pwd):/usr/local/app \
		nestjs/schematics \
		/bin/sh -c "\
			rm -rf schematics && mkdir schematics && \
			npm run -s build && \
			cp -R src/ schematics/ && \
			cp -R LICENSE package.json package-lock.json README.md .npmrc schematics && \
			find src/ -name '*.js' -delete"

publish:
	@docker run -t \
		-v $$(pwd)/schematics:/usr/local/app \
		nestjs/schematics \
		/bin/sh -c "\
			echo //registry.npmjs.org/:_authToken=$$NPM_TOKEN>>.npmrc && \
			npm publish"