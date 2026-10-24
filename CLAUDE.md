# Udhëzime për Claude

## Rreth meje
Jam fillestar dhe po e ndërtoj këtë projekt për të mësuar C#, .NET dhe ASP.NET Core (dhe React).
- Më shpjego çdo hap në shqip, thjesht, dhe pse po e bëjmë.
- Bëj ndryshime të vogla, një hap në një kohë, jo shumë file njëherësh.
- Para se të ndryshosh diçka të madhe, më trego planin.
- Punoj në macOS (Apple M1 Max).
- Testimin e frontend-it e bëj unë vetë te shfletuesi. Ti kontrollo vetëm me `npm run build` dhe `npm run lint`, dhe më jep hapat e provës (çfarë të klikoj dhe çfarë pres). Mos drejto prova te shfletuesi, mos krijo të dhëna te databaza ime, dhe mos nis ose ndal backend-in tim pa pyetur.
- Komandat `git` jepi për t'u ekzekutuar nga folderi kryesor `/Users/alidreshaj/Documents/raportimi-komuna` (jo nga `Backend` ose `Frontend`), një komandë për çdo bllok kodi. Commit-et i bëj zakonisht unë, pasi ta kem provuar; mos i bëj vetë pa u kërkuar.

## Projekti
Sistemi për raportimin e problemeve në komunë.
Plani i plotë është te docs/plani.md, diagrami i databazës te docs/databaza-diagrami.png, dizajni i faqeve te docs/design/ (foto PNG).

## Teknologjitë
- Backend: ASP.NET Core Web API me Controllers (.NET 10)
- PostgreSQL + Entity Framework Core
- JWT për autentikim
- Frontend: React 19 + TypeScript, Vite, React Router (folderi `Frontend/`)

## Arkitektura e backend-it (Layered)
Controllers → Services → Data (AppDbContext) → PostgreSQL
- Controllers: vetëm pranojnë kërkesën dhe kthejnë përgjigjen, pa logjikë.
- Services: logjika dhe rregullat e biznesit.
- Data: AppDbContext me EF Core.
- Models: User, Report, Category, Comment, Image, StatusHistory.
- DTOs: të dhënat që shkojnë/vijnë nga klienti (kurrë mos kthe PasswordHash).

## Rregulla
- Password-et ruhen vetëm si hash.
- Fotot ruhen si file në uploads/, në databazë vetëm FilePath.
- Qytetari sheh/ndryshon vetëm raportet e veta, dhe vetëm kur statusi është New.
- Vetëm Admin ndryshon statusin. Rrugët e lejuara: New → InProgress → Resolved, ose New → Rejected (Rejected kërkon arsye, që ruhet si koment).

## Si niset projekti
- Backend (API): `cd Backend` dhe `dotnet run --launch-profile http`, te `http://localhost:5267` (Swagger te `/swagger`). Sekretet vendosen një herë me `dotnet user-secrets` (shih README).
- Frontend: `cd Frontend` dhe `npm run dev`, te `http://localhost:5173`. Adresa e API-t është te `Frontend/.env` (`VITE_API_URL`, kopjo nga `.env.example`); Vite e lexon `.env` vetëm kur niset.
- Të dyja punojnë njëkohësisht, secila në terminalin e vet. CORS lejon vetëm `http://localhost:5173` (`Cors:AllowedOrigins` te `Backend/appsettings.json`), prandaj frontend-i duhet të hapet saktësisht në atë adresë.

## Faza aktuale
Fazat 1-7 janë përfunduar: backend-i është i plotë dhe i provuar (autentikim, rolet, kategoritë, raportet me filtra dhe autorizim, komentet, fotot me ngarkim të sigurt, shfaqje të mbrojtur dhe fshirje).

Faza 8 (frontend i qytetarit) është ndërtuar deri te hapi 8.9: hyrja, regjistrimi, sesioni, lista e raporteve, forma e raportit me foto, detajet me bisedën, ndryshimi dhe fshirja e raportit. Fazat 8 dhe 9 të planit janë bashkuar (çdo faqe lidhet me API-n menjëherë). U shtuan edhe dy hapa jashtë planit: dizajni vizual (docs/design/) dhe CORS.

Faza 10 (paneli i adminit) është ndërtuar: menyja dhe rrugët sipas rolit, lista e të gjitha raporteve me filtra (status, kategori, nga data, deri më), detajet me foto dhe bisedë, ndryshimi i statusit (Refuzo kërkon arsye) dhe komentimi. Kodi kalon `npm run build` dhe `npm run lint`; provat te shfletuesi i bën përdoruesi.

