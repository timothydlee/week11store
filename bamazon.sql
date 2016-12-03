CREATE DATABASE Bamazon;
USE Bamazon;
CREATE TABLE products (
	product_id INTEGER(11) AUTO_INCREMENT NOT NULL,
    product_name VARCHAR(30) NOT NULL,
    department_name VARCHAR(30) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INTEGER(10) NOT NULL,
    PRIMARY KEY (product_id)
);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES 	("Bananas", "Food", 0.24, 5000), 
		("Apples", "Food", 1.20, 5200), 
        ("Paper Towels", "Household Items", 2.40, 300), 
        ("Snickers", "Food", 0.87, 2000), 
        ("Windex", "Household Items", 3.54, 250), 
        ("Laptop", "Electronics", 850, 30), 
        ("PS4", "Electronics", 450, 50), 
        ("Basketball", "Sporting Goods", 12, 70), 
        ("Elmo Doll", "Toy", 25, 150), 
        ("Bicycle", "Sporting Goods", 120, 75);
        