all : index.html

index.html : index.php
	php index.php > $@
	cp -r $@ fhn-electrodes.html
	cp -r $@ ../bin/fhn-electrodes.html

.PHONY: index.html

clean:
	rm -rf *.html *~
