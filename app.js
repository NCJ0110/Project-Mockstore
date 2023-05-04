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
const clearCartBtn = document.querySelector('.clear-cart');

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
        DOMbuttons = buttons;

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
                <span class="remove-item" id="${item.id}">remove</span>
            </div>
            <div >
                <i class="fa fa-chevron-up" data-id="${item.id}"></i>
                <p class="product-amount">${item.amount}</p>
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

    cartLogic(){
        clearCartBtn.addEventListener('click', () => {
            this.clearCart()
        })

        cartContent.addEventListener('click', (e) => {
            if(e.target.classList.contains('remove-item')){
                const id = e.target.id;
                this.removeProduct(id);
                cartContent.removeChild(e.target.parentElement.parentElement);
            } else if(e.target.classList.contains('fa-chevron-up')){
                const id = e.target.dataset.id;
                const currentElement = e.target;
                const cartItem = cart.find(item => item.id === id);
                cartItem.amount++;
                Storage.saveCart(cart);
                currentElement.nextElementSibling.innerText = cartItem.amount;
                this.setCartValues(cart);
            } else if(e.target.classList.contains('fa-chevron-down')){
                const id = e.target.dataset.id;
                const currentElement = e.target;
                const cartItem = cart.find(item => item.id === id);
                cartItem.amount--;
                if(cartItem.amount > 0){
                    currentElement.previousElementSibling.innerText = cartItem.amount;
                   Storage.saveCart(cart);
                    this.setCartValues(cart);
                } else {
                    this.removeProduct(id);
                    cartContent.removeChild(currentElement.parentElement.parentElement);
                }
                
            }
        })
    }

    clearCart(){
        const productsId = cart.map(item => item.id);
        productsId.forEach(id => this.removeProduct(id));

        while(cartContent.children.length > 0){
            cartContent.removeChild(cartContent.children[0]);
        }

        this.closeCart();
    }

    removeProduct(id){
        cart = cart.filter(item => item.id !== id);
        Storage.saveCart(cart);
        this.setCartValues(cart);
        const button = this.getSingleButton(id);
        button.innerHTML = `<i class="fa fa-shopping-cart" data-id="${id}"></i> add to cart`;
        button.disabled = false;
    }

    getSingleButton(id){
        return DOMbuttons.find(button => button.dataset.id === id);
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
        this.openCart();
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
        ui.cartLogic();
    })
})