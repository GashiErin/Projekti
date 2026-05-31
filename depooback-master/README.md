# DEPO Backend

## Përshkrimi i projektit

DEPO është një sistem për menaxhimin e depos, i ndërtuar për të mbështetur proceset kryesore të një ambienti ku menaxhohen produkte, furnitorë, kategori, porosi, transport dhe përdorues me role të ndryshme. Backend-i përfaqëson shtresën qendrore të logjikës së biznesit dhe të sigurisë së sistemit. Ai ekspozon REST API, kontrollon autentikimin dhe autorizimin, ndërvepron me databazën dhe zbaton rregullat funksionale të aplikacionit.

Ky README shpjegon:

- logjikën e përgjithshme të sistemit
- rolin e backend-it në aplikacion
- arkitekturën e backend-it
- sigurinë dhe menaxhimin e roleve
- entitetet dhe databazën
- endpoint-et kryesore
- mënyrën e ekzekutimit të projektit

## Logjika e përgjithshme e aplikacionit

Sistemi DEPO ndjek një cikël pune të organizuar:

1. Përdoruesi regjistrohet në sistem.
2. Backend-i kontrollon nëse username ose email ekziston.
3. Në rast suksesi, përdoruesit i caktohet roli fillestar `EMPLOYEE`.
4. Përdoruesi kyçet me HTTP Basic Authentication.
5. Backend-i kthen të dhënat e përdoruesit aktual përmes `/api/auth/me`.
6. Produktet, furnitorët, kategoritë dhe porositë menaxhohen sipas roleve.
7. Një porosi krijohet nga një përdorues i autentikuar dhe ruhet me furnitorin dhe artikujt përkatës.
8. Kur porosia pranohet, statusi i saj ndryshon.
9. Vetëm porositë e pranuara mund të kalojnë te moduli i transportit.
10. Transporti lidhet me një porosi dhe menaxhohet nga rolet `ADMIN` ose `TRANSPORT`.

Kjo logjikë e bën backend-in jo vetëm ruajtës të të dhënave, por edhe ekzekutues të rregullave të biznesit.

## Teknologjitë e përdorura në backend

- `Java 21`
- `Spring Boot`
- `Spring Web MVC`
- `Spring Security`
- `Spring Data JPA`
- `Hibernate`
- `PostgreSQL`
- `Lombok`
- `JUnit`
- `Mockito`

## Arkitektura e backend-it

Backend-i është ndërtuar me strukturë klasike të ndarë në shtresa:

- `controller`
- `service`
- `repository`
- `entity`
- `dto`
- `config`

### Controllers

Controller-at ekspozojnë endpoint-et REST dhe marrin kërkesat nga frontend-i.

Controller-at kryesorë janë:

- `AuthController`
- `ProductController`
- `OrderController`
- `TransportController`
- `SupplierController`
- `CategoryController`
- `UserController`

### Services

Shtresa `service` përmban logjikën reale të biznesit. Kjo është shtresa ku:

- krijohen porositë
- kontrollohet ekzistenca e transportit për një porosi
- filtrohen porositë që kanë nevojë për transport
- përditësohen çmimet e produkteve
- verifikohen lidhjet me furnitorë dhe kategori

Shembuj kryesorë:

- `ProductService`
- `OrderService`
- `TransportService`
- `UserDetailsServiceImpl`

### Repositories

Repository-t përdoren për qasje në databazë përmes JPA. Ato lehtësojnë leximin, ruajtjen, fshirjen dhe kërkimet mbi entitetet.

Repository-t kryesorë janë:

- `UserRepository`
- `RoleRepository`
- `ProductRepository`
- `SupplierRepository`
- `CategoryRepository`
- `OrderRepository`
- `TransportRepository`
- `StockRepository`

### DTO

DTO-t përdoren për të marrë input nga frontend-i në mënyrë më të kontrolluar dhe më të ndarë nga entitetet e databazës.

DTO-t kryesorë përfshijnë:

- `RegisterRequest`
- `ProductRequest`
- `OrderRequest`
- `OrderItemRequest`
- `TransportRequest`
- `CategoryRequest`
- `SupplierRequest`
- `AssignRoleRequest`

## Siguria dhe autentikimi

### Spring Security

Siguria e aplikacionit konfigurohet në `SecurityConfig.java`.

Karakteristikat kryesore janë:

