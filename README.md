# html-to-image

docker build -t html-to-image .
docker build --network=host -t report-shopee .
docker run -td -p 4444:3000 report-shopee
sudo service docker restart
docker system prune -a
cd /home/ezpics/domains/createimage.ezpics.vn/public_html