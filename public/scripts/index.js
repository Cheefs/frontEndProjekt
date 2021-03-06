window.addEventListener('load', (e)=> {
    if (location.search.trim() !== '') {
        $searchText.value = location.search.split('=')[1];
        products.filter($searchText.value);
        document.querySelector('.product-block').innerHTML = products.render();
    }
    loginUser.login(LOGIN_MODE_AUTO);
});

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
                        <div class="item-photo photo">
                            <img class="photo_img" src="${this.photo}" data-id="${this.id}">
                        </div>
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
        this.curentMark = 'featured';
    }
    fetchItems() {
        return sendRequest(`${API_URL}/products`).then((value) => {
            this.products = value.filter(product => product.mark === this.curentMark);
            return this.products = this.products.map(product => new Product(
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

        sendRequest(`${API_URL}/products?id=${id}`).then((value) => {
            const userId = loginUser.getId();
            value = value[0];
            const product = new CartItem(null, value.id, userId, value.name, value.price, value.photo, value.size, value.color, value.category, value.type);
            cart.addProduct(product);
        });
    } else if (e.target.classList.contains('photo_img')) {
        window.location.href = `${API_URL}/single-page.html?id=${e.target.dataset.id}`;
    }
});