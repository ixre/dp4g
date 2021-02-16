CGO_ENABLED=0 GOOS=linux GOARCH=arm go build -v dp4g.go
tar cvzf ../dp4g.tar.gz assets views dp4g
scp ../dp4g.tar.gz pi@s1.go2o.to2.net:/home/pi/www/
rm dp4g
rm ../dp4g.tar.gz