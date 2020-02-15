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
                    "Add Employee", 
                    "Remove Employee",
                    "Update Employee Role",
                    "View All Roles",
                    "Add Role",
                    "Remove Role",
                    "Add Department",
                    "Remove Department",
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
        else if(answer.initial_action === "Add Employee") {
          addEmp();
        } 
        else if(answer.initial_action === "Remove Employee") {
          removeEmp();
        } 
        else if(answer.initial_action === "Update Employee Role") {
          updateRole();
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
        else if(answer.initial_action === "Add Department"){
          addDep();
        }
        else if(answer.initial_action === "Remove Department"){
          removeDep(); 
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

function addDep(){
  inquirer.prompt([
    {
      name: "departmentName",
      type: "input",
      message: "What is the name of this department?"
    }
  ])
  .then(function(answer) {
    
    connection.query("INSERT INTO department SET ?",
      {
        name: answer.departmentName
      },
      function(err) {
      if (err) throw err;
      console.log("Department added succesfuly!");
      start();
      }
  )})
};

function addEmp(){
  connection.query("SELECT * FROM role", function(err, results) {
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
        type: "rawlist",
        choices: function() {
          var choiceArray = [];
          for (var i = 0; i < results.length; i++) {
            choiceArray.push(results[i].title);
          }
          return choiceArray;},
        message: "What is the employee's role?"
      }
    ])
    .then(function(answer) {
      
      var roleId;
      for (var i = 0; i < results.length; i++) {
        if (results[i].title === answer.employeeRole) {
              roleId = results[i].id;
            }
          };
      connection.query("INSERT INTO employee SET ?",
        {
          first_name: answer.firstName,
          last_name: answer.lastName,
          role_id: roleId
        },
        function(err) {
        if (err) throw err;
        console.log("Employee added succesfuly!");
        start();
        }
    )})
})};

function removeEmp(){
  connection.query("SELECT * FROM employee", function(err, results) {
  if (err) throw err;
  inquirer.prompt([
    {
      name: "employeeDelete",
      type: "rawlist",
      choices: function() {
        var choiceArray = [];
        for (var i = 0; i < results.length; i++) {
          choiceArray.push(results[i].first_name + " " + results[i].last_name);
        }
        return choiceArray;},
      message: "Which employee would you like to remove?"
    }
  ])
  .then(function(answer) {
  //get employee id
  var employeeId;
      for (var i = 0; i < results.length; i++) {
        if (results[i].first_name + " " + results[i].last_name === answer.employeeDelete) {
              employeeId = results[i].id;
            }
          };
  connection.query("DELETE FROM employee WHERE id = ?", [employeeId], function(err, res) {
    if (err) throw err;
    console.log("Employee removed succesfully!");
    start();
  });
});
})};

function updateRole(){
  
  connection.query("SELECT role.id, role.title, role.salary, role.department_id, department.name FROM employee_tracker_db.role JOIN employee_tracker_db.department WHERE role.department_id = department.id;", function(err, results) {
    if (err) throw err;
    inquirer.prompt([
      {
        name: "roleUpdate",
        type: "rawlist",
        choices: function() {
          var choiceArray = [];
          for (var i = 0; i < results.length; i++) {
            choiceArray.push(results[i].title);
          }
          return choiceArray;},
        message: "What role would you like to update?"
      },
      {
        name: "roleTitle",
        type: "input",
        message: "What is updated title of this role?"
      },
      {
        name: "roleSalary",
        type: "number",
        message: "What is the updated salary of this role?"
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
        message: "What department is this updated role in?"
      }
    ]).then(function(answer){
      var roleId;
      for (var i = 0; i < results.length; i++) {
        if (results[i].title === answer.roleUpdate) {
              roleId = results[i].id;
            }
          };
          
      var departmentId;
      for (var i = 0; i < results.length; i++) {
        if (results[i].name === answer.roleDepartment) {
                departmentId = results[i].department_id;
              }
            };
          connection.query("UPDATE role SET ? WHERE ?",
          [ 
            {
            title: answer.roleTitle,
            salary: answer.roleSalary,
            department_id: departmentId
            },
            {
            id: roleId
            }
          ],  
            function(err) {
              if (err) throw err;
              console.log("Role updated succesfully!");
              start();
            }
          )
        });    
  })};
  
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
    if (err) throw err;
    console.log("Role removed succesfully!");
    start();
  });
});
})};

function removeDep(){
  connection.query("SELECT * FROM department", function(err, results) {
    if (err) throw err;
    inquirer.prompt([
      {
        name: "departmentDelete",
        type: "rawlist",
        choices: function() {
          var choiceArray = [];
          for (var i = 0; i < results.length; i++) {
            choiceArray.push(results[i].name);
          }
          return choiceArray;},
        message: "Which department would you like to remove?"
      }
    ])
    .then(function(answer) {
    //get department id
    var departmentId;
        for (var i = 0; i < results.length; i++) {
          if (results[i].name === answer.departmentDelete) {
                departmentId = results[i].id;
              }
            };
    connection.query("DELETE FROM department WHERE id = ?", [departmentId], function(err, res) {
      if (err) throw err;
      console.log("Department removed succesfully!");
      start();
    });
  });
  })
}
