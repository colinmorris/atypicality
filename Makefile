PHONY: github

github:
	rm -rf docs
	cp -r dist/ docs
	git add docs
	git commit -m "update dev version"
	git push

