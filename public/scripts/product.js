class Product {
    constructor(id, name = 'EXCLUSIVE', price = 'SOLD', photo = 'no-photo', currency = '$') {
        this.id = id;
        this.name = name;
        this.price = price;
        this.photo = photo;
        this.currency = currency;
    }

    render() {
        return `<div class="product" data-id="${this.id}">
                    <a href="single-page.html" class="photo-link">
                        <div class="photo" style="background:url(${this.photo}) no-repeat;"></div>
                    </a>
                    <div class="buttons">
                        <a href="#" class="product-btn add-to-cart" data-id="${this.id}">
                            <img class="cart" src="images/cart-item.svg" alt="cart"> 
                            <span>Add to Cart</span>
                        </a>
                        <a href="#" class="product-btn small-btn">
                            <img src="images/compare.svg" alt="compare">
                        </a>
                        <a href="#" class="product-btn small-btn">
                            <img src="images/like.svg" alt="like">
                        </a>
                    </div>
                    <div class="text">
                        <div class="name">${this.name}</div>
                        <div class="price">
                            <span class="currency">${this.currency}</span> 
                            <span class="price_value">${this.price}</span>
                        </div>
                    </div>
                </div>`;
    }
}

class ProductsList {
    constructor() {
        this.products = [];
        this.filterItems = [];
        this.minProducts = 0
        this.maxProducts = 9;
    }

    fetchItems() {
        return sendRequest(`${API_URL}/products?_start=${this.minProducts}&_end=${this.maxProducts}`).then((value) => {
            this.products = value.map(product => new Product(product.id, product.name, product.price, product.photo, product.currency));
            this.filterItems = this.products;
        });
    }
    filter(query) {
        const regexp = new RegExp(query, 'i');
        this.filterItems = this.products.filter((item) => regexp.test(item.name))
    }

    totalPrice() {
        let price = 0;  
        this.products.forEach(e => {
            if (!isNaN(+e.price)) {
                price += +e.price;
            }
        });
        return price;
    }
    render() {
        const itemsHtmls = this.filterItems.map(product => product.render());
        return itemsHtmls.join('');
    }
}

const products = new ProductsList();
products.fetchItems().then(() => document.querySelector('.product-block').innerHTML = products.render());

const $searchText = document.querySelector('.search-text');
const $searchButton = document.querySelector('.search-button');

$searchButton.addEventListener('click', (e) => {
    e.preventDefault();
    console.log(products)
    products.filter($searchText.value);
    document.querySelector('.product-block').innerHTML = products.render();
});

const $products = document.querySelector('.product-block');
$products.addEventListener('click', (e) => {
    e.preventDefault();
    if (e.target.parentElement.classList.contains('add-to-cart') || e.target.classList.contains('add-to-cart')) {
        let $productData = e.target.parentElement.parentElement;
        if (e.target.parentElement.classList.contains('add-to-cart')) {
            $productData = $productData.parentElement;
        }
        const id = $productData.dataset.id;
        const name = $productData.querySelector('.name').textContent;
        const price = $productData.querySelector('.price_value').textContent;
        const photo = $productData.querySelector('.photo').style.backgroundImage.replace('url("','').replace('")','');
        const product = new CartItem(id, name, price, photo);

        cart.addProduct(product);
    }
});