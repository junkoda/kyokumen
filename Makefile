all: build serve

serve: build

.PHONY: build serve update

build:
	jekyll build

watch:
	jekyll build --watch

serve:
	jekyll serve

