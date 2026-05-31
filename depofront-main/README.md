# DEPO Frontend

## Përshkrimi i projektit

DEPO është një sistem për menaxhimin e depos që ndihmon në organizimin e produkteve, furnitorëve, kategorive, porosive, transportit dhe përdoruesve. Projekti është ndërtuar si aplikacion full-stack, ku frontend-i është realizuar me React dhe backend-i me Spring Boot. Qëllimi kryesor i sistemit është centralizimi i proceseve të depos në një platformë të vetme, ku çdo përdorues ka qasje vetëm në funksionet që i takojnë sipas rolit të tij.

Në aspektin funksional, sistemi i lejon përdoruesit të regjistrohen, të kyçen në aplikacion, të shohin produkte dhe porosi, të krijojnë porosi të reja, të shënojnë porositë si të pranuara dhe të menaxhojnë transportin e tyre. Administratori ka qasje në menaxhimin e furnitorëve, kategorive, produkteve, porosive, përdoruesve dhe roleve. Stafi i transportit ka qasje në pjesën e transportit dhe në porositë që kërkojnë organizim të dërgesës.

Ky README fokusohet në frontend-in e aplikacionit, por në fillim jep edhe pamjen e përgjithshme të logjikës së sistemit, në mënyrë që të kuptohet se si ndërfaqja komunikon me backend-in dhe çfarë roli ka në rrjedhën e plotë të aplikacionit.

## Logjika e përgjithshme e aplikacionit

Sistemi DEPO funksionon sipas një rrjedhe të qartë pune:

1. Një përdorues i ri regjistrohet në sistem.
2. Pas regjistrimit, backend-i i cakton automatikisht rolin fillestar `EMPLOYEE`.
3. Përdoruesi kyçet me username dhe password.
4. Frontend-i ruan kredencialet në `localStorage` dhe i përdor ato për kërkesat e ardhshme HTTP Basic Auth.
5. Pas kyçjes, përdoruesi dërgohet në dashboard.
6. Dashboard-i shfaq lidhje dhe funksione sipas roleve të përdoruesit.
7. Produktet, porositë, transporti dhe administrimi menaxhohen përmes faqeve të veçanta.
8. Për çdo veprim, frontend-i komunikon me backend-in përmes REST API-ve.

Në këtë strukturë, frontend-i nuk mban logjikën e biznesit në nivel të thellë. Ai kujdeset për:

- paraqitjen e të dhënave
- marrjen e inputit nga përdoruesi
- dërgimin e kërkesave te backend-i
- menaxhimin e navigimit dhe gjendjes së autentikimit
- kontrollin vizual të aksesit sipas roleve

## Roli i frontend-it në sistem

Frontend-i është shtresa me të cilën ndërvepron drejtpërdrejt përdoruesi. Ai shfaq ekranet, formularët, tabelat, kartelat dhe butonat për veprimet që sistemi lejon. Në DEPO, frontend-i ka këto përgjegjësi kryesore:

- ofron faqe për login dhe register
- ruan gjendjen e përdoruesit të kyçur
- mbron rrugët që kërkojnë autentikim
- shfaq përmbajtje të ndryshme sipas rolit
- ngarkon dhe paraqet të dhënat nga backend-i
- dërgon forma për krijim, përditësim ose fshirje të të dhënave

Frontend-i është projektuar në mënyrë modulare, ku secila pjesë e sistemit ka komponentët e vet dhe fileët përkatës të stilizimit.

## Teknologjitë e përdorura në frontend

- `React`
- `React Router DOM`
- `Axios`
- `Bootstrap`
- `jQuery`
- `DataTables`
- `React Icons`
- `CSS`
- `Jest`
- `React Testing Library`

## Struktura kryesore e frontend-it

Struktura e aplikacionit është organizuar rreth disa pjesëve kryesore:

- `src/App.js`
- `src/context/AuthContext.js`
- `src/services/api.js`
- `src/components/*`

### `App.js`

`App.js` është pika kryesore e konfigurimit të rrugëve të frontend-it. Ai përdor `BrowserRouter`, `Routes` dhe `Route` për të ndarë faqet e aplikacionit. Po ashtu, e mbështjell të gjithë aplikacionin me `AuthProvider`, në mënyrë që gjendja e autentikimit të jetë e qasshme nga komponentët e tjerë.

