# html-to-image

docker build -t html-to-image .
docker build --network=host -t html-to-image .
docker run -td -p 3000:3000 html-to-image
sudo service docker restart
docker system prune -a
cd /home/ezpics/domains/createimage.ezpics.vn/public_html