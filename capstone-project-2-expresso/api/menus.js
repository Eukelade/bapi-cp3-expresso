const express = require('express')
const menusRouter = express.Router({mergeParams: true});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const menuItemRouter = require('./menuItem.js');

menusRouter.param('id', (req, res, next, menuId) => {
    const sql = 'SELECT * FROM Menu WHERE Menu.id = $menuId';
    const values = {$menuId: menuId};

    db.get(sql, values, (error, menu) => {
        if(error){
            next(error);
        }
        else if(menu){
            next();
        }
        else{
            res.sendStatus(404);
        }
    });
});

menusRouter.use('/:menuId/menu-items', menuItemRouter);

menusRouter.get('/', (req, res, next) => {
    const sql = 'SELECT * FROM Menu'

    db.all(sql, (error,menus) => {
        if(error){
            next(error);
        }
        else {
            res.status(200).json({menus: menus});
        }
    });
});

menusRouter.get('/:id', (req, res, next) => {
    //const text = req.body.menus.text;
    const sql = 'SELECT * FROM Menu WHERE Menu.id = $menuId';
    const values = {$menuId: req.params.id};
    
    db.get(sql, values, (error, menu) => {
        if(error){
            next(error);
        }
        else {
            res.status(200).json({menu: menu});
        }
    });
})

menusRouter.post('/', (req, res, next) => {
    const title = req.body.menu.title;
    if(!title){
        return res.sendStatus(400);
    }
    else {
        const sql = 'INSERT INTO Menu (title) VALUES ($title)';
        const values = {$title: title};

        db.run(sql, values, function (error) {
            if(error){
                next(error);
            }
            else {
                db.get(`SELECT * FROM Menu WHERE Menu.id = ${this.lastID}`, (error, menu) => {
                    if(error){
                        next(error);
                    }
                    else {
                        res.status(201).json({menu: menu});
                    }
                });
            }
        });
    }
    
});

menusRouter.put('/:id', (req, res, next) => {
    const title = req.body.menu.title;
    if(!title){
        return res.sendStatus(400);
    }
    else {
        const sql = 'UPDATE Menu SET title = $title WHERE Menu.id = $menuId';
        const values = {$menuId: req.params.id, $title: title};

        db.run(sql, values, (error) => {
            if(error){
                next(error);
            }
            else{
                db.get(`SELECT * FROM Menu WHERE Menu.id = ${req.params.id}`,
                    (error, menu) => {
                        res.status(200).json({menu: menu});
                    });
            }
        });
    }
});

menusRouter.delete('/:id', (req, res, next) => {
    const checkSql = 'SELECT * FROM MenuItem WHERE MenuItem.menu_id = $menuId';
    const checkValues = {$menuId: req.params.menuId};

    db.get(checkSql, checkValues, (error, menuItem) => {
        if(error){
            next(error);
        }
        else if(menuItem){
            res.sendStatus(400);
        }
        else {
            const deleteSql = 'DELETE FROM Menu WHERE Menu.id = $menuId';
            const deleteValues = {$menuId: req.params.id};
            db.run(deleteSql, deleteValues, (error) => {
                if(error){
                    next(error);
                } else{
                res.sendStatus(204);
                }
            });
        }
    });    
});

module.exports = menusRouter;