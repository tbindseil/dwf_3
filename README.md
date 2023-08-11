# tsc
it is assumed that tsc is run with a locally installed tsc, so run `npm run tsc`
and have a script in package.json that does `tsc`

If you setup an alias such that tsc expands to `npm run tsc`, the vim compiler (`:compiler! tsc`) will "just work".

# local dependencies
This repo contains a few npm packages. The paradigm is to have them installed via a local path, ie
to install the models package as a dependency to the raster package:
```
cd <root_dir>/raster
npm install ../models
```

# misc
ackrc picked up in home directory
