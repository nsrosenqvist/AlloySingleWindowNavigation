#!/bin/bash

demo_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
app_dir="$( cd "$demo_dir" && cd ../ && pwd )"

# Copy the demo files to the appropriate directories
cp $demo_dir/*.js $app_dir/controllers/
cp $demo_dir/*.tss $app_dir/styles/
cp $demo_dir/*.xml $app_dir/views/

# Make sure to save the old index controller if one exists
if [ -e $app_dir/controllers/index.js ]; then
	mv $app_dir/controllers/index.js $app_dir/controllers/old_index.js
fi
if [ -e $app_dir/styles/index.tss ]; then
	mv $app_dir/styles/index.tss $app_dir/styles/old_index.tss
fi
if [ -e $app_dir/views/index ]; then
	mv $app_dir/views/index.xml $app_dir/views/old_index.xml
fi

# Rename the index controller's files
mv $app_dir/controllers/demo_index.js $app_dir/controllers/index.js
mv $app_dir/styles/demo_index.tss $app_dir/styles/index.tss
mv $app_dir/views/demo_index.xml $app_dir/views/index.xml
