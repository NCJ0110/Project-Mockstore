const client = contentful.createClient({
    space: 'inwlu6jjkbzk',
    accessToken: '5rR0l33aoKMxUkSBV-VUrTbwb2QY1P-kQSUwepEKHAA'
})

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

document.addEventListener('DOMContentLoaded', () => {
    const products = new Products();
    
    products.getProducts().then(products => {
        
    });
})