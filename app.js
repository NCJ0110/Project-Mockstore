const client = contentful.createClient({
    space: 'inwlu6jjkbzk',
    accessToken: '5rR0l33aoKMxUkSBV-VUrTbwb2QY1P-kQSUwepEKHAA'
})

//variables
const productsCenter = document.querySelector('.products-center');
const cartAmount = document.querySelector('.cart-amount');
const cartTotal = document.querySelector('.total-amount');
const cartOverlay = document.querySelector('.cart-overlay');
const cartDOM = document.querySelector('.cart');
const cartContent = document.querySelector('.cart-content');
const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');

let cart = [];
let DOMbuttons = [];

class Products{
    async getProducts(){
        try {
            const result = await client.getEntries({
            content_type: 'mockStore'
        })

        const {items} = result;

        const products = items.map(item => {
            const {title, price} = item.fields;
            const {id} = item.sys;
            const image = item.fields.image.fields.file.url;

            return {title, price, id, image};
        })

        return products;
        } catch(error){
            console.log(error);
        }
        
    }
}

class UI {
    displayProducts(products){
        let productsHTML = ''
        
        products.forEach(product => {
            productsHTML += `
            <article class="product">
                <div class="img-container">
                    <img src="${product.image}" alt="" class="product-img">
                    <button class="add-cart-btn" data-id="${product.id}">
                        <i class="fa fa-shopping-cart"></i>
                        add to cart</button>
                </div>
                <h3 class="product-title">${product.title}</h3>
                <h4 class="product-price">£${product.price}</h4>
            </article>
            `
        })

        productsCenter.innerHTML = productsHTML;
    }

    getCartButtons(){
        const buttons = [...document.querySelectorAll('.add-cart-btn')];
        
        buttons.forEach(button => {
            const id = button.dataset.id;
            const inCart = cart.find(product => product.id === id);

            if(inCart){
                button.innerText = 'In Cart';
                button.disabled = true;
            }

            button.addEventListener('click', (e) => {
                button.innerText = 'In Cart';
                button.disabled = true;

                const cartItem = {...Storage.getProduct(id), amount: 1};
                cart = [...cart, cartItem];
                Storage.saveCart(cart);
                this.setCartValues(cart);
                this.addCartItem(cartItem);
                this.openCart();
                
            })
        })

    }

    setCartValues(cart) {
        let totalItems = 0;
        let totalPrice = 0;

        cart.forEach(item => {
            totalItems += item.amount;
            totalPrice += item.amount * item.price;
        })

        cartAmount.innerHTML = totalItems;
        cartTotal.innerText = parseFloat(totalPrice.toFixed(2));

    }

    addCartItem(item){
        const div = document.createElement('div');
        div.classList.add('cart-item');

        div.innerHTML = `
            <img src="${item.image}" alt="product">
            <div class="cart-item-info">
                <h3>${item.title}</h3>
                <h4>£${item.price}</h4>
                <span class="remove-item" id="${item.id}"><p>remove</p></span>
            </div>
            <div >
                <i class="fa fa-chevron-up" data-id="${item.id}"></i>
                <p>${item.amount}</p>
                <i class="fa fa-chevron-down" data-id="${item.id}"></i>
            </div>
        `

        cartContent.appendChild(div);
    }

    populateCart(cart){
        cart.forEach(item => {
            this.addCartItem(item);
        })
    }

    openCart(){
        cartOverlay.classList.add('cart-overlay-visible');
        cartDOM.classList.add('show-cart');
    }

    closeCart(){
        cartOverlay.classList.remove('cart-overlay-visible');
        cartDOM.classList.remove('show-cart');
    }

    setupAPP(){
        cart = Storage.getCart();
        this.setCartValues(cart);
        this.populateCart(cart)
        cartBtn.addEventListener('click', this.openCart);
        closeCartBtn.addEventListener('click', this.closeCart);
    }
}

class Storage {
    static saveProducts(products){
        localStorage.setItem('products', JSON.stringify(products));
    }

    static getProduct(id){
        const products = JSON.parse(localStorage.getItem('products'));
        return products.find(product => product.id === id);
    }

    static saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    static getCart(){
        return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const products = new Products();
    const ui = new UI(); 

    ui.setupAPP();
    
    products.getProducts().then(products => {
        ui.displayProducts(products);
        Storage.saveProducts(products);
    }).then(() => {
        ui.getCartButtons();
    })
})