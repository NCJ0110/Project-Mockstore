const client = contentful.createClient({
    space: 'inwlu6jjkbzk',
    accessToken: '5rR0l33aoKMxUkSBV-VUrTbwb2QY1P-kQSUwepEKHAA'
})

//variables
const productsCenter = document.querySelector('.products-center');

class Products{
    async getProducts(){
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

}

document.addEventListener('DOMContentLoaded', () => {
    const products = new Products();
    const ui = new UI(); 
    
    products.getProducts().then(products => {
        ui.displayProducts(products);
    });
})