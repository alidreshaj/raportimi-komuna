# Sistemi për Raportimin e Problemeve në Komunë

Platformë web ku qytetarët raportojnë probleme (gropa në rrugë, ndriçim, mbeturina etj.)
dhe komuna i shqyrton, u ndryshon statusin dhe u përgjigjet.

## Funksionalitetet
- Regjistrim dhe login (qytetar / admin)
- Krijimi i raportimeve me kategori, lokacion dhe foto
- Ndjekja e statusit: New → InProgress → Resolved / Rejected
- Komente mes komunës dhe qytetarit
- Paneli i adminit për menaxhimin e raportimeve

## Teknologjitë
- Backend: ASP.NET Core Web API (C#, .NET 10)
- Databaza: PostgreSQL + Entity Framework Core
- Frontend: React + TypeScript (në zhvillim)
- Autentikimi: JWT

## Databaza
![Diagrami i databazës](docs/databaza-diagrami.png)

## Si ndizet
Duhet PostgreSQL i instaluar dhe një databazë e quajtur `raportimi_komuna`.
Connection string-u është te `Backend/appsettings.Development.json`.

    cd Backend

### Sekretet (një herë, nuk ruhen në Git)
Sekretet ruhen me `dotnet user-secrets`, jashtë projektit. Pa to aplikacioni nuk niset.

    dotnet user-secrets set "Jwt:Key" "$(openssl rand -base64 48)"
    dotnet user-secrets set "Admin:Email" "admin@komuna.local"
    dotnet user-secrets set "Admin:Password" "<fjalëkalim me të paktën 8 karaktere>"

- `Jwt:Key` është çelësi që nënshkruan tokenat JWT.
- `Admin:Email` dhe `Admin:Password` përdoren për të krijuar adminin në nisjen e parë.

### Nisja

    dotnet ef database update
    dotnet run --launch-profile http

Swagger: http://localhost:5267/swagger

Për endpoint-et e mbrojtura: bëj login te `POST /api/auth/login`, kopjo vetëm tokenin
dhe vendose te butoni **Authorize** i Swagger.

## Endpoint-et deri tani
| Metoda | Rruga | Qasja |
|---|---|---|
| GET | `/api/health` | publike |
| POST | `/api/auth/register` | publike (krijon Citizen) |
| POST | `/api/auth/login` | publike (kthen JWT) |
| GET | `/api/auth/me` | çdo përdorues i loguar |
| GET | `/api/auth/admin-only` | vetëm Admin (endpoint prove) |
| GET | `/api/categories` | publike (lista e kategorive) |
| POST | `/api/reports` | Qytetari (krijon raport me status `New`) |
| GET | `/api/reports/my` | Qytetari (raportet e veta) |
| GET | `/api/reports/{id}` | I zoti ose Admin (të tjerët marrin 404) |
| GET | `/api/reports` | vetëm Admin, filtra: `status`, `categoryId`, `from`, `to` |
| PUT | `/api/reports/{id}` | Qytetari, raportin e vet, vetëm kur është `New` |
| DELETE | `/api/reports/{id}` | Qytetari, raportin e vet, vetëm kur është `New` |
| PATCH | `/api/reports/{id}/status` | vetëm Admin (New → InProgress → Resolved, ose New → Rejected) |

### Kodet e përgjigjes
- **401**: nuk je i identifikuar (pa token, token i prishur ose i skaduar).
- **403**: je i identifikuar, por roli nuk e lejon veprimin.
- **404**: raporti nuk ekziston ose nuk është i yti.
- **409**: veprimi nuk lejohet për gjendjen aktuale të raportit (p.sh. ndryshim kur nuk është `New`).

Datat e filtrave llogariten sipas UTC. Tokeni vlen 120 minuta.

## Statusi
🚧 Në zhvillim. Përfunduar: Faza 1-6 (setup, Swagger, databaza, përdoruesit, JWT dhe rolet, kategoritë, raportet). Tani: Faza 7 (komentet dhe fotot).