Rrugët kryesore janë:

- `/login`
- `/register`
- `/dashboard`
- `/products`
- `/orders`
- `/transport`
- `/admin`

Rrugët e mbrojtura kalojnë përmes komponentit `ProtectedRoute`.

### `AuthContext.js`

Ky file është zemra e autentikimit në frontend. Ai mban:

- përdoruesin aktual
- gjendjen `loading`
- funksionet `login`, `logout` dhe `register`

Kur aplikacioni ngarkohet, `AuthContext` kontrollon nëse ekzistojnë kredenciale të ruajtura në `localStorage`. Nëse po, frontend-i bën thirrje te `/api/auth/me` për të verifikuar nëse ato kredenciale janë ende valide. Nëse verifikimi dështon, kredencialet fshihen.

Kjo qasje bën të mundur që përdoruesi të mos dalë automatikisht nga sistemi sa herë që rifreskon faqen.

### `ProtectedRoute.js`

Ky komponent siguron që faqet e mbrojtura të mos hapen nga përdorues të paautentikuar. Nëse përdoruesi nuk është i kyçur, ai ridrejtohet te `/login`. Nëse gjendja e autentikimit është ende duke u ngarkuar, shfaqet mesazhi `Loading...`.

## Shtresa e komunikimit me API

### `src/services/api.js`

Ky file është shtresa qendrore e komunikimit me backend-in. Ai krijon një instancë `axios` me `baseURL`:

`http://localhost:8080/api`

Përmes `axios interceptor`, frontend-i lexon kredencialet nga `localStorage` dhe i vendos në çdo kërkesë si `config.auth`, në mënyrë që backend-i të mund të përdorë HTTP Basic Auth.

Në këtë file janë të ndara shërbimet sipas fushave funksionale:

- `authAPI`
- `productAPI`
- `orderAPI`
- `supplierAPI`
- `categoryAPI`
- `userAPI`
- `transportAPI`

Kjo e bën kodin më të organizuar dhe shmang shpërndarjen e thirrjeve HTTP në shumë vende të ndryshme.

## Faqet dhe modulet kryesore të frontend-it

### Login

Komponenti `Login.js` ofron formularin e hyrjes në sistem. Ai merr username dhe password, thërret funksionin `login` nga `AuthContext` dhe në rast suksesi e dërgon përdoruesin në dashboard.

### Register

Komponenti `Register.js` merret me regjistrimin e përdoruesit. Ai kryen edhe validim bazë në frontend:

- fjalëkalimet duhet të përputhen
- fjalëkalimi duhet të ketë të paktën 6 karaktere

Pas regjistrimit të suksesshëm, përdoruesi kyçet automatikisht dhe dërgohet në dashboard.

### Dashboard

`Dashboard.js` është faqja hyrëse pas autentikimit. Ky komponent:

- lexon përdoruesin nga `AuthContext`
- merr rolet e përdoruesit nga backend-i
- kontrollon nëse përdoruesi është `ADMIN`
- kontrollon nëse përdoruesi ka rol `TRANSPORT`

Në bazë të këtyre roleve, dashboard-i shfaq:

- qasje në produkte
- qasje në porosi
- qasje në transport
- qasje në panelin administrativ

Pra, dashboard-i nuk është vetëm ekran vizual, por edhe pikë kontrolli për përvojën e përdoruesit sipas rolit.

### Products

`Products.js` shërben për:

- listimin e produkteve
- kërkimin e produkteve
- krijimin e një produkti të ri

Frontend-i kontrollon rolin e përdoruesit dhe nuk lejon krijim produkti për përdoruesit me rol `EMPLOYEE`. Produktet mund të filtrohen sipas emrit, furnitorit, kategorisë ose ID-ve të lidhura.

### Orders

`Orders.js` paraqet listën e porosive dhe formën për krijimin e tyre. Një porosi përmban:

- furnitorin
- një ose më shumë artikuj
- sasinë për secilin artikull
- çmimin për secilin artikull

Frontend-i ngarkon paralelisht:

- porositë
- produktet
- furnitorët

Po ashtu, ai i lejon përdoruesit të shënojë një porosi si të pranuar përmes veprimit `Mark as Received`.

