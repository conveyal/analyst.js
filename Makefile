
install: node_modules
	@npm install --global browserify dox doxme standard watchify

node_modules: package.json
	@npm install
