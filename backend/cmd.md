### Rebuild lại
```
docker-compose down -v
docker-compose build --no-cache
docker-compose up
```

### Rebuild lại no cache
```
docker-compose down -v
docker-compose build
docker-compose up
```

### Rebuild backend và migrate
```
docker compose down -v
docker compose up -d postgres
docker compose build backend
docker compose up -d backend
```

### Vào app backend
```
docker exec -it spendwise-backend-1 sh
npx prisma migrate dev --name init
```

### Mở prisma 
```
docker exec -it spendwise-backend-1 sh
npx prisma studio --port 5555 --browser none
```


```
docker compose down -v
docker builder prune -a -f
```