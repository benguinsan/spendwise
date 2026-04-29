# PostgreSQL TLS Incident Report (ECS + Prisma)

## Boi canh

- Moi truong: AWS ECS Fargate + RDS PostgreSQL
- Backend: NestJS + Prisma (`@prisma/client` + `@prisma/adapter-pg`)
- Trieu chung: API tra `500` o cac route can query DB (`/users`, `/auth/confirm-signup`)

## Trieu chung ban dau

Response mau:

```json
{
  "statusCode": 500,
  "message": "Invalid `this.prisma.user.count()` invocation ... User was denied access on the database `spendwise`",
  "path": "/users"
}
```

Ban dau message cua Prisma de nguoi doc de hieu sai thanh "sai user/password". Thuc te can xem `meta`/`cause` moi thay loi goc.

## Log then chot nguyen nhan

Sau khi bo sung logging chi tiet trong `HttpExceptionFilter`, CloudWatch cho thay:

1. **P1010 + no encryption**
   - `no pg_hba.conf entry for host "...", user "appuser", database "spendwise", no encryption`
   - Nghia la ket noi tu ECS vao RDS khong dung SSL.

2. **Sau khi bat SSL (`sslmode=require`)**
   - `TlsConnectionError: self-signed certificate in certificate chain`
   - Nghia la ket noi da ma hoa, nhung verify cert that bai.

## Nguyen nhan goc

- Khong phai do master user hoac quyen SQL.
- Van de nam o **TLS handshake/verification** giua `pg` driver (qua Prisma adapter) va RDS.

## Cac thay doi da thuc hien

### 1) Infrastructure URL DB (ECS + Cognito Lambda)

File: `infrastructure/environments/dev/main.tf`

- URL da duoc doi qua cac buoc:
  - `sslmode=require`
  - sau do cho dev: `sslmode=no-verify&schema=public`

Ap dung cho ca:
- `local.ecs_backend_environment` -> `DATABASE_URL`
- `local.cognito_post_confirmation_database_url`

### 2) PrismaService phu hop adapter-pg trong codebase

File: `backend/src/modules/prisma/service/prisma.service.ts`

- Parse `DATABASE_URL`
- Neu `sslmode=no-verify` thi map xuong `pg`:
  - `ssl: { rejectUnauthorized: false }`
- Van dung `PrismaPg` adapter dung style hien co cua du an

### 3) Logging de chan doan

File: `backend/src/common/filters/http-exception.filter.ts`

- Bat cac nhom loi Prisma (`KnownRequest`, `Init`, `Unknown`...)
- Log them `code`, `meta`, `cause` de thay loi goc tu driver/Postgres

File: `backend/src/main.ts`

- Log `DATABASE_URL` da che mat khau de xac minh task Fargate dang dung URL nao.

## Ket qua sau cung

- API `/users` tra ve `200`, query DB thanh cong.
- Xac nhan loi 500 truoc do da duoc giai quyet o moi truong dev.

## Bai hoc rut ra

1. Message tong quat cua Prisma co the gay nham lan; can log `meta`/`cause`.
2. Migration thanh cong khong dong nghia runtime ECS dung cung config TLS.
3. Voi dev, `sslmode=no-verify` co the chap nhan tam thoi.
4. Voi production, nen dung CA bundle hop le thay vi tat verify.

## Checklist cho lan sau

1. Build + push image moi.
2. `terraform apply` de cap nhat env.
3. Force new deployment ECS.
4. Xac nhan deployment `PRIMARY` da `COMPLETED`.
5. Tail CloudWatch log stream moi nhat.
6. Test API va doi chieu voi log `Prisma ... meta/cause`.

