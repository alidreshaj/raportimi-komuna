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
    dotnet ef database update
    dotnet run --launch-profile http

Swagger: http://localhost:5267/swagger

## Statusi
🚧 Në zhvillim. Përfunduar: Faza 1-3 (setup, Swagger, databaza me EF Core). Tani: Faza 4 (Users dhe JWT).