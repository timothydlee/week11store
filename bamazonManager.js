//Requiring various keys and NPM packages
var keys = require("./keys.js");
var mysql = require("mysql");
var inquirer = require("inquirer");
var prompt = require("prompt");
var Table = require("cli-table2");
var clc = require("cli-color");

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
		'middle': '│' }
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
			choices: ["Display All Inventory", "View Low Inventory", "Exit"]
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
			case "Exit":
				exit();
				break;
		}
	})
}


//Function that displays items if there is any stock of that item left
function displayItems() {
	//Selecting from the table "products" to display all items, whether stock is 0 or not
	connection.query("SELECT * FROM products", function(err, res) {
		//Displays error if an error occurs
		if (err) throw err;
		//Loops through the res, which is contained in an array
		for(var i = 0; i<res.length; i++) {
			//Used cli-color to highlight rows that were lower than 100 in quantity with red to alert the manager.
			if(res[i].stock_quantity<=100 && res[i].stock_quantity != 0){
				table.push([
					{hAlign: "center", content: clc.yellow(res[i].product_id)}, 
					clc.yellow(res[i].product_name), 
					clc.yellow(res[i].department_name), 
					{hAlign: "right", content: clc.yellow("$" + (res[i].price.toFixed(2)))},
					{hAlign: "right", content: clc.yellow(res[i].stock_quantity)}
				]);
			//For items out of stock, the row will display as red
			} else if(res[i].stock_quantity === 0) {
				table.push([
					{hAlign: "center", content: clc.red(res[i].product_id)}, 
					clc.red(res[i].product_name), 
					clc.red(res[i].department_name), 
					{hAlign: "right", content: clc.red("$" + (res[i].price.toFixed(2)))},
					{hAlign: "right", content: clc.red(res[i].stock_quantity)}
				]);	
			//For all items that are well stocked, the row will display in cyan
			} else {
				table.push([
					{hAlign: "center", content: clc.cyan(res[i].product_id)}, 
					clc.cyan(res[i].product_name), 
					clc.cyan(res[i].department_name), 
					{hAlign: "right", content: clc.cyan("$" + res[i].price.toFixed(2))},
					{hAlign: "right", content: clc.cyan(res[i].stock_quantity)}
				]);
			}
		}
		console.log(clc.yellow("\nRows highlighted in yellow are low in inventory.\nRows highlighted in red are out of stock."));
		//Prints the table
		console.log(table.toString());
		//Calls back to the selection menu
		mainDisplay();
	})
}

function viewLowInventory() {
	connection.query("SELECT * FROM products WHERE stock_quantity < 100", function(err, res) {
		if (err) throw err;
		for(var i = 0; i<res.length; i++){
			if(res[i].stock_quantity === 0){
				table.push([
					{hAlign: "center", content: clc.red(res[i].product_id)}, 
					clc.red(res[i].product_name), 
					clc.red(res[i].department_name), 
					{hAlign: "right", content: clc.red("$" + res[i].price.toFixed(2))},
					{hAlign: "right", content: clc.red(res[i].stock_quantity)}
				])
			} else {
				table.push([
					{hAlign: "center", content: res[i].product_id}, 
					res[i].product_name, 
					res[i].department_name, 
					{hAlign: "right", content: "$" + res[i].price.toFixed(2)},
					{hAlign: "right", content: res[i].stock_quantity}
				])				
			}
		}
		console.log(clc.yellow("\nRows in red are items that are out of stock."));
		console.log(table.toString());
		mainDisplay();
	})
}

// //Function called at the end of the display function that prompts the user what they want and how much of what they want to buy
// function userPrompt() {
// 	//MySQL query selecting from the products table
// 	connection.query("SELECT * FROM products", function(err, res) {
// 		//Array that holds the array of choices from the database of items with quantity>0 to display in list format
// 		var itemsAvailable = [];
// 		//Array that is used to eventually compare user's input of how many items they want to purchase to ensure that the value isn't greater than that of what exists in inventory
// 		var compare = [];
// 		if (err) throw err;
// 		//For loop that pushes all items with stock greater than 0 into various arrays 
// 		for(var i = 0; i< res.length; i++) {
// 			if (res[i].stock_quantity > 0) {
// 				compare.push(res[i]);
// 				itemsAvailable.push(res[i].product_id + "." + res[i].product_name);
// 			}
// 		}
// 		//Prompts user to make a selection among a list of items available for purchase
// 		inquirer.prompt(
// 		{	
// 			type: "list",
// 			name: "selection",
// 			choices: itemsAvailable,
// 			message: "Which item would you like to buy?"
// 		}).then(function(response) {
// 			//Variable to shorten path
// 			var selected = response.selection;
// 			//Searching for the index position of the response selected by the user to the index of that array that contains all available items that were displayed
// 			var compareIndex = itemsAvailable.indexOf(selected);
// 			//Creating variable to store the value of the database's stock of the compared array
// 			var compareStock = parseInt(compare[compareIndex].stock_quantity);
// 			//Prompt the user to input how many items of a stock they want to buy
// 			inquirer.prompt(
// 			{
// 				type: "input",
// 				name: "quantity",
// 				message: "How many would you like to buy?",
// 				//Included validation of the input
// 				validate: function(value) {
// 					//input must be at least 0, less than or equal to stock available, and must be a number to be considered a valid input
// 					if (isNaN(value) === false && value <= compareStock && value >= 0) {
// 						return true;
// 					//Message displays if user inputs value greater than the stock available before being reprompted
// 					} else if (value > compareStock) {
// 						console.log("\nSorry, we don't have that many. Please choose a lower number.");
// 						return false;
// 					//The catch-all where the user is prompted to re-enter a valid number.
// 					} else {
// 						console.log("\nPlease enter a valid number.")
// 						return false;
// 					}
// 				}
// 			//Then, once the user puts in a valid entry
// 			}).then(function(quantityResponse) {
// 				//User's response of quantiy
// 				var quantity = quantityResponse.quantity;
// 				//Price of the item that the user selected
// 				var price = compare[compareIndex].price;
// 				//Price that the user will pay for the quantiy of the item he/she selected
// 				var customerPrice = quantity * price;
// 				//Product ID # of the item the user selected
// 				var product_id = compare[compareIndex].product_id;
// 				console.log("Thank you! " + quantity + " of those costs " + customerPrice.toFixed(2));
// 				//New stock of the item less the amount that the user purchased
// 				var newStock = compareStock - quantityResponse.quantity;
// 				//Calls the updateDB function passing in the newStock amount and corresponding product ID
// 				updateDB(newStock, product_id);
// 				// console.log("Old stock: " + compare[compareIndex].stock_quantity + " | Bought amount: " + quantityResponse.quantity + " | New stock : " + newStock);
// 			})
// 		});
// 	});
// }

//Function that updates the database which passes in the parameters that correspond to the new stock value and the product id of that item
function updateDB(newNumber, id) {
	//MySQL's query using the UPDATE table queryr 
	connection.query("UPDATE products SET stock_quantity=? WHERE product_id = ?", [newNumber, id], function(err, res) {
		if (err) throw err;
		
	})
}

//Starts program
mainDisplay();