`ReportDto` ka `CommentCount` (numri i mesazheve, i llogaritur te projektimi `ToDto` pa migrim) dhe kartat e listës e shfaqin.

Faza 16 (ripërtëritja vizuale, vetëm frontend) është përfunduar në pesë pjesë. A: sistemi i dizajnit te `index.css` (rreze, hije, `--ease`, gradient i lehtë i sfondit) dhe ikonat Lucide (menyja, `StatusBadge` me ikonë për çdo status, `CategoryIcon`, butonat). B: menyja sticky me avatar dhe lidhje "pilulë", `ReportCard` me miniaturë (ngarkim i vonuar me `useInView`; backend-i nuk ka miniatura, kështu shkarkohet foto e plotë) dhe vijë statusi në anë. C: pulti i qytetarit te `/raportet` (kartë mirëseardhjeje, katër numra personalë) dhe `AttentionPanel` për adminin (raportet e reja, më të vjetrat, pragu 3 ditë). D: toasts (`ToastProvider`, `useToast`), skeletone (`Skeleton`, `ReportListSkeleton`, `DetailSkeleton`, `StatsSkeleton`), `EmptyState` me ilustrim, animacione (`prefers-reduced-motion` respektohet kudo). E: tema e errët (`data-theme` te `<html>`, vendoset nga skripti te `index.html` para pikturimit, `utils/theme.ts`, `ThemeToggle`) dhe silueta e Kosovës (`KosovoArt`) te paneli i hyrjes; numrat publikë te hyrja NUK u bënë (kërkojnë endpoint të hapur te backend-i).

Faza 14 (hartat) është përfunduar, vetëm te frontend-i (backend-i nuk ndryshoi: `Latitude` dhe `Longitude` ekzistonin tashmë, opsionale, me validim -90..90 dhe -180..180). Leaflet + react-leaflet + react-leaflet-cluster, imazhet satelitore të Esri (pa çelës API; atribuimi nuk hiqet). `MapView` është harta bazë që e ripërdorin të gjitha (vetëm satelit); qendra e paracaktuar është Peja. `LocationPicker` te forma (klikim, shenjë e tërhequr, "Hiq pikën", "Përdor vendndodhjen time" me GPS të shfletuesit, që pyet vetëm kur klikohet); pika është opsionale dhe te ndryshimi dërgohet `null` nëse hiqet. `ReportMap` te detajet (vetëm kur raporti ka pikë; rrota e mausit e fikur). `ReportsMap` te `/admin/raportet` me çelësin Listë/Hartë: shenja sipas ngjyrës së statusit, grupe, kartë me lidhje, legjendë, numërues "pa vendndodhje"; përdor të njëjtat filtra si lista. Hartat janë të kufizuara te Kosova (`KOSOVO_BOUNDS`, `MIN_ZOOM` te `mapDefaults.ts`; `maxBoundsViscosity` 1), harta ka vetëm pamjen satelitore të Esri (pa çelës API, pa çelës Harta/Satelit; CARTO kërkon tani çelës: pllakat kthejnë "API KEY REQUIRED", prandaj e hoqëm; provoje një URL pllake me curl para se ta vendosësh), `KosovoMask` errëson jashtë kufirit (pane me zIndex 250, nën shenjat, `interactive={false}` që mos kapë klikime), dhe `utils/geo.ts` (`isInsideKosovo`, metoda e rrezes) lejon pika vetëm brenda Kosovës te `LocationPicker` (klikim, tërheqje, GPS). Kufiri te `data/kosovoBoundary.ts` është nga geoBoundaries/OpenStreetMap (CC BY-SA 2.0, shih README): atribuimi nuk hiqet. Ikonat e shenjave kërkojnë `leafletSetup.ts` (rregullim i njohur për Vite). Madhësia e paketës kaloi 500 kB (paralajmërim i build-it, jo gabim).

Faza 13 (statistikat për komunën) është përfunduar: `GET /api/reports/stats` (vetëm Admin; `ReportService.GetStatsAsync` numëron me `GroupBy` te databaza dhe kthen `StatsDto`: totali, `byStatus` me të katër statuset edhe me 0, `byCategory` me të gjitha kategoritë nga më e ngarkuara, `byMonth` me 6 muajt e fundit sipas UTC edhe me 0; pa tabelë të re dhe pa migrim) dhe faqja `/admin/statistika`. Grafikët janë të vizatuar me SVG/CSS, pa bibliotekë, te `components/charts/`.

