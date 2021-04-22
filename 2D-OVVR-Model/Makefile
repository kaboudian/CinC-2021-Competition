all : index.html

index.html : index.php
	php index.php > $@
	cp 	-f $@ ovvr.html

.PHONY: index.html

clean:
	rm -rf *.html *~
