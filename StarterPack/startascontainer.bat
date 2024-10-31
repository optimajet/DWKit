@echo OFF

docker compose build
IF ERRORLEVEL 9009 goto :NO_DOCKER

docker compose run --rm start_db
docker compose up dwkit_starterpack

pause

exit

:NO_DOCKER
echo Docker not found. Please install Docker to run this application
echo For more information visit https://docs.docker.com/install/
