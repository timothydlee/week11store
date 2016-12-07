//****************************************************
				//REQUIRING PACKAGES
//****************************************************
//Requiring various keys and NPM packages
var keys 		= require("./keys.js");
var mysql 		= require("mysql");
var inquirer 	= require("inquirer");
var prompt 		= require("prompt");
var Table 		= require("cli-table2");
var clc 		= require("cli-color");

//****************************************************
				//CREATING CONNECTION
//****************************************************

//Instantiating the database config information to connect to SQL
var connection = mysql.createConnection({
	host     : "localhost",
	user     : "root",
	password : keys.pw.root,
	database : "Bamazon"
});

//Creating initial connection to database hosting data using MYSQL NPM package
connection.connect(function(err) {
	if (err) throw err;
 	// console.log("connected as id: " + connection.threadId);
});

//****************************************************
				//EXIT FUNCTION
//****************************************************

//Function that displays end message and closes the datbase connection
function exit() {
	console.log("Thanks for using BamazonManager!");
	connection.end();
}

//****************************************************


//****************************************************
				//MAIN DISPLAY FUNCTION
//****************************************************
//Function that displays main user interface. Provides list of tasks for user to to perform
function mainDisplay() {
	//Prompts the user with a list of options
	inquirer.prompt(
		{
			type: "list",
			name: "selection",
			message: "What would you like to do?",
			choices: ["Display All Inventory", "View Low Inventory", "Add Stock to Existing Inventory", "Add New Product to Inventory", "Exit"]
		}
	).then(function(response) {
		//Switch case to handle the various responses
		switch(response.selection) {
			case "Display All Inventory":
				displayItems();
				break;
			case "View Low Inventory":
				viewLowInventory();
				break;
			case "Add Stock to Existing Inventory":
				addToInventory();
				break;
			case "Add New Product to Inventory":
				addProduct();
				break;
			case "Exit":
				exit();
				break;
			default:
				console.log("Things");
		}
	})
}

//****************************************************


//****************************************************
				//BUILD TABLE FUNCTION
//****************************************************

//Function that builds table without initiating displayMain user selection screen.
function buildTable() {
	//Instantiating new instance of Table from Cli-Table2 NPM Package
	var allItems = new Table({
		//Labeling heads of each column
		head: [
			{hAlign: "center", content: clc.white("ID")}, 
			clc.white("Item"), 
			clc.white("Department"), 
			{hAlign: "center", content: clc.white("Price")}, 
			{hAlign: "center", content: clc.white("Stock")}
		],
		//Setting width of each column
		colWidths: [5, 25, 25, 10, 10],
		//Setting a border around the table
		chars: 
		{ 
			'top': '═' , 
			'top-mid': '╤' ,
			'top-left': '╔' ,
			'top-right': '╗',
			'bottom': '═' ,
			'bottom-mid': '╧' ,
			'bottom-left': '╚' , 
			'bottom-right': '╝',
			'left': '║' , 
			'left-mid': '╟' , 
			'mid': '─' , 'mid-mid': '┼',
			'right': '║' ,
			'right-mid': '╢' , 
			'middle': '│' 
		}
	});
	//Selecting from the table "products" to display all items, whether stock is 0 or not
	connection.query("SELECT * FROM products", function(err, res) {
		//Displays error if an error occurs
		if (err) throw err;	
		//Loops through the res, which is contained in an array
		for(var i = 0; i<res.length; i++) {
			var item = res[i];
			//Used cli-color to highlight rows that were lower than 100 in quantity with red to alert the manager.
			if(item.stock_quantity<=100 && item.stock_quantity != 0){
				allItems.push([
					{hAlign: "center", content: clc.yellow(item.product_id)}, 
					clc.yellow(item.product_name), 
					clc.yellow(item.department_name), 
					{hAlign: "right", content: clc.yellow("$" + (item.price.toFixed(2)))},
					{hAlign: "right", content: clc.yellow(item.stock_quantity)}
				]);
			//For items out of stock, the row will display as red
			} else if(item.stock_quantity === 0) {
				allItems.push([
					{hAlign: "center", content: clc.red(item.product_id)}, 
					clc.red(item.product_name), 
					clc.red(item.department_name), 
					{hAlign: "right", content: clc.red("$" + (item.price.toFixed(2)))},
					{hAlign: "right", content: clc.red(item.stock_quantity)}
				]);	
			//For all items that are well stocked, the row will display in cyan
			} else {
				allItems.push([
					{hAlign: "center", content: clc.cyan(item.product_id)}, 
					clc.cyan(item.product_name), 
					clc.cyan(item.department_name), 
					{hAlign: "right", content: clc.cyan("$" + item.price.toFixed(2))},
					{hAlign: "right", content: clc.cyan(item.stock_quantity)}
				]);
			}
		}
		console.log(clc.yellow("\nRows highlighted in yellow are low in inventory.\nRows highlighted in red are out of stock."));
		//Prints the table
		console.log(allItems.toString());
	})
}

