all : index.html

index.html : index.php
	php index.php > $@
	cp -r $@ fhn.html
	cp -r $@ ../bin/fhn.html

.PHONY: index.html

clean:
	rm -rf *.html *~