### Transport

`Transport.js` është moduli i dedikuar për dërgesat. Ky komponent:

- ngarkon transportet ekzistuese
- ngarkon porositë që kanë nevojë për transport
- lejon krijimin e transportit të ri
- lejon përditësimin e transportit
- lejon fshirjen e transportit vetëm për adminin

Një pjesë e rëndësishme e logjikës është se frontend-i shfaq posaçërisht porositë me status të përshtatshëm për transport dhe i jep përdoruesit mundësinë të caktojë kompani transporti, tracking number, delivery date dhe status.

### AdminDashboard

`AdminDashboard.js` është paneli administrativ i sistemit. Ky komponent kontrollon nëse përdoruesi ka rol `ADMIN`. Nëse jo, frontend-i e ridrejton përdoruesin dhe shfaq mesazh informues.

Paneli administrativ përfshin tab-e për:

- furnitorë
- kategori
- produkte
- porosi
- përdorues dhe role

Ky organizim e bën menaxhimin qendror më të pastër dhe më të lehtë për administratorin.

### Menaxhimi i përdoruesve dhe roleve

`UserManagement.js` është një komponent i rëndësishëm sepse frontend-i aty ofron:

- listimin e përdoruesve
- shfaqjen e roleve
- caktimin e roleve
- heqjen e roleve

Ky komponent përdor `DataTables`, gjë që i jep tabelës:

- paginim
- renditje
- menaxhim më të mirë të shumë rreshtave

### Furnitorët, kategoritë, produktet dhe porositë në panelin admin

Komponentët:

- `SupplierManagement.js`
- `CategoryManagement.js`
- `ProductManagement.js`
- `OrderManagement.js`

ofrojnë forma dhe tabela për CRUD ose menaxhim administrativ. Ata përdorin API-të përkatëse dhe rifreskojnë të dhënat pas krijimit ose ndryshimit.

## Menaxhimi i roleve në frontend

Frontend-i nuk zëvendëson kontrollin e backend-it, por e përforcon përvojën e përdoruesit. Kjo do të thotë:

- backend-i është autoriteti real për sigurinë
- frontend-i kontrollon çfarë të shfaqë
- backend-i kontrollon çfarë të lejojë

Shembuj:

- butoni për krijim produkti fshihet për përdoruesin `EMPLOYEE`
- paneli admin shfaqet vetëm për `ADMIN`
- moduli i transportit shfaqet për `TRANSPORT` dhe `ADMIN`

## Stilizimi

Çdo modul kryesor ka edhe filein e vet CSS, për shembull:

- `Dashboard.css`
- `Products.css`
- `Orders.css`
- `Transport.css`
- `AdminDashboard.css`

Kjo strukturë e ndarë e stilizimit ndihmon që secila pjesë e sistemit të menaxhohet më lehtë dhe që ndryshimet vizuale të mos ndikojnë panevojshëm në pjesë të tjera.

## Testimi në frontend

Frontend-i përfshin edhe teste bazë që ndihmojnë në verifikimin e sjelljes së aplikacionit.

### `Register.test.js`

Ky test kontrollon:

- rastin kur password-et nuk përputhen
- rastin e regjistrimit të suksesshëm

### `api.test.js`

Ky test verifikon që API wrapper-at dërgojnë kërkesat në endpoint-et e sakta.

Kjo është e rëndësishme sepse një pjesë e madhe e logjikës së frontend-it varet nga komunikimi i saktë me backend-in.

## Si të ekzekutohet frontend-i

### Instalimi i varësive

```bash
npm install
```

### Nisja në development mode

```bash
npm start
```

Frontend-i hapet zakonisht në:

```text
http://localhost:3000
```

### Ekzekutimi i testeve

```bash
npm test
```

### Build për production

```bash
npm run build
```

## Përmbledhje

Frontend-i i DEPO është një shtresë e strukturuar mirë që organizon ndërfaqen e përdoruesit, kontrollon navigimin, menaxhon autentikimin dhe e lidh përdoruesin me logjikën e backend-it. Ai nuk është vetëm pamje, por pjesë e rëndësishme e përvojës funksionale të sistemit, sepse përshtat rrugët dhe ndërfaqet sipas roleve dhe mbështet proceset kryesore të menaxhimit të depos.
