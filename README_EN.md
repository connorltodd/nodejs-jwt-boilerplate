_Fork_ this _boilerplate_ to start the tutorial: [https://github.com/bastienwcs/nodejs-jwt-boilerplate](https://github.com/bastienwcs/nodejs-jwt-boilerplate).

Structure](pictures/1-structure.png)

## 0 - Configuration

### Database

In order to manage the registration and connection of users, create a new database named `jwtcourse` and create the `user` table according to this model:

![Database](pictures/2-database.png)

### Environment variables

In the project, copy the `.env.sample` file to `.env` and modify the environment variables corresponding to the database.

### Installation

Remember to install the project with `npm install` before starting!

## 1 - Creating a user account

Create a POST route `/register` that will allow the creation of a user account.

The route should retrieve a json from the request body with the following structure:

``json
{
"email": "his email",
"password": "its password"
}

```

If neither the email nor the password is filled in, return an error 400 'Please specify both email and password'.

If they are specified, query the database and insert the data into the `user` table.

If an error occurs while executing the SQL query, return an error 500 with the corresponding error message.

If all went well, return a 201 code with a json with the following structure:

json
{
  "id": "its id",
  "email": "his email",
  "password": "hidden"
}
```

> Do not return the password but the string "hidden".

Test it with Postman :

- POST http://localhost:8080/register
- Body / raw / JSON
- In the body of the request a JSON, for example :

``json
{
"email": "test@test.fr",
"password": "tacos"
}

```

Register - Postman](pictures/3-register-postman.png)

### Solution

> Warning: try to do the exercise yourself before looking at the solution!

-
-
-
-
-
-
-
-
-
-
-
-

``js
app.post('/register', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res
      .status(400)
      .json({ errorMessage: 'Please specify both email and password' });
  } else {
    connection.query(
      INSERT INTO user(email, password) VALUES (?, ?)`,
      [email, password],
      (error, result) => {
        if (error) {
          res.status(500).json({ errorMessage: error.message });
        } else {
          res.status(201).json({
            id: result.insertId,
            email,
            password: 'hidden',
          });
        }
      }
    );
  }
});
```

## 2 - Hashing the password

It is very dangerous to leave the user's password _in clear_ in a database.

Look at the following link to see how to _hash_ the password with the _bcrypt_ library: [https://www.abeautifulsite.net/hashing-passwords-with-nodejs-and-bcrypt](https://www.abeautifulsite.net/hashing-passwords-with-nodejs-and-bcrypt).

Install the [bcrypt](https://www.npmjs.com/package/bcrypt) module in your project.

Then modify your `/register` route to encrypt the password synchronously, **before** it is stored in the database.

Check that the password is encrypted in the database.

> Remember to import the module at the top of your file!

### Solution

> Warning: try to do the exercise yourself before looking at the solution!

-
-
-
-
-
-
-
-
-
-
-
-

```js
app.post('/register', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res
      .status(400)
      .json({ errorMessage: 'Please specify both email and password' });
  } else {
    const hash = bcrypt.hashSync(password, 10);
    connection.query(
      `INSERT INTO user(email, password) VALUES (?, ?)`,
      [email, hash],
      (error, result) => {
        if (error) {
          res.status(500).json({ errorMessage: error.message });
        } else {
          res.status(201).json({
            id: result.insertId,
            email,
            password: 'hidden',
          });
        }
      }
    );
  }
});
```

Translated with www.DeepL.com/Translator (free version)

```

## 3 - User account login

Create a POST route `/login` that will allow the connection of a user account.

The route must retrieve a json from the request body with the following structure:

``json
{
"email": "his email",
"password": "its password"
}

```

If neither the email nor the password is filled in, return a 400 error 'Please specify both email and password'.

If they are specified, make a request to the database and check that the email exists (**test the email only, not the password!)**).

If an error occurs during the execution of the SQL query, return an error 500 with the corresponding error message.

If the result returned is empty, return a 403 'Invalid email' error.

If the result is not empty, you will now check the password using the `compareSync` method of the _bcrypt_ module. You can find an example of its use here: [https://www.abeautifulsite.net/hashing-passwords-with-nodejs-and-bcrypt](https://www.abeautifulsite.net/hashing-passwords-with-nodejs-and-bcrypt).

> Be careful, you have to put the _clear_ password as the first argument and the database password as the second

If all the password is the same, return a 200 code with a json with the following structure:

json
{
"id": "its id",
"email": "his email",
"password": "hidden"
}

```

Otherwise returns a 403 error with the message 'Invalid password'.

Test this with Postman :

- POST http://localhost:8080/login
- Body / raw / JSON
- In the body of the request a JSON, for example :

``json
{
"email": "test@test.fr",
"password": "tacos"
}