- `POST /api/auth/register` lejohet pa autentikim
- endpoint-et e tjera kërkojnë autentikim
- përdoret `HTTP Basic Authentication`
- CORS lejohet për `http://localhost:*`
- CSRF është çaktivizuar për shkak të natyrës REST të aplikacionit

### Password encoding

Fjalëkalimet ruhen të koduara me:

- `BCryptPasswordEncoder`

Kjo do të thotë që password-i nuk ruhet si tekst i thjeshtë në databazë.

### Menaxhimi i roleve

Roli i përdoruesit përcakton se cilat endpoint-e mund të përdoren.

Rolet e dukshme në sistem janë:

- `ADMIN`
- `EMPLOYEE`
- `MANAGER`
- `TRANSPORT`

Shembuj kontrolli:

- krijimi i produkteve lejohet vetëm për `ADMIN`
- menaxhimi i përdoruesve dhe roleve lejohet vetëm për `ADMIN`
- moduli i transportit lejohet për `ADMIN` dhe `TRANSPORT`
- leximi i furnitorëve lejohet për `ADMIN` dhe `EMPLOYEE`

Kjo logjikë zbatohet me `@PreAuthorize` në controller-at përkatës.

## Logjika e controller-ave kryesorë

### `AuthController`

Ky controller merret me autentikimin dhe regjistrimin.

Funksionet kryesore:

- regjistron përdorues të rinj
- kontrollon duplikatet e username-it dhe email-it
- krijon rolin `EMPLOYEE` nëse nuk ekziston
- kthen të dhënat e përdoruesit aktual të kyçur

Endpoint-et kryesore:

- `POST /api/auth/register`
- `GET /api/auth/me`

### `ProductController`

Ky controller merret me produktet.

Funksione:

- listimi i të gjitha produkteve
- krijimi i produktit të ri
- përditësimi i çmimit të produktit

Endpoint-et:

- `GET /api/products`
- `POST /api/products`
- `PUT /api/products/{id}/price`

### `OrderController`

Ky controller merret me porositë.

Funksione:

- krijimi i porosive
- listimi i porosive
- pranimi i porosisë

Endpoint-et:

- `POST /api/orders`
- `GET /api/orders`
- `PUT /api/orders/{id}/receive`

### `TransportController`

Ky controller merret me transportin.

Funksione:

- listimi i transporteve
- marrja e një transporti sipas ID-së
- krijimi i transportit
- përditësimi i transportit
- fshirja e transportit
- marrja e porosive që kanë nevojë për transport

Endpoint-et:

- `GET /api/transport`
- `GET /api/transport/{id}`
- `POST /api/transport`
- `PUT /api/transport/{id}`
- `DELETE /api/transport/{id}`
- `GET /api/transport/orders-needing-transport`

### `UserController`

Ky controller merret me administrimin e përdoruesve dhe roleve.

Funksione:

- listimi i të gjithë përdoruesve
- marrja e një përdoruesi sipas ID-së
- caktimi i një roli
- heqja e një roli

Endpoint-et:

- `GET /api/users`
- `GET /api/users/{id}`
- `POST /api/users/assign-role`
- `DELETE /api/users/{userId}/roles/{roleName}`

### `SupplierController` dhe `CategoryController`

Këta controller-a menaxhojnë të dhënat bazë të sistemit:

- furnitorët
- kategoritë

Për to mbështeten operacionet CRUD sipas kufizimeve të roleve.

## Logjika e service-ve kryesore

### `OrderService`

`OrderService` përmban logjikën e krijimit të porosisë.

Kur krijohet një porosi:

- merret përdoruesi i autentikuar nga `SecurityContextHolder`
- verifikohet ekzistenca e furnitorit
- verifikohet ekzistenca e produkteve
- krijohet objekti `Order`
- krijohen `OrderItem` për secilin artikull
- porosia ruhet me status fillestar `CREATED`

Kur porosia pranohet:

- kërkohet sipas ID-së
- statusi ndryshohet në `RECEIVED`

### `ProductService`

`ProductService` kujdeset për:

- krijimin e produktit
- lidhjen me furnitorin dhe kategorinë
- listimin e produkteve
- përditësimin e çmimit

### `TransportService`

Kjo është një pjesë shumë e rëndësishme e backend-it.

Logjika kryesore:

