## Spis treści

1. [NestJS](#1-nestjs)
   - [Co to jest?](#co-to-jest)
   - [Dependency injection](#dependency-injection)
   - [Module - Controller - Provider](#module---controller---provider)
   - [CLI](#cli)
2. [Testy automatyczne](#2-testy-automatyczne)
   - [Czym są?](#czym-są)
   - [Rodzaje testów](#rodzaje-testów)

## 1. NestJS

### Co to jest?

Obecnie najbardziej popularny framework dla Node.js. Inspirowany Angularem.

### Dependency injection

Wstrzykiwanie zależności (DI) to wzorzec projektowy używany do implementacji IoC (Inversion of Control - odwrócenie sterwoania). Umożliwia tworzenie obiektów zależnych poza klasą i udostępnianie tych obiektów klasie na różne sposoby. Używając DI, przenosimy tworzenie i wiązanie obiektów zależnych poza klasę, która od nich zależy.

[źródło](https://www.tutorialsteacher.com/ioc/dependency-injection)

Na przykład wstrzykujemy service do controllera, repository do service idt. Ułatwia nam to mockowanie zależności w testach.

### Module - Controller - Provider

Moduł to klasa grupująca kontrolery i providery. Nie jest jednak obiektem abstrakcyjnym, nastawionym jednie na wrapowanie. Pozwala definiować zależności z innymi modułami (przez importy i eksporty) oraz nakładać globalne właściwości na obiekty które zawiera.

Kontrolery to klasy odpowiedzialne za zapytania i odpowiedzi naszego API. Najprościej mówiąc to dzięki nim mamy dostęp do danych pod adresem URL.

Providery to ogólna nazwa dla pomocniczych klas. Logika/dostęp do danych/generowanie obiektów itd. nie powinna być kodowana w kontrolerze, a w osobnych klasach, gdyż może być tak, że będziemy chcieli z niej korzystać w innym kontrolerze, a kod powinien być reużywalny (w granicach rozsądku).

[źródło](https://solutionchaser.com/back-end-w-node-js-z-nest-js1-rest-api/)

Najczęściej spotykane rodzaje providerów - service (logika biznesowa), repository (źródło danych)

### CLI

CLI - Command Line Interface

NestJS oferuje nam narzędzie dostępne z poziomu terminala. Możemy dzięki niemu m.in. stworzyć nową aplikację, moduł, kontroler, service, cały zasób (module, controller, service) na raz i wiele innych.

```bash
nest -h
```

Spróbujmy i zobaczmy co się stanie:

```bash
nest g res book
```

## 2. Testy automatyczne

### Czym są?

Testy, które automatyzujemy pisząc kod sprawdzający jak nasza aplikacja (bądź poszczególne jej części) działa.

### Rodzaje testów

1. `Jednostkowe` - testowane są pojedyncze funkcje, zazwyczaj jest ich najwięcej

2. `Integracyjne` - testowane jest jak komponenty ze sobą współpracują

3. `E2E` - testy End to End - od końca, do końca - można połączyć z testami UI (np Cypress), można testować samo API (supertest). Wysyłamy konkretne zapytanie do serwera i oczekujemy konkretnej odpowiedzi.
