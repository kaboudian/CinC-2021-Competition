all : index.html

index.html : index.php
	php index.php > $@
	cp 	-f $@ tp.html
	cp 	-f $@ ../bin/tp.html

.PHONY: index.html

clean:
	rm -rf *.html *~
