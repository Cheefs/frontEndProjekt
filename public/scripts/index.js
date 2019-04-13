class Product {
    constructor(id, name = 'EXCLUSIVE', price = 'SOLD', photo = 'no-photo', currency = '$', size, color, category, type ) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.photo = photo;
        this.currency = currency;

        this.size = size;
        this.color = color;
        this.category = category;
        this.type = type;
    }

    render() {
        return `<div class="product-item" data-size="${this.size}" data-color="${this.color}" data-type="${this.type}" data-category="${this.category}" >
                    <a href="single-page.html" class="item">
                        <div class="item-photo photo" style="background-image:url(${this.photo})"></div>
                        <div class="item-text">
                            <p class="item-name name">${this.name}</p>
                            <div class="item-price price_value">${this.price}</div>
                        </div> 
                    </a>
                    <a href="#" class="to-cart add-to-cart" data-id="${this.id}"> 
                        <img class="cart" src="images/cart-item.svg" alt="cart">
                        <span>Add to cart</span>
                    </a>
                </div>`;
    }
}

class ProductsList {
    constructor() {
        this.minProducts = 9;
        this.maxProducts = 19;
        this.products = [];
    }
    fetchItems() {
        return sendRequest(`${API_URL}/products?_start=${this.minProducts}&_end=${this.maxProducts}`).then((value) => {
            this.products = value.map(product => new Product(
                    product.id, product.name, product.price, product.photo, product.currency,
                    product.size, product.color, product.category, product.type
                )
            );
        });
    }
    render() {
        const itemsHtmls = this.products.map(product => product.render());
        return itemsHtmls.join('');
    }
}

const products = new ProductsList();
products.fetchItems().then(() => document.querySelector('.product-block').innerHTML = products.render());

const $products = document.querySelector('.product-block');
    $products.addEventListener('click', (e) => {
    e.preventDefault();
    if (e.target.parentElement.classList.contains('add-to-cart') || e.target.classList.contains('add-to-cart')) {
        let $productData = e.target.parentElement;
        if (e.target.parentElement.classList.contains('add-to-cart')) {
            $productData = $productData.parentElement;
        }
        const id = $productData.querySelector('.add-to-cart').dataset.id;
        const name = $productData.querySelector('.name').textContent;
        const price = $productData.querySelector('.price_value').textContent;
        const photo = $productData.querySelector('.photo').style.backgroundImage.replace('url("','').replace('")','');
        const username = document.cookie.trim() !== '' ? document.cookie : 'guestUser';

        const color = $productData.dataset.color;
        const size = $productData.dataset.size;
        const category = $productData.dataset.category;
        const type = $productData.dataset.type;

        console.log($productData);


        const product = new CartItem(null, id, username, name, price, photo, size, color, category, type);
        cart.addProduct(product);
    }
});