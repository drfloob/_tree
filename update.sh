#1/bin/bash

MD="/home/aj/proj/_tree"

cp "$MD/_SpecRunner.html" .
cp -r "$MD/.grunt" .
cp -r "$MD/docs" .
cp -r "$MD/coverage" .
cp -r "$MD/test/spec" test/
cp -r "$MD/benchmark" .

