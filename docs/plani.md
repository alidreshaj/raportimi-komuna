# Sistemi për Raportimin e Problemeve në Komunë (versioni i përmirësuar)

## 1. Përshkrimi i projektit

Ky projekt është një platformë web që u mundëson qytetarëve të raportojnë probleme ose ankesa në komunën e tyre në mënyrë digjitale.

Në vend që qytetari të shkojë fizikisht në komunë ose të telefonojë, ai hyn në platformë, krijon një raport dhe e dërgon direkt te komuna. Komuna e shqyrton, i ndryshon statusin dhe i përgjigjet qytetarit.

Shembull:

Një qytetar vëren se një rrugë ka një gropë. Ai hyn në platformë dhe krijon raportin:

* Titulli: Gropë në rrugë
* Kategoria: Rrugë
* Përshkrimi: Ka një gropë të madhe në rrugë që paraqet rrezik për automjetet.
* Lokacioni: Pejë, Rruga "Mbretëresha Teutë", afër shkollës
* Foto: Ngarkon një fotografi

Pas dërgimit, raporti ruhet në databazë dhe shfaqet në panelin e komunës.

---

# 2. Teknologjitë

### Frontend
* React
* TypeScript (rekomandohet më shumë se JavaScript, sepse zbulon gabimet më herët)
* HTML/CSS

### Backend
* C#
* .NET
* ASP.NET Core Web API
* Entity Framework Core (për lidhjen me databazën)
* Swagger (për të testuar API-të pa pasur ende frontend)

### Database
* PostgreSQL

### Version Control
* Git
* GitHub

Struktura kryesore:

```text
React (Frontend)
   ↓  HTTP Request (JSON)
ASP.NET Core Web API (Backend)
   ↓  Entity Framework Core
PostgreSQL (Database)
```

Fotot NUK ruhen brenda databazës. Ruhen si file (në server, p.sh. folderi `uploads/`), ndërsa në databazë ruhet vetëm rruga (path) e fotos.

---

# 3. Databaza

Projekti përdor 5 tabela kryesore.

## Users

Ruajnë përdoruesit e sistemit.

* Id
* Name
* Email (unik — nuk lejohen dy llogari me të njëjtin email)
* PasswordHash (fjalëkalimi NUK ruhet kurrë si tekst i thjeshtë, por i enkriptuar/hash-uar)
* Role
* CreatedAt

Role:

* Citizen
* Admin

Shënim: Admin-i nuk krijohet përmes regjistrimit publik. Krijohet që në fillim nga databaza (seed), që askush të mos regjistrohet vetë si admin.

---

## Reports

Tabela kryesore e projektit. Çdo raportim i qytetarit ruhet këtu.

* Id
* Title
* Description
* Location (adresa ose përshkrimi i vendit)
* Latitude (opsionale — për hartë më vonë)
* Longitude (opsionale — për hartë më vonë)
* Status
* CreatedAt
* UpdatedAt
* UserId (kush e ka raportuar)
* CategoryId (çfarë lloji problemi)

Status:

```text
New
InProgress
Resolved
Rejected
```

---

## Categories

Përcakton llojin e problemit.

* Id
* Name

Vlerat fillestare:

```text
Rrugë
Ndriçim
Mbeturina
Ujë
Kanalizim
Hapësira publike
Të tjera
```

---

## Comments

Përdoret për komunikim rreth një raportimi (admin ↔ qytetar).

* Id
* Text
* CreatedAt
* ReportId
* UserId (kush e ka shkruar komentin)

---

## Images

Ruajnë fotografitë që qytetari bashkëngjit me raportimin.

* Id
* FilePath (rruga e file-it në server)
* UploadedAt
* ReportId

Rregulla:
* Lejohen vetëm .jpg, .jpeg, .png
* Madhësia maksimale p.sh. 5 MB për foto
* Maksimum p.sh. 5 foto për raport

---

## Lidhjet mes tabelave

```text
Users      1 ──── N  Reports     (një qytetar ka shumë raporte)
Categories 1 ──── N  Reports     (një kategori ka shumë raporte)
Reports    1 ──── N  Images      (një raport ka shumë foto)
Reports    1 ──── N  Comments    (një raport ka shumë komente)
Users      1 ──── N  Comments    (një përdorues shkruan shumë komente)
```