- kontrollon nëse një porosi ka tashmë transport
- krijon transport vetëm për porosi të vlefshme
- përditëson transportin ekzistues
- fshin transportin
- gjen porositë me status `RECEIVED` që nuk kanë ende transport

Kjo është logjika që e lidh modulin e porosive me modulin e transportit.

## Databaza

Backend-i përdor PostgreSQL me këtë konfigurim bazë:

- databaza: `warehouse_db`
- përdoruesi: `postgres`
- `spring.jpa.hibernate.ddl-auto=none`

Kjo do të thotë që skema e databazës nuk gjenerohet automatikisht nga Hibernate, por pritet të ekzistojë paraprakisht.

## Entitetet kryesore të databazës

### `User`

Përfaqëson përdoruesin e sistemit.

Fusha kryesore:

- `id`
- `username`
- `email`
- `password`
- `enabled`

Lidhje:

- many-to-many me `Role` përmes `user_roles`

### `Role`

Përfaqëson rolet e sigurisë në sistem.

Fusha:

- `id`
- `name`

### `Supplier`

Përfaqëson furnitorin.

Fusha:

- `id`
- `name`
- `phone`
- `email`

### `Category`

Përfaqëson kategorinë e produktit.

Fusha:

- `id`
- `name`

### `Product`

Përfaqëson produktin.

Fusha:

- `id`
- `name`
- `unitPrice`
- `supplier`
- `category`

### `Order`

Përfaqëson porosinë.

Fusha:

- `id`
- `orderDate`
- `status`
- `supplier`
- `createdBy`
- `items`

### `OrderItem`

Përfaqëson artikullin e porosisë.

Fusha:

- `id`
- `quantity`
- `price`
- `order`
- `product`

### `Transport`

Përfaqëson transportin e një porosie.

Fusha:

- `id`
- `transportCompany`
- `trackingNumber`
- `deliveryDate`
- `status`
- `order`

Lidhje:

- one-to-one me `Order`

### `Warehouse`

Përfaqëson depo fizike.

Fusha:

- `id`
- `name`
- `location`

### `Stock`

Përfaqëson sasinë e një produkti në një depo të caktuar.

Fusha:

- `id`
- `quantity`
- `minQuantity`
- `product`
- `warehouse`

Ka `unique constraint` mbi:

- `product_id`
- `warehouse_id`

### `StockMovement`

Përfaqëson lëvizjen e stokut.

Fusha:

- `id`
- `quantity`
- `movementType`
- `movementDate`
- `product`
- `user`

## Marrëdhëniet kryesore në databazë

- një `User` mund të ketë shumë `Role`
- një `Role` mund t’i takojë shumë `User`
- një `Supplier` mund të ketë shumë `Product`
- një `Category` mund të ketë shumë `Product`
- një `Supplier` mund të ketë shumë `Order`
- një `User` mund të krijojë shumë `Order`
- një `Order` ka shumë `OrderItem`
- një `Product` mund të shfaqet në shumë `OrderItem`
- një `Order` ka maksimumi një `Transport`
- një `Product` mund të ketë shumë `Stock`
- një `Warehouse` mund të ketë shumë `Stock`
- një `Product` mund të ketë shumë `StockMovement`

## Testimi në backend

Backend-i përfshin teste bazë që mbështesin verifikimin e logjikës së projektit.

Shembull:

- `AuthControllerTest.java`

Ky test verifikon skenarë si:

- regjistrimi i suksesshëm
- username i dubluar
- roli default `EMPLOYEE`

## Ekzekutimi i backend-it

### Kërkesat paraprake

- Java 21
- PostgreSQL
- databaza `warehouse_db`

### Kompilimi

```bash
.\mvnw.cmd compile
```

### Nisja e aplikacionit

```bash
.\mvnw.cmd spring-boot:run
```

### Ekzekutimi i testeve

```bash
.\mvnw.cmd test
```

Backend-i ekzekutohet zakonisht në:

```text
http://localhost:8080
```

## Përmbledhje

Backend-i i DEPO është shtresa kryesore e kontrollit të sistemit. Ai menaxhon autentikimin, rolet, logjikën e porosive, transportin, qasjen në databazë dhe zbatimin e rregullave të biznesit. Falë ndarjes në controller, service, repository, entity dhe DTO, projekti është i organizuar mirë, i kuptueshëm dhe i zgjerueshëm për zhvillime të ardhshme.
