//Requiring various keys and NPM packages
var keys 		= require("./keys.js");
var mysql 		= require("mysql");
var inquirer 	= require("inquirer");
var prompt 		= require("prompt");
var Table 		= require("cli-table2");
var clc 		= require("cli-color");

//Instantiating the database config information to connect to SQL
var connection = mysql.createConnection({
	host     : "localhost",
	user     : "root",
	password : keys.pw.root,
	database : "Bamazon"
});

//Instantiating new instance of Table from Cli-Table2 NPM Package
var table = new Table({
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

//Creating connection to database hosting data using MYSQL NPM package
connection.connect(function(err) {
	if (err) throw err;
 	// console.log("connected as id: " + connection.threadId);
});

//Function that displays end message and closes the datbase connection
function exit() {
	console.log("Thanks for using BamazonManager!");
	connection.end();
}

//Function that displays main user interface. Provides list of tasks for user to to perform
function mainDisplay() {
	//Prompts the user with a list of options
	inquirer.prompt(
		{
			type: "list",
			name: "selection",
			message: "What would you like to do?",
			choices: ["Display All Inventory", "View Low Inventory", "Add Stock to Existing Inventory", "Exit"]
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
			case "Exit":
				exit();
				break;
			default:
				console.log("Things");
		}
	})
}

//Function that displays items if there is any stock of that item left
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







//Function that displays items if there is any stock of that item left
function displayItems() {
	buildTable();
	//Calls back to the selection menu
	mainDisplay();
}

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
	connection.query("SELECT * FROM products WHERE stock_quantity <= 100", function(err, res) {
		if (err) throw err;
		for(var i = 0; i<res.length; i++){
			var item = res[i];
			if(item.stock_quantity === 0){
				lowItems.push([
					{hAlign: "center", content: clc.red(item.product_id)}, 
					clc.red(item.product_name), 
					clc.red(item.department_name), 
					{hAlign: "right", content: clc.red("$" + item.price.toFixed(2))},
					{hAlign: "right", content: clc.red(item.stock_quantity)}
				])
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
		mainDisplay();
	})
};

function addToInventory() {
	var idArray = [];
	buildTable();

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
			validate: function(value) {
				if (isNaN(value) === false && value != "") {
					return true;
				} else {
					console.log("\nPlease enter a valid number.");
					return false;
				}
			}
		}
	]).then(function(response){
		var productId = parseInt(response.id)
		var productIndex = productId-1;
		var originalQuantity = idArray[productId].stock_quantity
		var newStock = parseInt(originalQuantity) + parseInt(response.amount);
		console.log("Original Stock: " + originalQuantity)
		console.log("Added amount: " + response.amount);
		console.log("New Stock: " + newStock);  
		updateDB(newStock, productId);
	});
}