```

Login - Postman](pictures/4-login-postman.png)

### Solution

> Warning: try to do the exercise yourself before looking at the solution!

-
-
-
-
-
-
-
-
-
-
-
-

```js
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res
      .status(400)
      .json({ errorMessage: 'Please specify both email and password' });
  } else {
    connection.query(
      `SELECT * FROM user WHERE email=?`,
      [email],
      (error, result) => {
        if (error) {
          res.status(500).json({ errorMessage: error.message });
        } else if (result.length === 0) {
          res.status(403).json({ errorMessage: 'Invalid email' });
        } else if (bcrypt.compareSync(password, result[0].password)) {
          // Passwords match
          const user = {
            id: result[0].id,
            email,
            password: 'hidden',
          };
          res.status(200).json(user);
        } else {
          // Passwords don't match
          res.status(403).json({ errorMessage: 'Invalid password' });
        }
      }
    );
  }
});
```

## 4 - Creating a JSON Web Token

You are finally getting to the heart of the matter: generating the JWT using a secret key.

Start by filling in a secret key in the `.env` file. You can generate a secure key here: [https://www.grc.com/passwords.htm](https://www.grc.com/passwords.htm).

Next, you will use the [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) module to perform the key generation:

- install the module
- module, use the `sign` method to generate a JWT, using the secret key from the environment variables.
- The _payload_ of the key will be the following json: `json { id: user.id } `
- the expiry date `expiresIn` will be 5 minutes.

Generate the key just before returning user in the `/login` route and make the structure of the JSON as follows:

``json
{
"user": {
"id": "his id",
"email": "his email",
"password": "hidden"
},
"token": "the generated token"
}

```

![Login with token - Postman](pictures/5-token-postman.png)

### Solution

> Warning: try to do the exercise yourself before looking at the solution!

-
-
-
-
-
-
-
-
-
-
-
-

``js
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res
      .status(400)
      .json({ errorMessage: 'Please specify both email and password' });
  } else {
    connection.query(
      SELECT * FROM user WHERE email=?`,
      [email],
      (error, result) => {
        if (error) {
          res.status(500).json({ errorMessage: error.message });
        } else if (result.length === 0) {
          res.status(403).json({ errorMessage: 'Invalid email' });
        } else if (bcrypt.compareSync(password, result[0].password)) {
          // Passwords match
          const user = {
            id: result[0].id,
            email,
            password: 'hidden',
          };
          const token = jwt.sign({ id: user.id }, JWT_AUTH_SECRET, {
            expiresIn: 300,
          });
          res.status(200).json({ user, token });
        } else {
          // Passwords don't match
          res.status(403).json({ errorMessage: 'Invalid password' });
        }
      }
    );
  }
});
```

## 5 - Displaying the list of users

Create a GET `/users` route that retrieves the list of users.

If an error occurs during the execution of the SQL query, return an error 500 with the corresponding error message.

If all went well, return a 200 code with a json with the following structure:

``json
[
{
"id": 1,
"email": "test@test.fr",
"password": "hidden"
},
{
"id": 2,
"email": "tacos@test.fr",
"password": "hidden"
}
]

```

> Remember to hide the password for each user!

### Solution

> Warning: try to do the exercise yourself before looking at the solution!

-
-
-
-
-
-
-
-
-
-
-
-

``js
app.get('/users', (req, res) => {
  connection.query(`SELECT * FROM user`, (error, result) => {
    if (error) {
      res.status(500).json({ errorMessage: error.message });
    } else {
      res.status(200).json(
        result.map((user) => {
          return { ...user, password: 'hidden' };
        })
      );
    }
  });
});
```

## 6 - Creating an authentication middleware

In order to protect the `/users` route so that only authenticated users can access it, you'll create a _middleware_ that will retrieve the request header and check it for a _token_.

For this part, the _middleware_ is provided and is added **before** the `/users` route:

```js
const authenticateWithJsonWebToken = (req, res, next) => {
  if (req.headers.authorization !== undefined) {
    const token = req.headers.authorization.split(' ')[1];
    jwt.verify(token, JWT_AUTH_SECRET, (err) => {
      if (err) {
        res
          .status(401)
          .json({ errorMessage: "you're not allowed to access these data" });
      } else {
        next();
      }
    });
  } else {
    res
      .status(401)
      .json({ errorMessage: "you're not allowed to access these data" });
  }
};
```

You'll need to modify the user route to load this _middleware_, then test the route with Postman by filling in the following header: `Authorization: Bearer eyJhbG.. ...8RvKts`

Of course, you'll need to replace the _token_ with the one retrieved from the user login in step 4.

Login with token - Postman](pictures/6-bearer-postman.png)

### Solution

> Warning: try to do the exercise yourself before looking at the solution!

-
-
-
-
-
-
-
-
-
-
-
-

```js
// Token middleware
const authenticateWithJsonWebToken = (req, res, next) => {
  if (req.headers.authorization !== undefined) {
    const token = req.headers.authorization.split(' ')[1];
    jwt.verify(token, JWT_AUTH_SECRET, (err) => {
      if (err) {
        res
          .status(401)
          .json({ errorMessage: "you're not allowed to access these data" });
      } else {
        next();
      }
    });
  } else {
    res
      .status(401)
      .json({ errorMessage: "you're not allowed to access these data" });
  }
};

// Authenticated route
app.get('/users', authenticateWithJsonWebToken, (req, res) => {
  connection.query(`SELECT * FROM user`, (error, result) => {
    if (error) {
      res.status(500).json({ errorMessage: error.message });
    } else {
      res.status(200).json(
        result.map((user) => {
          return { ...user, password: 'hidden' };
        })
      );
    }
  });
});
```