//****************************************************
				


//****************************************************
			//DISPLAY ALL ITEMS FUNCTION
//****************************************************

//Function that displays items if there is any stock of that item left
function displayItems() {
	buildTable();
	//Calls back to the selection menu
	mainDisplay();
}

//****************************************************



//****************************************************
			//VIEW LOW INVENTORY FUNCTION
//****************************************************
//Builds a table that uses different colors to build out table with low and 0 inventory
function viewLowInventory() {
	//Instantiating new instance of Table from Cli-Table2 NPM Package
	var lowItems = new Table({
		//Labeling heads of each column
		head: [
			{hAlign: "center", content: clc.white("ID")}, 
			clc.white("Item"), 
			clc.white("Department"), 
			{hAlign: "center", content: clc.white("Price")}, 
			{hAlign: "center", content: clc.white("Stock")}
		],
		//Setting width of each column
		colWidths: [5, 25, 25, 10, 10],
		//Setting a border around the table
		chars: 
		{ 
			'top': '═' , 
			'top-mid': '╤' ,
			'top-left': '╔' ,
			'top-right': '╗',
			'bottom': '═' ,
			'bottom-mid': '╧' ,
			'bottom-left': '╚' , 
			'bottom-right': '╝',
			'left': '║' , 
			'left-mid': '╟' , 
			'mid': '─' , 'mid-mid': '┼',
			'right': '║' ,
			'right-mid': '╢' , 
			'middle': '│' 
		}
	});
	//Connects to the database to receive data where the quantity is <100 units
	connection.query("SELECT * FROM products WHERE stock_quantity <= 100", function(err, res) {
		if (err) throw err;
		for(var i = 0; i<res.length; i++){
			var item = res[i];
			//If stock quantity is 0, the row prints in red
			if(item.stock_quantity === 0){
				lowItems.push([
					{hAlign: "center", content: clc.red(item.product_id)}, 
					clc.red(item.product_name), 
					clc.red(item.department_name), 
					{hAlign: "right", content: clc.red("$" + item.price.toFixed(2))},
					{hAlign: "right", content: clc.red(item.stock_quantity)}
				])
			//Else, the row prints in default white
			} else {
				lowItems.push([
					{hAlign: "center", content: item.product_id}, 
					item.product_name, 
					item.department_name, 
					{hAlign: "right", content: "$" + item.price.toFixed(2)},
					{hAlign: "right", content: item.stock_quantity}
				])				
			}
		}
		console.log(clc.yellow("\nRows in red are items that are out of stock."));
		console.log(lowItems.toString());
		mainDisplay();//Calls back to the main user selection interface
	})
};


//****************************************************
		//ADD INVENTORY TO EXISTING PRODUCT 
