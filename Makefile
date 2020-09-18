.PHONY: clean

dist: $(wildcard src/**/*.ts) $(wildcard src/*.ts) tsconfig.json node_modules
	tsc
	touch dist

node_modules: package-lock.json
	npm install
	touch node_modules

package-lock.json: package.json
	npm install

watch: node_modules
	tsc -w
	
clean:
	rm -rf ./dist
