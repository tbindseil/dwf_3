Run with: `node build/index.js` from the <project_root>/backend dir
|--> run with `npm run dev` to have a server that reboots when source code is changed
Build with: `tsc` from the <project_root>/backend dir
Test with: 'node test' from the <project_root>/backend dir
|--> now i run with watch via `npm run test -- --watch`
|--> and i run coverage with `npm run test -- --coverage`
|--> but i can't do both at the same time

to save database ddl as sql commands:
Click on Tables -> Views Tables -> Select All tables in right window Right click selection -> Generate SQL" -> DDL

to link to local modules, run `cd ../models && tsc && cd ../backend && npm link /Users/tj/Projects/dwf_3/models/` from ~/Projects/dwf_3/backend
