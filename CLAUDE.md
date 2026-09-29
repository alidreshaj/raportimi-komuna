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
Fazat 1, 2 dhe 3 janë përfunduar (setup, Swagger, PostgreSQL + EF Core + migration fillestar).
Tani: Faza 4 (Users, Register/Login, JWT, Rolet).