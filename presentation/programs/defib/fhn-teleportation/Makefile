all : index.html

index.html : index.php
	php index.php > $@
	cp -r $@ fhn-teleportation.html
	cp -r $@ ../bin/fhn-teleportation.html

.PHONY: index.html

clean:
	rm -rf *.html *~
