const mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require('console.table');

// create the connection information for the sql database
var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "student",
  database: "employee_tracker_db"
});

// connect to the mysql server and sql database
connection.connect(function(err) {
    if (err) throw err;
    // run the start function after the connection is made to prompt the user
    start();
  });
  
  // function which prompts the user for what action they should take
  function start() {
    inquirer
      .prompt({
        name: "initial_action",
        type: "list",
        message: "What would you like to do?",
        choices: [
                    "View All Employees",
                    "View All Employees By Department", 
                    "View All Employees By Manager",   
                    "Add Employee", 
                    "Remove Employee",
                    "Update Employee Role",
                    "Update Employee Manager",
                    "View All Roles",
                    "Add Role",
                    "Remove Role",
                    "Close"
                ]
      })
      .then(function(answer) {
        // based on their answer
        if (answer.initial_action === "View All Employees") {
          viewAll();
        }
        else if(answer.initial_action === "View All Employees By Department") {
          viewDep();
        } 
        else if(answer.initial_action === "View All Employees By Manager") {
          viewMan();
        }
        else if(answer.initial_action === "Add Employee") {
          addEmp();
        } 
        else if(answer.initial_action === "Remove Employee") {
          removeEmp();
        } 
        else if(answer.initial_action === "Update Employee Role") {
          updateRole();
        }  
        else if(answer.initial_action === "Update Employee Manager") {
          updateMan();
        } 
        else if(answer.initial_action === "View All Roles") {
          viewRole();
        }
        else if(answer.initial_action === "Add Role") {
          addRole();
        }
        else if(answer.initial_action === "Remove Role") {
          removeRole();
        }
        else {
            connection.end();
        }
      });
  }

function viewAll(){
    var query = "SELECT employee.id, first_name, last_name, role.title, role.salary, department.name FROM employee JOIN role ON employee.role_id = role.id JOIN department ON role.department_id = department.id";
    connection.query(query, function(err, data) {
        if (err) throw err;
        console.table(data);
   });
   start();
};

function viewDep(){
    var query = "SELECT employee.id, first_name, last_name, role.title, role.salary, department.name FROM employee JOIN role ON employee.role_id = role.id JOIN department ON role.department_id = department.id ORDER BY department.name";
    connection.query(query, function(err, data) {
        if (err) throw err;
        console.table(data);
   });
   start();
};

function viewMan(){
    
};

function addEmp(){
  inquirer.prompt([
      {
        name: "firstName",
        type: "input",
        message: "What is the employee's first name?"
      },
      {
        name: "lastName",
        type: "input",
        message: "What is the employee's last name?"
      },
      {
        name: "employeeRole",
        type: "input",
        message: "What is the employee's role?"
      }
    ])
    .then(function(answer) {
      //grab employee manager id
      //grab role id
      var query = "";
      connection.query("INSERT INTO employee SET ?",
        {
          first_name: answer.firstName,
          last_name: answer.lastName,
          role_id: answer.employeeRole,
        },
        function(err) {
        if (err) throw err;
        console.log("Employee added succesfuly!");
        start();
        }
    )})
};

function removeEmp(){
  inquirer.prompt([
    {
      name: "employeeDelete",
      type: "input",
      message: "Which employee would you like to remove?"
    }
  ])
  .then(function(answer) {
  //get employee id
  var query = "";
  connection.query("DELETE FROM employee WHERE id = ?", [query], function(err, result) {
    if (err) {
      // If an error occurred, send a generic server failure
      return res.status(500).end();
    }
    else if (result.affectedRows === 0) {
      // If no rows were changed, then the ID must not exist, so 404
      return res.status(404).end();
    }
    res.status(200);
    console.log("Employee removed succesfully!");
    start();
  });
});
};

function updateRole(){

};

function updateMan(){

};

function viewRole(){
  var query = "SELECT * FROM role";
  connection.query(query, function(err, data) {
      if (err) throw err;
      console.table(data);
      start();
 });
};