//****************************************************
//Function that adds inventory to a product that already exist in the database
function addToInventory() {
	var idArray = [];
	//Displays table for user to see
	buildTable();
	//Creates an array of all items for validation process
	connection.query("SELECT * FROM products", function (err, res) {
		if (err) throw err;
		for(var i = 0; i < res.length; i++) {
			idArray.push(res[i]);
		}
		return idArray;
	});

	inquirer.prompt([
		{
			name: "id",
			message: "ID of the product you want to add inventory to:",
			type: "input",
			//Validates that the number that the user inputs corresponds to an item that exists
			validate: function(value) {
				var flag;
				for (var j = 0; j < idArray.length; j++) {
					if (parseInt(idArray[j].product_id) === parseInt(value)){
						flag = true;
					}
				}
				if (flag === true){
					return true;
				} else {
					console.log("\nPlease enter valid id number.")
					return false;
				}
			}
		},
		{
			name: "amount",
			message: "How many of the item do you want to add?",
			type: "input",
			//Validates the input to make sre that the input is a number and it's not blank
			validate: function(value) {
				if (isNaN(value) === false && value != "" && value >= 0) {
					return true;
				} else {
					console.log("\nPlease enter a valid number.");
					return false;
				}
			}
		}
	]).then(function(response){
		var productId = parseInt(response.id) //ID Number of the item selected
		var productIndex = productId-1; //Index position of the item selected in the context of the entire array of products in the DB
		var originalQuantity = idArray[productIndex].stock_quantity //Variable that points to the stock_quantity of the product's original quantity
		var newStock = parseInt(originalQuantity) + parseInt(response.amount); //Variable that adds the user's input amount and adds it to the original quantity
		console.log("Original Stock: " + originalQuantity)
		console.log("Added amount: " + response.amount);
		console.log("New Stock: " + newStock);  
		//Passes new stock quantity and product id values to updateDB function that will query SQL
		updateDB(newStock, productId);
	});
}
//****************************************************


//**********************************************************
//UPDATEDB FUNCTION THAT ADDS INVENTORY TO EXISTING PRODUCTS 
//**********************************************************

//Function that updates the database which passes in the parameters that correspond to the new stock value and the product id of that item
function updateDB(newNumber, id) {
	//MySQL's query using the UPDATE table query where stockquantity is the first number (newNumber) passed in and the id (id)
	connection.query("UPDATE products SET stock_quantity = ? WHERE product_id = ?", [newNumber, id], function(err, res) {
		console.log("Success, you've updated your inventory");
		if (err) throw err;
		//Goes back to the main display
		mainDisplay();
	})
};
//*********************************************************


//****************************************************
		//ADD NEW PRODUCT INTO INVENTORY 
//****************************************************

//Function that adds new product where one does not already exist
function addProduct() {
	inquirer.prompt([
		{
			name: "product_name",
			message: "What's the name of the new product?",
			type: "input",
			//Validates user input to make sure value is not blank and that it is not a pure number
			validate: function(value) {
				if (value != "" && isNaN(value) === true) {
					return true;
				} else {
					console.log("\nPlease enter valid product name.");
					return false;
				}
			}
		},
		{
			name: "department_name",
			message: "What department does the product belong to?",
			type: "input",
			//Validates user input to make sure value is not blank and that it is not a pure number
			validate: function(value) {
				if (value != "" && isNaN(value) === true) {
					return true;
				} else {
					console.log("\nPlease enter valid department name.");
					return false;
				}
			}
		},
		{
			name: "price",
			message: "What is the price of the product?",
			type: "input",
			//Validates user input to make sure value is a number, is not blank and is greater than or equal to 0
			validate: function(value) {
				if (isNaN(value) === false && value != "" && value >= 0) {
					return true;
				} else {
					console.log("\nPlease enter valid number.")
					return false;
				}
			} 
		},
		{
			name: "stock_quantity",
			message: "How much of the product do you want to add?",
			type: "input",
			//Validates user input to make sure value is a number, is not blank and is greater than or equal to 0
			validate: function(value) {
				if (isNaN(value) === false && value != "" && value >= 0) {
					return true;
				} else {
					console.log("\nPlease enter valid number.")
					return false;
				}
			}
		}
	]).then(function(response){
		console.log("Thanks!");
		var productName = response.product_name;
		var departmentName = response.department_name;
		var price = response.price;
		var quantity = response.stock_quantity;
		//Passes responses from user into the addProductDB function that will use that information to add the product at the correct price and quantity and department name into the DB
		addProductDB(productName, departmentName, price, quantity);
	})
}
//****************************************************


//****************************************************
	//FUNCTION THAT UPDATES THE DB WITH NEW PRODUCT 
//****************************************************

//Function that adds new product into the database using parameters passed in by the manager
function addProductDB(productName, departmentName, price, quantity){
	connection.query("INSERT INTO products (product_name,department_name,price,stock_quantity) VALUES ('" + productName + "','" + departmentName + "'," + price + "," + quantity +")");
	console.log("Congratulations, you've added your new product");
	buildTable();
	mainDisplay();
}

//Starts program
mainDisplay();