Faza 12 (historiku i statuseve) është përfunduar: tabela `StatusHistories` (nga, te, kush, kur; lidhet me Reports dhe Users), `UpdateStatusAsync` e regjistron çdo ndryshim në të njëjtën ruajtje me statusin, endpoint-i `GET /api/reports/{id}/history` (i zoti ose Admin, 404 për të tjerët), dhe komponenti `StatusTimeline` te të dyja faqet e detajeve. Raportet e vjetra nuk kanë histori (lista bosh).

Faza 11 është përfunduar: testimi final nga përdoruesi dhe README i plotë me foto te `docs/screenshots/`. Projekti është i përfunduar; shtesat e mundshme: email dhe një hartë e komunave të Kosovës e ngjyrosur sipas numrit të raporteve (diskutuar, jo e vendosur; do të kërkonte kufijtë e komunave dhe një fushë "Komuna" te raportet). Historiku u bë te Faza 12, statistikat te Faza 13, hartat te Faza 14.

Mbetet (opsionale):
- Gjëra të vogla të njohura: pozicioni i scroll-it ruhet kur ndërron faqe; mesazhet e validimit të backend-it janë në anglisht (frontend-i i parandalon); nuk ka teste automatike; biseda nuk rifreskohet vetë.

## Frontend: organizimi (Frontend/src)
- `api/`: i vetmi vend që flet me backend-in. `client.ts` ka `apiFetch` (JSON) dhe `apiFetchBlob` (foto); shton tokenin vetë, hedh `ApiError` me `status` dhe mesazh në shqip, dhe te 401 me token pastron sesionin. Tokeni ruhet te `localStorage` (`token.ts`). Një file për temë: `auth`, `categories`, `reports`, `comments`, `images`.
- `context/`: `ToastProvider` + `useToast` (njoftimet e vogla). `AuthProvider` + `useAuth` mbajnë sesionin (`user`, `loading`, `login`, `logout`) dhe e rikthejnë pas rifreskimit me `GET /api/auth/me`.
- `hooks/`: `useReport`, `useCategories` (ngarkim me gjendje po ngarkohet/gabim), `useElementWidth` (mat gjerësinë e një elementi; grafiku vizatohet me gjerësinë e vërtetë), `useInView` (ngarkim i vonuar i fotove te kartat).
- `components/`: `AppLayout` (menyja), `AuthShell` (paneli blu i hyrjes/regjistrimit), `ProtectedRoute`, `StatusBadge`, `ReportCard`, `ReportFields` (fushat e formës së raportit), `HomeRedirect` (te faqja kryesore e rolit), `StatusPanel` (admini ndryshon statusin; rrugët e lejuara dhe dialogu i arsyes), `PhotoPicker` (zgjedhja e fotove me parapamje), `AuthImage` (foto e mbrojtur me token), `Conversation` (biseda), `StatusTimeline` (afati kohor i statusit), `ViewSwitch` (çelës i përgjithshëm Listë/Hartë, Grafik/Tabelë), `maps/` (`MapView`, `LocationPicker`, `ReportMap`, `ReportsMap`, `KosovoMask`, `statusIcon`, `leafletSetup`, `mapDefaults`), `ScrollToTop` (faqja kthehet lart kur ndërron adresa), `AttentionPanel`, `EmptyState`, `Skeleton`/`ReportListSkeleton`/`DetailSkeleton`, `CategoryIcon`, `ThemeToggle`, `KosovoArt`, `charts/` (`ChartCard` me çelës Grafik/Tabelë, `StatTile`, `DonutChart`, `BarChart`, `LineChart`, `ChartTooltip`), `ConfirmDialog` (konfirmim me `<dialog>`, pranon përmbajtje shtesë si `children`). `ProtectedRoute` pranon `role` opsional.
- `pages/`: `LoginPage`, `RegisterPage`, `ReportsPage`, `NewReportPage`, `ReportDetailPage`, `EditReportPage`, `AdminReportsPage` (lista me filtra), `AdminReportDetailPage`, `AdminStatsPage` (statistikat).
- `utils/`: `format.ts` (data/ora në shqip, etiketat e statuseve), `roles.ts` (`homePathFor`: faqja kryesore e rolit), `photos.ts` (rregullat e fotove), `reportForm.ts` (validimi dhe kufijtë e formës së raportit).
- `types/index.ts`: tipet që pasqyrojnë DTO-të e backend-it. `utils/statusColors.ts`: ngjyrat e statuseve të përbashkëta për grafikët dhe hartën.
- Hartat: `MapView.tsx` duhet të eksportojë vetëm komponentin (oxlint ankohet për konstante aty; ato janë te `mapDefaults.ts`). Emrat që fillojnë me `use` rezervohen për hooks.
- Grafikët (`components/charts/`): ngjyrat e statuseve janë variablat `--chart-new`, `--chart-inprogress`, `--chart-resolved`, `--chart-rejected` te `index.css`, të kontrolluara me validatorin (kontrast 3:1, dallueshmëri për daltonizëm); shiritat e kategorive kanë një ngjyrë (kategoritë nuk kanë renditje). Çdo grafik ka pamje si tabelë, dhe vlerat shkruhen drejtpërdrejt, jo vetëm te hover.
- Rrugët: `/login`, `/regjistrohu`, dhe të mbrojtura: `/raportet`, `/raportet/i-ri`, `/raportet/:id`, `/raportet/:id/ndrysho`; vetëm për Admin: `/admin/raportet`, `/admin/raportet/:id`, `/admin/statistika`. Qytetari te `/admin/...` ridrejtohet te faqja e tij, dhe anasjelltas; çdo adresë tjetër shkon te faqja kryesore e rolit (`/` → `HomeRedirect`).
- Stilet: CSS i thjeshtë, pa bibliotekë. Variablat e ngjyrave dhe klasat e përbashkëta (`.field`, `.btn`, `.btn-primary`, `.form-error`...) janë te `index.css`; çdo komponent ka CSS-in e vet. Ngjyra kryesore blu `#1F4E79`, shkronja Public Sans.
- Ngjyrat: MOS shkruaj hex drejtpërdrejt te CSS (përveç të bardhës mbi blu të errët dhe njoftimeve që janë gjithmonë të errëta). Përdor variablat te `index.css`: `--accent` (tekst, ikona, shenja të të dhënave), `--accent-solid` (sfond me tekst të bardhë), `--brand` (blu konstante), `--surface`, `--surface-2`, `--ink`, `--muted`, `--line`, `--badge-*`, `--warn-*`, `--ok-*`, `--toast-bg`. Tema e errët i ridefinon ato te `:root[data-theme='dark']`. Ngjyrat `--chart-*` janë veç për secilën temë, të kontrolluara me validatorin e dataviz (errët: `#3f8fd9,#bd8014,#2aa57e,#c94444` mbi `#172231`). Kartat e Leaflet dhe butonat marrin ngjyrat e temës te `MapView.css`.
- Kujdes me lint-in: oxlint paralajmëron për `setState` sinkron brenda `useEffect`; mos e injoro pa arsye (shih `PhotoPicker.tsx` për rastin e justifikuar).

