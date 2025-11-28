document.addEventListener("DOMContentLoaded", function() {

    const boxes = [
        {
            id: 1,
            theme: "Harry Potter",
            title: "Бокс «Harry Potter»",
            price: 450,
            img: "images/gift1.jpg",
            description: "Цей бокс містить: магічні палички, сувеніри з Хогвартсу, шоколадні жаби, тематичні листівки."
        },
        {
            id: 2,
            theme: "Stranger Things",
            title: "Бокс «Stranger Things»",
            price: 520,
            img: "images/gift2.jpg",
            description: "У боксі: футболка з серіалу, тематичні наклейки, фігурки персонажів, солодощі."
        },
        {
            id: 3,
            theme: "Friends",
            title: "Бокс «Friends»",
            price: 610,
            img: "images/gift3.jpg",
            description: "Бокс включає: кружку з цитатами, постери, брелоки, шоколад та наклейки."
        }
    ];

    // Функції для catalog.html
    const catalogGrid = document.getElementById("catalog-grid");
    if (catalogGrid) {
        const params = new URLSearchParams(window.location.search);
        const theme = params.get("theme");

        const filteredBoxes = theme ? boxes.filter(box => box.theme === theme) : boxes;

        filteredBoxes.forEach(box => {
            const div = document.createElement("div");
            div.classList.add("product-card");
            div.innerHTML = `
                <img src="${box.img}" alt="${box.title}" onclick="openDetail('${box.theme}')">
                <h3>${box.title}</h3>
                <p class="price">${box.price} грн</p>
                <button class="btn" onclick="openDetail('${box.theme}')">Детальніше</button>
            `;
            catalogGrid.appendChild(div);
        });
    }

    // Функції для product_detail.html
    const productImg = document.getElementById("product-img");
    const productTitle = document.getElementById("product-title");
    const productDescription = document.getElementById("product-description");
    const productPrice = document.getElementById("product-price");
    const quantityDisplay = document.getElementById("quantity");
    const increaseBtn = document.getElementById("increase");
    const decreaseBtn = document.getElementById("decrease");
    const addToCartBtn = document.getElementById("add-to-cart");
    const cartMessage = document.getElementById("cart-message");

    if (productTitle) {
        const currentTheme = localStorage.getItem("selectedTheme");
        const currentBox = boxes.find(box => box.theme === currentTheme) || boxes[0];

        productImg.src = currentBox.img;
        productTitle.textContent = currentBox.title;
        productDescription.textContent = currentBox.description;
        productPrice.textContent = currentBox.price + " грн";

        let quantity = 1;
        quantityDisplay.textContent = quantity;

        increaseBtn.addEventListener("click", () => {
            quantity++;
            quantityDisplay.textContent = quantity;
        });

        decreaseBtn.addEventListener("click", () => {
            if (quantity > 1) quantity--;
            quantityDisplay.textContent = quantity;
        });

        addToCartBtn.addEventListener("click", () => {
            showCartMessage(`${currentBox.title} додано до кошику (${quantity} шт.)`);
        });
    }

    window.openDetail = function(theme) {
        localStorage.setItem("selectedTheme", theme);
        window.location.href = "product_detail.html";
    }

    // Функція показу повідомлення
    function showCartMessage(message) {
        cartMessage.textContent = message;
        cartMessage.style.display = "block";

        setTimeout(() => {
            cartMessage.style.display = "none";
        }, 15000);

        cartMessage.onclick = () => {
            window.location.href = "cart.html";
        };
    }

    // Бургер-меню для мобільних
    const burger = document.querySelector(".burger");
    const navUl = document.querySelector("nav ul");

    if (burger) {
        burger.addEventListener("click", () => {
            navUl.classList.toggle("show");
        });
    }

});
