# Benutzerauthentifizierung mit Datenpersistenz
Aufbauend auf die Aufgabe "Express Grundlagen 5: Benutzerauthentifizierung" erweitert bitte die Anwendung um eine Persitenzschicht (MongoDB) und eine Registerroute

Funktionen:
- Register Route zum anlegen und speichern von Userinformationen in einer MongoDB (Username, Email, Password)
- Login Route zur Authentifizierung von Usern mit Benutzername/Email und Passwort
- Logout Route und den User zu De-Authentifizieren
Hinweise:
- Nutze das mongoose Package um ein Datenmodel für den User zu erstellen
- Nutze bcrypt um die Passwörter verschlüsselt in der DB zu speichern
- Nutze brypt compare für Benutzername und Passwort-Überprüfung.
- Nutze Postman für die Tests für die Authentifizierung und Registrierung
- Exportiere die Postmann Collection und pushe sie in das Repo
- Ein User gilt nur dann als erfolgreich authentifiziert, wenn entweder ein Session Cookie übergeben wird oder ein Token

1. MongoDB und Mongoose einrichten
Wir installieren die Pakete mit `npm install mongoose bcrypt`. Danach erstellen wir ein User-Modell und richten Mongoose ein.
```
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  }
});

UserSchema.pre('save', async function (next) {
  if (this.isModified('password') || this.isNew) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

UserSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', UserSchema);
```
Hier haben wir das folgende hinzugefügt:
- Wir haben das Mongoose-Paket importiert
- Wir haben das Benutzermodell erstellt. D.h. wir haben ein Schema für den Benutzer erstellt, das Benutzername, E-Mail-Adresse und Passwort enthält. 
- Wir haben die Benutzerdaten validiert. D.h. Benutzername und E-Mail-Adresse sind erforderlich und eindeutig. Das Passwort ist ebenfalls erforderlich. 
- Wir haben das Passwort verschlüsselt. D.h. wir haben ein Pre-Hook hinzugefügt, um das Passwort zu verschlüsseln, bevor es in der Datenbank gespeichert wird. 
- Wir haben die Passwortüberprüfung hinzugefügt. D.h. wir haben eine Methode hinzugefügt, um das Passwort zu überprüfen. 

2. Register-Router einrichten
Wir updaten die `auth.js` Datei und fügen die Register-Route hinzu.
```
const User = require('../models/User');

// Register-Route
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).send('Username or email already exists');
    }
    const user = new User({ username, email, password });
    await user.save();
    res.status(201).send('User registered successfully');
  } catch (error) {
    res.status(500).send('Server error');
  }
});,
...
```
Hier haben wir die Register-Route hinzugefügt. Dazu haben wir folgendes gemacht:
- Wir haben die User-Model-Datei importiert
- Wir haben die Route `/register` hinzugefügt
- Wir haben die Daten aus dem Request Body extrahiert
- Wir haben geprüft, ob ein User mit demselben Benutzernamen oder derselben E-Mail-Adresse bereits existiert
- Wir haben einen neuen User erstellt und in der Datenbank gespeichert
- Wir haben die entsprechenden Statuscodes zurückgegeben
Aber jetzt müssen wir darauf achten, dass wir für den Login username oder email akzeptieren. D.h. wir passen die Login-Route entsprechend an:
```
router.post('/login', async (req, res) => {
  console.log('Request Body:', req.body);
  const { usernameOrEmail, password } = req.body;
  try {
    const user = await User.findOne({ $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }] });
    if (!user) {
      console.log('Invalid credentials:', usernameOrEmail, password); 
      return res.status(401).send('Invalid credentials');
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Invalid credentials:', usernameOrEmail, password); 
      return res.status(401).send('Invalid credentials');
    }
    req.session.user = user._id;
    console.log('Session after login:', req.session); 
    return res.send('Login successful');
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).send('Server error');
  }
});
```
Hier haben wir das folgende hinzugefügt:
- Wir haben die Route `/login` hinzugefügt
- Wir haben die Daten aus dem Request Body extrahiert
- Wir haben geprüft, ob ein User mit demselben Benutzernamen oder derselben E-Mail-Adresse bereits existiert
- Wir haben das Passwort überprüft
- Wir haben die Session mit der Benutzer-ID initialisiert
- Wir haben die entsprechenden Statuscodes zurückgegeben
3. App.js anpassen und MongoDB einrichten
Wir passen die `app.js` Datei an und richten die MongoDB ein.
```
const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));

// Session Middleware
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
}));

// MongoDB Verbindung
mongoose.connect('mongodb://localhost:27017/benutzerauth');

// Routes
app.use('/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('Welcome to the home page');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

```
Hier haben wir lediglich die MongoDB-Verbindung mit `mongoose.connect('mongodb://localhost:27017/benutzerauth');` hinzugefügt. Dazu muss die MongoDB-Instanz laufen.
4. Postman Tests
Wir erstellen eine Postman Collection und fügen die folgenden Tests hinzu:
- Register User
POST http://localhost:3000/auth/register mit Body (x-www-form-urlencoded): username, email, password
- Login User
POST http://localhost:3000/auth/login mit Body (x-www-form-urlencoded): usernameOrEmail, password
- Logout User
POST http://localhost:3000/auth/logout (Achtung: Postman speichert automatisch Session-Cookies.. d.h. wir melden den aktuellen User wieder ab)
- Protected Route
GET http://localhost:3000/auth/protected (Achtung: Wir sind nach dieser Reihenfolge nicht mehr angemeldet, sondern müssen uns erneut anmelden)
5. Postman Collection exportieren
Wir exportieren die Postman Collection und pushen sie in das Repo.