## Për frontend-in (Faza 8-10): çfarë duhet ditur nga API-ja
- Tokeni JWT vlen 120 minuta; dërgohet si `Authorization: Bearer <token>`. Kur skadon, API kthen 401.
- Fotot shihen vetëm përmes `GET /api/reports/{id}/images/{imageId}`, që kërkon token. `<img src>` nuk dërgon vetë header-in Authorization, prandaj fotot merren me `fetch` me token dhe shfaqen si blob (`AuthImage`).
- Ngarkimi i fotove: `POST /api/reports/{id}/images` me `multipart/form-data`, fusha `files`; max 5 foto, 5 MB secila, JPG ose PNG, vetëm kur raporti është New.
- Kodet: 401 (pa identitet), 403 (roli nuk lejon), 404 (nuk ekziston ose nuk është i yti), 409 (gjendja e raportit nuk lejon), 400 (të dhëna të pavlefshme).
- Datat vijnë në UTC dhe shfaqen në orën lokale.
- `GET /api/reports` (lista e adminit) pranon filtrat `status`, `categoryId`, `from`, `to`. `PATCH /api/reports/{id}/status` pranon `status` dhe `reason` (e detyrueshme për Rejected).
- Admini nuk krijon, nuk ndryshon dhe nuk fshin raporte të qytetarëve.

Sekretet (Jwt:Key, Admin:Email, Admin:Password) ruhen me `dotnet user-secrets`, kurrë në Git.

