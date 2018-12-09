build-docker-artifact:
	@docker build -t nestjs/schematics:$$ARTIFACT_ID .

publish-docker-artifact:
	@docker login -u $$DOCKER_USER -p $$DOCKER_PASSWORD
	@docker push nestjs/schematics:$$ARTIFACT_ID

publish-docker-edge:
	@docker login -u $$DOCKER_USER -p $$DOCKER_PASSWORD
	@docker pull nestjs/schematics:$$ARTIFACT_ID
	@docker tag nestjs/schematics:$$ARTIFACT_ID nestjs/schematics:5-edge
	@docker push nestjs/schematics:5-edge

publish-docker-release: prepublish
	@docker login -u $$DOCKER_USER -p $$DOCKER_PASSWORD
	@docker pull nestjs/schematics:$$ARTIFACT_ID
	@docker tag nestjs/schematics:$$ARTIFACT_ID nestjs/schematics:$$RELEASE_VERSION
	@docker push nestjs/schematics:$$RELEASE_VERSION
	@docker tag nestjs/schematics:$$ARTIFACT_ID nestjs/schematics:5
	@docker push nestjs/schematics:5
	@docker tag nestjs/schematics:$$ARTIFACT_ID nestjs/schematics:latest
	@docker push nestjs/schematics:latest

publish-npm-release: prepublish
	@docker pull nestjs/schematics:$$ARTIFACT_ID
	@docker run -w /nestjs/schematics nestjs/schematics:$$ARTIFACT_ID \
		/bin/sh -c "\
			echo //registry.npmjs.org/:_authToken=$$NPM_TOKEN >> .npmrc && \
			npm publish --tag next\
		"
prepublish:
	@docker pull nestjs/schematics:$$ARTIFACT_ID
	@CONTAINER_ID=$$(docker create -t -w /workspace node:carbon-alpine /bin/sh -c "node scripts/check-version.js $$RELEASE_VERSION") && \
	docker cp scripts/ $$CONTAINER_ID:/workspace && \
	docker cp package.json $$CONTAINER_ID:/workspace/package.json && \
	docker start -a $$CONTAINER_ID