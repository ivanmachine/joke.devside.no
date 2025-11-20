deploy:
	docker build --platform linux/amd64 -t ivanmachine/joke.devside.no:latest -f Dockerfile .
	docker push ivanmachine/joke.devside.no:latest
	git push
