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

publish-docker-release:
	@docker login -u $$DOCKER_USER -p $$DOCKER_PASSWORD
	@docker pull nestjs/schematics:$$ARTIFACT_ID
	@docker tag nestjs/schematics:$$ARTIFACT_ID nestjs/schematics:$$RELEASE_VERSION
	@docker push nestjs/schematics:$$RELEASE_VERSION
	@docker tag nestjs/schematics:$$ARTIFACT_ID nestjs/schematics:5
	@docker push nestjs/schematics:5
	@docker tag nestjs/schematics:$$ARTIFACT_ID nestjs/schematics:latest
	@docker push nestjs/schematics:latest

publish-npm-release:
	@docker pull nestjs/schematics:$$ARTIFACT_ID
	@docker run -w /nestjs/schematics nestjs/schematics:$$ARTIFACT_ID \
		/bin/sh -c "\
			echo //registry.npmjs.org/:_authToken=$$NPM_TOKEN >> .npmrc && \
			npm publish \
		"
