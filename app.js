const client = contentful.createClient({
    space: 'inwlu6jjkbzk',
    accessToken: '5rR0l33aoKMxUkSBV-VUrTbwb2QY1P-kQSUwepEKHAA'
})

//variables
const productsCenter = document.querySelector('.products-center');

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
                <h4 class="product-price">${product.price}</h4>
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
            })
        })

    }

    setupAPP(){
        console.log("test");
        cart = Storage.getCart();
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