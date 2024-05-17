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
