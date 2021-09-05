all : index.html

index.html : index.php
	php index.php > $@

.PHONY: index.html

clean:
	rm -rf *.html *~