function addRole(){
  connection.query("SELECT * FROM department", function(err, results) {
  if (err) throw err;
  inquirer.prompt([
    {
      name: "roleTitle",
      type: "input",
      message: "What is the title of this role?"
    },
    {
      name: "roleSalary",
      type: "number",
      message: "What is the salary of this role?"
    },
    {
      name: "roleDepartment",
      type: "rawlist",
      choices: function() {
        var choiceArray = [];
        for (var i = 0; i < results.length; i++) {
          choiceArray.push(results[i].name);
        }
        return choiceArray;},
      message: "What department is this role in?"
    }
  ])
  .then(function(answer) {
    //grab department id
    var departmentId;
      for (var i = 0; i < results.length; i++) {
        if (results[i].name === answer.roleDepartment) {
              departmentId = results[i].id;
            }
          };
    connection.query("INSERT INTO role SET ?",
      {
        title: answer.roleTitle,
        salary: answer.roleSalary,
        department_id: departmentId,
      },
      function(err) {
      if (err) throw err;
      console.log("Role added succesfuly!");
      start();
      }
  )})
})};

function removeRole(){
  connection.query("SELECT * FROM role", function(err, results) {
  if (err) throw err;
  inquirer.prompt([
    {
      name: "roleDelete",
      type: "rawlist",
      choices: function() {
        var choiceArray = [];
        for (var i = 0; i < results.length; i++) {
          choiceArray.push(results[i].title);
        }
        return choiceArray;},
      message: "What role would you like to remove?"
    }
  ])
  .then(function(answer) {
  //get role id
  var roleId;
      for (var i = 0; i < results.length; i++) {
        if (results[i].title === answer.roleDelete) {
              roleId = results[i].id;
            }
          };
  connection.query("DELETE FROM role WHERE id = ?", [roleId], function(err, result) {
    if (err) {
      // If an error occurred, send a generic server failure
      return result.status(500).end();
    }
    else if (result.affectedRows === 0) {
      // If no rows were changed, then the ID must not exist, so 404
      return result.status(404).end();
    }
    result.status(200);
    console.log("Role removed succesfully!");
    start();
  });
});
})};


// // function to handle posting new items up for auction
// function postAuction() {
//     // prompt for info about the item being put up for auction

//         {
//           name: "category",
//           type: "input",
//           message: "What category would you like to place your auction in?"
//         },
//         {
//           name: "startingBid",
//           type: "input",
//           message: "What would you like your starting bid to be?",
//           validate: function(value) {
//             if (isNaN(value) === false) {
//               return true;
//             }
//             return false;
//           }
//         }
//       ])
//       .then(function(answer) {
//         // when finished prompting, insert a new item into the db with that info
//         connection.query(
//           "INSERT INTO auctions SET ?",
//           {
//             item_name: answer.item,
//             category: answer.category,
//             starting_bid: answer.startingBid || 0,
//             highest_bid: answer.startingBid || 0
//           },
//           function(err) {
//             if (err) throw err;
//             console.log("Your auction was created successfully!");
//             // re-prompt the user for if they want to bid or post
//             start();
//           }
//         );
//       });
//   }
  
//   function bidAuction() {
//     // query the database for all items being auctioned
//     connection.query("SELECT * FROM auctions", function(err, results) {
//       if (err) throw err;
//       // once you have the items, prompt the user for which they'd like to bid on
//       inquirer
//         .prompt([
//           {
//             name: "choice",
//             type: "rawlist",
//             choices: function() {
//               var choiceArray = [];
//               for (var i = 0; i < results.length; i++) {
//                 choiceArray.push(results[i].item_name);
//               }
//               return choiceArray;
//             },
//             message: "What auction would you like to place a bid in?"
//           },
//           {
//             name: "bid",
//             type: "input",
//             message: "How much would you like to bid?"
//           }
//         ])
//         .then(function(answer) {
//           // get the information of the chosen item
//           var chosenItem;
//           for (var i = 0; i < results.length; i++) {
//             if (results[i].item_name === answer.choice) {
//               chosenItem = results[i];
//             }
//           }
  
//           // determine if bid was high enough
//           if (chosenItem.highest_bid < parseInt(answer.bid)) {
//             // bid was high enough, so update db, let the user know, and start over
//             connection.query(
//               "UPDATE auctions SET ? WHERE ?",
//               [
//                 {
//                   highest_bid: answer.bid
//                 },
//                 {
//                   id: chosenItem.id
//                 }
//               ],
//               function(error) {
//                 if (error) throw err;
//                 console.log("Bid placed successfully!");
//                 start();
//               }
//             );
//           }
//           else {
//             // bid wasn't high enough, so apologize and start over
//             console.log("Your bid was too low. Try again...");
//             start();
//           }
//         });
//     });
//   }
  