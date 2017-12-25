const express = require('express');
const apiRouter = express.Router();

const employeesRouter = require('./employee.js');
const menusRouter = require('./menus.js');

apiRouter.use('/employees', employeesRouter);
apiRouter.use('/menus', menusRouter);

module.exports = apiRouter;