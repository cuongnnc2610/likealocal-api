## LikeALocal API

## Environment:

- node 10+

## Start Project

- Create .env from .env.example and update content
- Create config/database.js from config/database.example.js and update content
- Delete the existing `package.lock.json`
- Run `npm install`
- Run the migration using the following command:
  `npx sequelize-cli db:migrate`
  `npx sequelize-cli db:seed:all`
  Note: `npx sequelize db:migrate:undo:all`
- Finally run port 8080: `npm start`