---

# 4. Kush çfarë mund të bëjë (autorizimi)

| Veprimi                          | Qytetari                    | Admin |
|----------------------------------|-----------------------------|-------|
| Krijon raport                    | Po                          | Jo    |
| Sheh raportet                    | Vetëm të vetat              | Të gjitha |
| Ndryshon/fshin raport            | Vetëm të vetin, kur është New | Jo  |
| Ndryshon statusin                | Jo                          | Po    |
| Shton koment                     | Po, te raporti i vet        | Po    |

Kjo është shumë e rëndësishme: pa këto rregulla, një qytetar mund të shohë ose të fshijë raportet e të tjerëve.

---

# 5. Flow-i i qytetarit

## Hapi 1 – Regjistrimi

Qytetari plotëson: Emri, Email, Password.

Backend-i:
1. Kontrollon që email-i nuk ekziston.
2. E bën hash password-in.
3. E ruan përdoruesin në `Users` me rolin `Citizen`.

## Hapi 2 – Login

```text
Email + Password
       ↓
Backend kontrollon email-in dhe password-in
       ↓
Nëse janë të sakta → krijon një JWT token
       ↓
React e ruan token-in
       ↓
Çdo kërkesë tjetër dërgohet me këtë token
```

Token-i i tregon backend-it KUSH je dhe ÇFARË ROLI ke, pa pasur nevojë të japësh password-in çdo herë.

## Hapi 3 – Krijimi i raportimit

Qytetari klikon **"Raporto një problem"** dhe plotëson formën:

```text
Titulli
Përshkrimi
Kategoria (zgjidhet nga lista)
Lokacioni
Foto (opsionale, deri në 5)
```

Klikon **Dërgo raportimin**.

## Hapi 4 – Ndjekja e raportimit

Qytetari hap **Raportimet e mia** dhe sheh statusin dhe komentet e komunës.

```text
Gropë në rrugë
Kategoria: Rrugë
Lokacioni: Pejë
Statusi: InProgress
Koment nga komuna: "Ekipi teknik është njoftuar."
```

---

# 6. Çfarë ndodh në backend kur krijohet raporti?

React nuk e ruan direkt raportin në databazë. Dërgon një HTTP request:

```text
POST /api/reports
```

ASP.NET Core:

1. Kontrollon token-in (a është i loguar përdoruesi?).
2. Kontrollon të dhënat (a ka titull, përshkrim, kategori të vlefshme?).
3. Krijon raportin me statusin `New`.
4. Ruan fotot në server dhe path-et në `Images`.
5. Ruan gjithçka në PostgreSQL.
6. Kthen përgjigje te React (201 Created ose gabim 400 me arsyen).

```text
React
  ↓  POST /api/reports (+ token)
ASP.NET Core
  ↓  kontrollon token + të dhënat
PostgreSQL
  ↓
Report created (Status: New)
  ↓
React shfaq mesazhin "Raportimi u dërgua me sukses"
```

---

# 7. Paneli i komunës (Admin)

Administratori hyn me account-in e tij dhe sheh të gjitha raportimet:

```text
#001  Gropë në rrugë       Rrugë       New
#002  Drita nuk punon      Ndriçim     InProgress
#003  Mbeturina            Mbeturina   Resolved
```

Mund të filtrojë sipas:
* Statusit (p.sh. vetëm `New`)
* Kategorisë
* Datës

Kur hap një raport, sheh: kush e ka raportuar, përshkrimin, kategorinë, lokacionin, fotot, komentet, datën dhe statusin.

---

# 8. Ndryshimi i statusit

Rrugët e lejuara:

```text
New ──→ InProgress ──→ Resolved
 │
 └──→ Rejected
```

Rregulla:
* Një raport `Resolved` ose `Rejected` konsiderohet i mbyllur.
* Kur admini e bën `Rejected`, DUHET të shkruajë arsyen si koment, që qytetari ta dijë pse.
* Çdo ndryshim përditëson `UpdatedAt`.

