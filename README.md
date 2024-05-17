# Benutzerauthentifizierung
Entwickle eine einfache Authentifizierungsroutine mit Express.js, die Benutzern das Einloggen ermöglicht.

#### Funktionen:
- Login-/Logout-Routen und Authentifizierungslogik.
- Speicherung von Benutzerinformationen im Speicher.
#### Hinweise:
- Nutze Middleware wie `express-session` für das Session-Management.
- Implementiere eine einfache Logik für Benutzername und Passwort-Überprüfung.
- Schreibe automatisierte Tests für die Authenzifizierung
- Erstelle eine Pipeline, die die Dependencies installiert, die Anwendung startet und testet.

1. Erstelle ein neues Express.js-Projekt mit `npm init -y`.
2. Installiere die benötigten Dependencies mit `npm install express express-session jest supertest -D`.
3. Wir erstellen uns eine Struktur für unser Projekt:
```
benutzerauth/
    |- routes/
    |  |- auth.js
    |- app.js
    |- test/
    |  |- auth.test.js
    |- package.json
    |- .gitignore
```
4. Erstellen der app.js:
Imports und Initialisierung:
```
const express = require('express');
const session = require('express-session');
const authRoutes = require('./routes/auth');
```
Wir brauchen also `express` für die Server-Logik, `express-session` für das Session-Management und `authRoutes` für die Routen. Als nächstes initialisieren wir die Express-Anwendung
```
const app = express();
```
Danach nutzen wir die Middleware `express-session`:
```
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
}));
```
session(...): Diese Middleware wird verwendet, um Sitzungsverwaltung zu ermöglichen.

