.PHONY: test

prepare:
	@docker run -t \
		-v $$(pwd):/usr/local/app \
		$$(docker build -qf .docker/build/Dockerfile .) \
		/bin/sh -c "\
			npm install && \
			echo 'PREPARE DONE' \
		"

lint:
	@docker run -t \
		-v $$(pwd):/usr/local/app \
		$$(docker build -qf .docker/build/Dockerfile .) \
		/bin/sh -c "\
			npm run -s lint:test && \
			npm run -s lint:src && \
			echo 'LINT DONE' \
		"

test:
	@docker run -t \
		-v $$(pwd):/usr/local/app \
		$$(docker build -qf .docker/build/Dockerfile .) \
		/bin/sh -c "\
			npm run -s test && \
			echo 'TEST DONE' \
		"

build:
	@docker run -t \
		-v $$(pwd):/usr/local/app \
		$$(docker build -qf .docker/build/Dockerfile .) \
		/bin/sh -c "\
			rm -rf schematics && mkdir schematics && \
			npm run -s build && \
			cp -R src/* schematics && \
			cp -R LICENSE package.json package-lock.json README.md .npmrc schematics && \
			find src/ -name '*.js' -delete && \
			echo 'BUILD DONE' \
		"

publish:
	@docker run -t \
		-v $$(pwd)/schematics:/usr/local/app \
		$$(docker build -qf .docker/build/Dockerfile .) \
		/bin/sh -c "\
			echo //registry.npmjs.org/:_authToken=$$NPM_TOKEN >> .npmrc && \
			npm publish && \
			echo 'PUBLISH DONE \'
		"