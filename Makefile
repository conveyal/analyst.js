
install:
	@npm install --global browserify standard watchify

node_modules: package.json
	@npm install