- secret: Ein geheimer Schlüssel, der zur Signierung der Sitzungscookies verwendet wird. Dieser sollte sicher und geheim gehalten werden.
- resave: Wenn auf false gesetzt, wird die Sitzung nicht bei jeder Anfrage gespeichert, auch wenn sie nicht verändert wurde.
- saveUninitialized: Wenn auf true gesetzt, wird eine Sitzung gespeichert, auch wenn sie noch nicht initialisiert wurde (keine Daten gespeichert).
Wir nutzen außerdem `express.urlencoded()` um die Anfrageparameter zu parsen:
```
app.use(express.urlencoded({ extended: true }));
```
Als nächstes binden wir die Routen ein:
```
app.use('/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('Welcome to the home page');
});
```
- `app.use('/auth', authRoutes)`: Diese Zeile integriert die Authentifizierungsrouten in die Anwendung. Alle Routen, die in ./routes/auth definiert sind, sind nun unter dem Pfad /auth verfügbar.Beispiel: Eine Route /login in authRoutes ist nun unter /auth/login verfügbar.
- `app.get('/', (req, res) => { res.send('Welcome to the home page'); })`: Diese Zeile definiert eine Route für die Startseite. Wenn ein Benutzer eine GET-Anfrage an die Root-URL (/) sendet, wird die Nachricht "Welcome to the home page" zurückgegeben.
Den Server starten wir mit:
```
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
```
5. Erstellen der auth.js:
Imports und Initialisierung:
```
const express = require('express');
const router = express.Router();
```
Wir brauchen also `express` für die Server-Logik und `router` für die Routen, d.h. es wird ein Router-Objekt von Express erstellt, um die Routen zu definieren. Als nächstes erstellen wir uns Beispiel-Benutzerdaten:
```
const users = { 
  user1: 'password1',
  user2: 'password2',
};
```
Hier ist ein Objekt `users` definiert, das Benutzernamen und Passwörter enthält. Als nächstes definieren wir die Login-Routen:
```
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (users[username] && users[username] === password) {
    req.session.user = username;
    return res.send('Login successful');
  }
  return res.status(401).send('Invalid credentials');
});
```
- `router.post('/login', (req, res) => { ... })`: Diese Zeile definiert eine POST-Route für den Pfad /login. Wenn ein Benutzer eine POST-Anfrage an /auth/login sendet, wird die Funktion ausgeführt, die Benutzername und Passwort überprüft.
- `const { username, password } = req.body;`: Diese Zeile extrahiert Benutzername und Passwort aus dem Anfragekörper.
- `if (users[username] && users[username] === password) { ... }`: Diese Zeile überprüft, ob der Benutzername im Objekt users vorhanden ist und ob das eingegebene Passwort mit dem gespeicherten Passwort übereinstimmt. Wenn ja, wird der Benutzer in der Sitzung gespeichert und eine Erfolgsmeldung zurückgegeben.
- `req.session.user = username;`: Diese Zeile speichert den Benutzernamen in der Sitzung.
- `return res.send('Login successful');`: Diese Zeile gibt eine Erfolgsmeldung zurück, wenn die Anmeldeinformationen korrekt sind.
- `return res.status(401).send('Invalid credentials');`: Diese Zeile gibt einen Fehlercode 401 zurück, wenn die Anmeldeinformationen ungültig sind.
Als nächstes definieren wir die Logout-Routen:
```
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).send('Logout failed');
    }
    res.send('Logout successful');
  });
});
```
- `router.post('/logout', (req, res) => { ... })`: Diese Zeile definiert eine POST-Route für den Pfad /logout. Wenn ein Benutzer eine POST-Anfrage an /auth/logout sendet, wird die Funktion ausgeführt, die die Sitzung zerstört.
- `req.session.destroy(err => { ... })`: Diese Zeile zerstört die Sitzung des Benutzers. Wenn ein Fehler auftritt, wird eine Fehlermeldung zurückgegeben.
- `res.send('Logout successful');`: Diese Zeile gibt eine Erfolgsmeldung zurück, wenn der Benutzer erfolgreich ausgeloggt ist.
Wir schreiben uns dazu auch mal eine geschützte Route, die ein User nur erreichen kann, wenn er eingeloggt ist bzw. eine gültige Session hat:
```
router.get('/protected', (req, res) => {
  if (req.session.user) {
    return res.send(`Hello ${req.session.user}, you are authenticated`);
  }
  res.status(401).send('You need to log in first');
});
```
- `router.get('/protected', (req, res) => { ... })`: Diese Zeile definiert eine GET-Route für den Pfad /protected. Wenn ein Benutzer eine GET-Anfrage an /auth/protected sendet, wird die Funktion ausgeführt, die überprüft, ob der Benutzer authentifiziert ist.
- `if (req.session.user) { ... }`: Diese Zeile überprüft, ob der Benutzer in der Sitzung authentifiziert ist.
- `return res.send(`Hello ${req.session.user}, you are authenticated`);`: Diese Zeile gibt eine Begrüßungsnachricht zurück, wenn der Benutzer authentifiziert ist.
- `res.status(401).send('You need to log in first');`: Diese Zeile gibt einen Fehlercode 401 zurück, wenn der Benutzer nicht authentifiziert ist.
6. Erstellen der auth.test.js:
Imports und Initialisierung:
```
const request = require('supertest');
const express = require('express');
const session = require('express-session');
const authRoutes = require('../routes/auth');
```
Wir brauchen also `supertest` für die Tests, `express` für die Server-Logik, `express-session` für das Session-Management und `authRoutes` für die Routen. Als nächstes initialisieren wir die Express-Anwendung und den Testserver:
```
const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(session({
  secret: 'test_secret_key',
  resave: false,
  saveUninitialized: true,
}));
app.use('/auth', authRoutes);
```
- app: Eine neue Express-Anwendung wird erstellt.
Middleware:
- `app.use(express.urlencoded({ extended: false }))`: Middleware zum Parsen von URL-kodierten Daten (application/x-www-form-urlencoded), die in POST-Anfragen gesendet werden.
- `app.use(session(...))`: Middleware zur Sitzungsverwaltung, konfiguriert mit einem geheimen Schlüssel (secret), der zur Signierung der Sitzungscookies verwendet wird. resave: false bedeutet, dass die Sitzung nur gespeichert wird, wenn sie verändert wurde. - - saveUninitialized: true bedeutet, dass eine Sitzung gespeichert wird, auch wenn sie noch nicht initialisiert wurde.
- Routen: Die Authentifizierungsrouten werden unter dem Pfad /auth hinzugefügt.
##### Login mit gültigen Anmeldeinformationen:
```
it('should login successfully with valid credentials', async () => {
  const response = await request(app)
    .post('/auth/login')
    .send({ username: 'user1', password: 'password1' });

  expect(response.status).toBe(200);
  expect(response.text).toBe('Login successful');
});
```
- `it('should login successfully with valid credentials', async () => { ... })`: Diese Zeile definiert einen Testfall, der überprüft, ob ein Benutzer erfolgreich mit gültigen Anmeldeinformationen angemeldet werden kann.
- `const response = await request(app) ...`: Diese Zeile sendet eine POST-Anfrage an /auth/login mit Benutzername und Passwort.
- `expect(response.status).toBe(200);`: Diese Zeile überprüft, ob der Statuscode der Antwort 200 (OK) ist.
- `expect(response.text).toBe('Login successful');`: Diese Zeile überprüft, ob die Antworttext "Login successful" ist.
##### Login mit ungültigen Anmeldeinformationen:
```
it('should fail login with invalid credentials', async () => {
  const response = await request(app)
    .post('/auth/login')
    .send({ username: 'user1', password: 'wrongpassword' });

  expect(response.status).toBe(401);
  expect(response.text).toBe('Invalid credentials');
});
```
- `it('should fail login with invalid credentials', async () => { ... })`: Diese Zeile definiert einen Testfall, der überprüft, ob ein Benutzer mit ungültigen Anmeldeinformationen nicht angemeldet werden kann.
- `const response = await request(app) ...`: Diese Zeile sendet eine POST-Anfrage an /auth/login mit Benutzername und falschem Passwort.
- `expect(response.status).toBe(401);`: Diese Zeile überprüft, ob der Statuscode der Antwort 401 (Unauthorized) ist.
- `expect(response.text).toBe('Invalid credentials');`: Diese Zeile überprüft, ob die Antworttext "Invalid credentials" ist.
##### Geschützte Route mit gültiger Sitzung:
```
it('should access protected route after login', async () => {
  const agent = request.agent(app);
  await agent
    .post('/auth/login')
    .send({ username: 'user1', password: 'password1' });

  const response = await agent.get('/auth/protected');
  expect(response.status).toBe(200);
  expect(response.text).toBe('Hello user1, you are authenticated');
});
```
- `it('should access protected route after login', async () => { ... })`: Diese Zeile definiert einen Testfall, der überprüft, ob ein Benutzer auf die geschützte Route zugreifen kann, nachdem er sich angemeldet hat.
- `const agent = request.agent(app);`: Diese Zeile erstellt einen Agenten, der Cookies speichert und sie bei nachfolgenden Anfragen automatisch sendet.
- `await agent ...`: Diese Zeile sendet eine POST-Anfrage an /auth/login mit gültigen Anmeldeinformationen.
- `const response = await agent.get('/auth/protected');`: Diese Zeile sendet eine GET-Anfrage an /auth/protected, um auf die geschützte Route zuzugreifen.
- `expect(response.status).toBe(200);`: Diese Zeile überprüft, ob der Statuscode der Antwort 200 (OK) ist.
- `expect(response.text).toBe('Hello user1, you are authenticated');`: Diese Zeile überprüft, ob die Antworttext "Hello user1, you are authenticated" ist.
##### Geschützte Route ohne gültige Sitzung:
```
it('should not access protected route without login', async () => {
  const response = await request(app).get('/auth/protected');
  expect(response.status).toBe(401);
  expect(response.text).toBe('You need to log in first');
});
```
- `it('should not access protected route without login', async () => { ... })`: Diese Zeile definiert einen Testfall, der überprüft, ob ein Benutzer ohne gültige Sitzung nicht auf die geschützte Route zugreifen kann.
- `const response = await request(app).get('/auth/protected');`: Diese Zeile sendet eine GET-Anfrage an /auth/protected, um auf die geschützte Route zuzugreifen.
- `expect(response.status).toBe(401);`: Diese Zeile überprüft, ob der Statuscode der Antwort 401 (Unauthorized) ist.
- `expect(response.text).toBe('You need to log in first');`: Diese Zeile überprüft, ob die Antworttext "You need to log in first" ist.
##### Logout:
```
it('should logout successfully', async () => {
  const agent = request.agent(app);
  await agent
    .post('/auth/login')
    .send({ username: 'user1', password: 'password1' });

  const response = await agent.post('/auth/logout');
  expect(response.status).toBe(200);
  expect(response.text).toBe('Logout successful');
});
```
- `it('should logout successfully', async () => { ... })`: Diese Zeile definiert einen Testfall, der überprüft, ob ein Benutzer erfolgreich ausgeloggt werden kann.
- `const agent = request.agent(app);`: Diese Zeile erstellt einen Agenten, der Cookies speichert und sie bei nachfolgenden Anfragen automatisch sendet.
- `await agent ...`: Diese Zeile sendet eine POST-Anfrage an /auth/login mit gültigen Anmeldeinformationen.
- `const response = await agent.post('/auth/logout');`: Diese Zeile sendet eine POST-Anfrage an /auth/logout, um sich auszuloggen.
- `expect(response.status).toBe(200);`: Diese Zeile überprüft, ob der Statuscode der Antwort 200 (OK) ist.
- `expect(response.text).toBe('Logout successful');`: Diese Zeile überprüft, ob die Antworttext "Logout successful" ist.
7. Erstellen der Pipeline:
```
name: Benutzerauthentifizierung Pipeline

on: [push]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4

    - name: Install dependencies
      run: npm install

    - name: Run tests
      run: npm test
```







