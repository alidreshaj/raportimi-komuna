# Udhëzime për Claude

## Rreth meje
Jam fillestar dhe po e ndërtoj këtë projekt për të mësuar C#, .NET dhe ASP.NET Core.
- Më shpjego çdo hap në shqip, thjesht, dhe pse po e bëjmë.
- Bëj ndryshime të vogla, një hap në një kohë, jo shumë file njëherësh.
- Para se të ndryshosh diçka të madhe, më trego planin.
- Punoj në macOS (Apple M1 Max).

## Projekti
Sistemi për raportimin e problemeve në komunë.
Plani i plotë është te docs/plani.md, diagrami i databazës te docs/databaza-diagrami.png.

## Teknologjitë
- ASP.NET Core Web API me Controllers (.NET 10)
- PostgreSQL + Entity Framework Core
- JWT për autentikim
- React + TypeScript (më vonë)

## Arkitektura (Layered)
Controllers → Services → Data (AppDbContext) → PostgreSQL
- Controllers: vetëm pranojnë kërkesën dhe kthejnë përgjigjen, pa logjikë.
- Services: logjika dhe rregullat e biznesit.
- Data: AppDbContext me EF Core.
- Models: User, Report, Category, Comment, Image.
- DTOs: të dhënat që shkojnë/vijnë nga klienti (kurrë mos kthe PasswordHash).

## Rregulla
- Password-et ruhen vetëm si hash.
- Fotot ruhen si file në uploads/, në databazë vetëm FilePath.
- Qytetari sheh/ndryshon vetëm raportet e veta, dhe vetëm kur statusi është New.
- Vetëm Admin ndryshon statusin.

## Faza aktuale
Fazat 1-7 janë përfunduar: backend-i është i plotë (setup, Swagger, PostgreSQL + EF Core, Register/Login, JWT, Rolet, seed i Admin-it, Categories, Reports me CRUD, filtra dhe autorizim, Comments, Images me ngarkim të sigurt, shfaqje të mbrojtur dhe fshirje).
Tani: Faza 8 (React + TypeScript: login, raportet e mia, forma e raportit).

Për frontend-in (Faza 8-10):
- Tokeni JWT vlen 120 minuta; dërgohet si `Authorization: Bearer <token>`. Kur skadon, API kthen 401.
- Fotot shihen vetëm përmes `GET /api/reports/{id}/images/{imageId}`, që kërkon token. `<img src>` nuk dërgon vetë header-in Authorization, prandaj fotot duhen marrë me `fetch` me token dhe të shfaqen si blob.
- Ngarkimi i fotove: `POST /api/reports/{id}/images` me `multipart/form-data`, fusha `files`.
- Kodet: 401 (pa identitet), 403 (roli nuk lejon), 404 (nuk ekziston ose nuk është i yti), 409 (gjendja e raportit nuk lejon), 400 (të dhëna të pavlefshme).
- Datat vijnë në UTC.
- API-ja nuk ka CORS të konfiguruar ende: duhet shtuar te `Program.cs` para se React të thërrasë API-n nga shfletuesi.

Sekretet (Jwt:Key, Admin:Email, Admin:Password) ruhen me `dotnet user-secrets`, kurrë në Git.