#!/bin/sh

cp *.js ../controllers/
cp *.tss ../styles/
cp *.xml ../views/

mv ../controllers/index.js ../controllers/old_index.js
mv ../controllers/demo_index.js ../controllers/index.js

mv ../styles/index.tss ../styles/old_index.tss
mv ../styles/demo_index.tss ../styles/index.tss

mv ../views/index.xml ../views/old_index.xml
mv ../views/demo_index.xml ../views/index.xml
