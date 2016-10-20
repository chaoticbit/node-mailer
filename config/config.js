var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'development';

var config = {
  development: {
    root: rootPath,
    app: {
      name: 'mailer'
    },
    port: 3000,
    db: 'mongodb://localhost/mailer',
    poolConfig: {
        pool: true,
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // use SSL
        auth: {
            user: 'dandekar.atharva@gmail.com',
            pass: '*******'
        }
    },
    logPath: 'mail.log'
  },

  test: {
    root: rootPath,
    app: {
      name: 'mailer'
    },
    port: 3000,
    db: 'mongodb://localhost/',
    poolConfig: {
        pool: true,
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // use SSL
        auth: {
            user: 'user@gmail.com',
            pass: 'pass'
        }
    }
  },

  production: {
    root: rootPath,
    app: {
      name: 'mailer'
    },
    port: 3000,
    db: 'mongodb://localhost/',
    poolConfig: {
        pool: true,
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // use SSL
        auth: {
            user: 'user@gmail.com',
            pass: 'pass'
        }
    }
  }
};

module.exports = config[env];
