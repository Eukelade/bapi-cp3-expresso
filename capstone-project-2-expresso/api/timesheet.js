const express = require('express')
const timesheetRouter = express.Router({mergeParams: true});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

timesheetRouter.param('timesheetId', (req, res, next, timesheetId) => {
    //console.log(req.body); console.log(req.params);
    //const sql = 'SELECT * FROM Timesheet WHERE Timesheet.employee_id = $employeeId AND Timesheet.id = $timesheetId';
    //const values = {$employeeId: req.params.employeeId, $timesheetId: timesheetId};

    const sql = 'SELECT * FROM Timesheet WHERE Timesheet.id = $timesheetId';
    const values = {$timesheetId: timesheetId};
    db.get(sql, values, (error, employee) => {
        if(error){
            next(error);
        } else if(employee){
            //console.log('param -> employee');
            next();
        } else {
           //console.log('param -> else');
            res.sendStatus(404);
        }
    });
});

timesheetRouter.get('/', (req, res, next) => {
    const sql = 'SELECT * FROM Timesheet WHERE Timesheet.employee_id = $employeeId';
    const values = { $employeeId: req.params.employeeId};
    db.all(sql, values, (error, timesheets) => {
        if(error){
            next(error);
        }
        else {
            res.status(200).json({timesheets: timesheets});
        }
    });
});

timesheetRouter.post('/', (req, res, next) => {
    const hours = req.body.timesheet.hours,
        rate = req.body.timesheet.rate,
        date = req.body.timesheet.date;
    if(!hours || !rate || !date){
        return res.sendStatus(400);
    }
    else {
        const sql = 'INSERT INTO Timesheet (hours, rate, date, employee_id) VALUES ($hours, $rate, $date, $employeeId)';
        const values = {
            $hours: hours,
            $rate: rate,
            $date: date,
            $employeeId: req.params.employeeId
        };

        db.run(sql, values, function (error){
            if(error){
                next(error);
            }
            else {
                db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${this.lastID}`, 
                (error, timesheet) => {
                    res.status(201).json({timesheet: timesheet});
                });
            }
        });
    }
});

timesheetRouter.put('/:timesheetId', (req, res, next) => {
   // console.log(req.body);
   // console.log(req.params);
    const hours = req.body.timesheet.hours,
        rate = req.body.timesheet.rate,
        date = req.body.timesheet.date,
        employeeId = req.params.employeeId;
    if(!hours || !rate || !date){
        return res.sendStatus(400);
    }

    const sql = 'UPDATE Timesheet SET hours = $hours, rate = $rate, date = $date, ' + 
                'employee_id = $employeeId WHERE Timesheet.id = $timesheetId';
    const values = {
        $timesheetId: req.params.timesheetId,
        $hours: hours,
        $rate: rate,
        $date: date,
        $employeeId: employeeId
    };
    
    db.run(sql, values, function(error) {
        if(error){
            next(error);
        }
        else {
            db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${req.params.timesheetId}`,
                (error, timesheet) => {
                    res.status(200).json({timesheet: timesheet});
                });
        }
    });

});

timesheetRouter.delete('/:timesheetId', (req, res, next) => {
    //console.log('entered delete section of timesheetId endpoint');
    const sql = 'DELETE FROM Timesheet WHERE Timesheet.id = $timesheetId';
    const values = {$timesheetId: req.params.timesheetId};
    db.run(sql, values, (error) => {
        if(error){
            next(error);
        } else {  
            //console.log('Deleted and ready to send status');
            res.sendStatus(204);
        }
    });
});

module.exports = timesheetRouter;