---

# 9. Komentet

Admini dhe qytetari mund të komunikojnë përmes komenteve te raporti.

```text
Raporti: Drita e rrugës nuk punon

Admin:     "Ekipi teknik është njoftuar."
Qytetari:  "Faleminderit, drita është te hyrja e dytë."
```

---

# 10. Flow-i komplet

```text
QYTETARI
   │  Register / Login → merr JWT token
   ↓
REACT
   │  HTTP Request + token
   ↓
ASP.NET CORE API
   │  kontrollon token, rolin dhe të dhënat
   ↓
POSTGRESQL
   │
   ↓
RAPORTI KRIJOHET (New)
   │
   ↓
ADMIN DASHBOARD
   ├── Filtron dhe shikon raportet
   ├── Shikon fotot
   ├── Shton koment
   └── Ndryshon statusin → InProgress → Resolved / Rejected
             │
             ↓
QYTETARI sheh statusin dhe komentet te "Raportimet e mia"
```

---

# 11. API-të kryesore

```text
AUTH
POST   /api/auth/register            regjistrim (qytetar)
POST   /api/auth/login               login → kthen JWT

REPORTS
GET    /api/reports                  admin: të gjitha (me filtra ?status=&categoryId=)
GET    /api/reports/my               qytetari: raportet e veta
GET    /api/reports/{id}             detajet e një raporti
POST   /api/reports                  krijo raport (qytetar)
PUT    /api/reports/{id}             ndrysho raportin (qytetar, vetëm kur është New)
DELETE /api/reports/{id}             fshi raportin (qytetar, vetëm kur është New)
PATCH  /api/reports/{id}/status      ndrysho statusin (vetëm admin)

IMAGES
POST   /api/reports/{id}/images      ngarko foto

CATEGORIES
GET    /api/categories

COMMENTS
GET    /api/reports/{id}/comments
POST   /api/reports/{id}/comments
```

Ndryshimi kryesor: statusi ka endpoint-in e vet (`PATCH .../status`), që të jetë e qartë se vetëm admini e ndryshon statusin, ndërsa qytetari ndryshon vetëm përmbajtjen e raportit.

---

# 12. Çfarë do të mësohet gjatë projektit?

* C#, .NET, ASP.NET Core
* REST API, HTTP Requests, status codes (200, 201, 400, 401, 403, 404)
* CRUD
* PostgreSQL, Entity Framework Core, Migrations
* Database Relationships
* Authentication (JWT) dhe Authorization (rolet)
* Password hashing
* Validimi i të dhënave
* File/Image Upload
* React, Forms, API integration
* Git & GitHub
* Struktura e projektit, komunikimi Frontend/Backend

---

# 13. Si do ta ndërtojmë?

Gradualisht, dhe me Git që nga dita e parë (commit pas çdo faze):

```text
FAZA 1   Setup i projektit + Git + GitHub
FAZA 2   ASP.NET Core Backend + Swagger
FAZA 3   PostgreSQL + Entity Framework Core + Migrations
FAZA 4   Users + Register/Login + JWT + Rolet
FAZA 5   Categories (me vlera fillestare)
FAZA 6   Reports + CRUD + rregullat e autorizimit
FAZA 7   Comments + Images (upload)
FAZA 8   React Frontend (faqet: login, raportet e mia, forma)
FAZA 9   Lidhja React ↔ API
FAZA 10  Admin Dashboard (lista, filtra, statusi, komentet)
FAZA 11  Testimi final + README + përfundimi
```

Pas çdo faze të backend-it, API-të testohen në Swagger para se të kalohet te faza tjetër.

---

# 14. Ide për më vonë (jo tani)

* Hartë me lokacionin e problemit (Latitude/Longitude)
* Njoftim me email kur ndryshon statusi
* Historiku i statuseve (kush e ndryshoi dhe kur)
* Statistika për komunën (sa raporte për kategori, sa të zgjidhura)

Qëllimi nuk është vetëm që projekti të funksionojë, por që gjatë ndërtimit të kuptohet **çfarë ndodh në çdo hap dhe pse po e bëjmë atë**.