// function addToInventory() {
// 	//Instantiating new instance of Table from Cli-Table2 NPM Package
// 	var allItems = new Table({
// 		//Labeling heads of each column
// 		head: [
// 			{hAlign: "center", content: clc.white("ID")}, 
// 			clc.white("Item"), 
// 			clc.white("Department"), 
// 			{hAlign: "center", content: clc.white("Price")}, 
// 			{hAlign: "center", content: clc.white("Stock")}
// 		],
// 		//Setting width of each column
// 		colWidths: [5, 25, 25, 10, 10],
// 		//Setting a border around the table
// 		chars: 
// 		{ 
// 			'top': '═' , 
// 			'top-mid': '╤' ,
// 			'top-left': '╔' ,
// 			'top-right': '╗',
// 			'bottom': '═' ,
// 			'bottom-mid': '╧' ,
// 			'bottom-left': '╚' , 
// 			'bottom-right': '╝',
// 			'left': '║' , 
// 			'left-mid': '╟' , 
// 			'mid': '─' , 'mid-mid': '┼',
// 			'right': '║' ,
// 			'right-mid': '╢' , 
// 			'middle': '│' 
// 		}
// 	});
// 	//Selecting from the table "products" to display all items, whether stock is 0 or not
// 	connection.query("SELECT * FROM products", function(err, res) {
// 		//Displays error if an error occurs
// 		if (err) throw err;
// 		var itemsForSelection = [];
// 		var itemsAll = [];
// 		//Loops through the res, which is contained in an array
// 		for(var i = 0; i<res.length; i++) {
// 			var item = res[i];
// 			itemsAll.push(item);
// 			itemsForSelection.push(item.product_id + ": " + item.product_name + " || Stock: " + item.stock_quantity);
// 			//Used cli-color to highlight rows that were lower than 100 in quantity with red to alert the manager.
// 			if(item.stock_quantity<=100 && item.stock_quantity != 0){
// 				allItems.push([
// 					{hAlign: "center", content: clc.yellow(item.product_id)}, 
// 					clc.yellow(item.product_name), 
// 					clc.yellow(item.department_name), 
// 					{hAlign: "right", content: clc.yellow("$" + (item.price.toFixed(2)))},
// 					{hAlign: "right", content: clc.yellow(item.stock_quantity)}
// 				]);
// 			//For items out of stock, the row will display as red
// 			} else if(item.stock_quantity === 0) {
// 				allItems.push([
// 					{hAlign: "center", content: clc.red(item.product_id)}, 
// 					clc.red(item.product_name), 
// 					clc.red(item.department_name), 
// 					{hAlign: "right", content: clc.red("$" + (item.price.toFixed(2)))},
// 					{hAlign: "right", content: clc.red(item.stock_quantity)}
// 				]);	
// 			//For all items that are well stocked, the row will display in cyan
// 			} else {
// 				allItems.push([
// 					{hAlign: "center", content: clc.cyan(item.product_id)}, 
// 					clc.cyan(item.product_name), 
// 					clc.cyan(item.department_name), 
// 					{hAlign: "right", content: clc.cyan("$" + item.price.toFixed(2))},
// 					{hAlign: "right", content: clc.cyan(item.stock_quantity)}
// 				]);
// 			}
// 		}
// 		itemsForSelection.push("Go Back To Main");
// 		console.log(clc.yellow("\nRows highlighted in yellow are low in inventory.\nRows highlighted in red are out of stock."));
// 		//Prints the table
// 		console.log(allItems.toString());
// 		inquirer.prompt(
// 			{
// 				type: "list", 
// 				name: "selection",
// 				choices: itemsForSelection,
// 				message: "Please select an item that you would like to add inventory to:"
// 			}
// 		).then(function(response){
// 			if (response.selection === "Go Back To Main") {
// 				mainDisplay();
// 			} else {
// 				console.log(response.selection);
// 				var productId = response.selection.split(":");
// 				console.log(productId)
// 				var productIdTrim = productId[0].trim();
// 				var productIdNum  = parseInt(productIdTrim);
// 				console.log('productIdNum: ' + productIdNum);
// 				inquirer.prompt(
// 					{
// 						type: "input",
// 						name: "numToAdd",
// 						message: "How many items would you like to add?",
// 						validate: function(value) {
// 							//input must be at least 0, less than or equal to stock available, and must be a number to be considered a valid input
// 							if (isNaN(value) === false && value >= 0 && !value === false) {
// 								return true;
// 							//Message displays if user inputs value greater than the stock available before being reprompted
// 							} else {
// 								console.log("\nSorry, we ain't about that. Please enter a valid number.")
// 								return false;
// 							}
// 						}
// 					}
// 				).then(function(quantityResponse) {
// 					var x = productId[2].trim();
// 					var newStock = parseInt(quantityResponse.numToAdd) + parseInt(x);
// 					console.log("OK, we added " + quantityResponse.numToAdd + " items to the inventory.");
// 					console.log("New stock is " + newStock);	
// 					// console.log("================================");
// 					// console.log("BEFORE CALLING UPDATEDB FUNCTION");
// 					// console.log("================================");
// 					// console.log("param 1 being passed which corresponds to new stock quantity: " + newStock + " || param 2 being passed which corresponds to id: " + productIdNum)
// 					updateDB(newStock, productIdNum);
// 					mainDisplay();
// 				})
// 			}
// 		})
// 	})
// }


//Function that updates the database which passes in the parameters that correspond to the new stock value and the product id of that item
function updateDB(newNumber, id) {
	//MySQL's query using the UPDATE table query
	// console.log("\n================================");
	// console.log("INSIDE THE UPDATEDB FUNCTION NOW")
	// console.log("================================")
	// console.log("newNumber: " + newNumber + " id: " + id);
	// console.log("newNumber typeof: " + typeof newNumber + " id typeof: " + typeof id);
	connection.query("UPDATE products SET stock_quantity = ? WHERE product_id = ?", [newNumber, id], function(err, res) {
		console.log("Success, you've updated your inventory");
		if (err) throw err;
		mainDisplay();
	})
};


function x() {
	inquirer.prompt(
		{
			name: "num1",
			type: "input",
			message: "first number"	
		}
	).then(function(res){
		var num1 = res.num1;
		inquirer.prompt(
			{
				name: "num2",
				type: "input",
				message: "second number"
			}
		).then(function(response){
			var num2 = res.num2;
			updateDB(num1, num2)
		});
	});
}
// x();
// updateDB(100, 3);

//Starts program
mainDisplay();