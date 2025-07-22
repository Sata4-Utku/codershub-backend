
function buyProduct(orderNumber, productID, price) {
    const email = "utkuerenmert@gmail.com";
    const order = {
        orderNumber: orderNumber,
        productID: productID,
        email: email,
        price: price
    };

    fetch("https://api.jsonstorage.net/v1/json?apiKey=8969a471-87b7-4758-9f34-b090d396d9bb&name=jsfiddle-", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(order)
    })
    .then(res => res.json())
    .then(data => {
        alert(`Order Successful! Your Order Number: ${orderNumber}\nJoin our Discord: https://discord.gg/jgcdk43cgG and create a support ticket to claim your product.`);
        window.open("https://discord.gg/jgcdk43cgG", "_blank");
    })
    .catch(err => {
        console.error(err);
        alert("Something went wrong. Please try again.");
    });
}
