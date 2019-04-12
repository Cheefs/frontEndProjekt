class CartPage {
    constructor(currency = "$") {
        this.currency = currency;
        this.products = [];
    }

    fetchItems() {
        return sendRequest(`${API_URL}/cart`).then((value) => {
            this.products = value.map(product =>
                new Item( product.id, product.name, product.price, product.photo, product.count, product.currency, product.size, product.color));
        });
    }

    render() {
        const itemsHtmls = this.products.map(product => product.render());
        this.getCartPrice();
        this.getCartCount();

        return itemsHtmls.join('');
    }

    addProduct(product) {
        const promice = new Promise((resolve, reject) => {
            let isExists = false;
            for (var i = 0; i < this.products.length; i++) {
                if (+this.products[i].id === +product.id) {
                    this.products[i].count++;
                    isExists = true;
                    fetch(`/cart/${product.id}`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ count: this.products[i].count }),
                    });
                    resolve();
                    break;
                }
            }
            if (!isExists) {
                fetch('/cart', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({id: +product.id, name: product.name, photo: product.photo, price: product.price }),
                }).then((response) => response.json()).then((item) => {
                        const cartItem = new Item(item.id, item.name, item.price, item.photo);
                        this.products.push(cartItem);
                        resolve();
                    }
                );
            }
            this.reload();
        });
        promice.then(() => {
            showHelpModal();
            this.reload();
        });
    }
    removeItem(id) {
        let $items = document.getElementsByClassName('in-cart-item');
        for (var i = 0; i < $items.length; i++) {
            let isLastProduct = true;
            if (+this.products[i].id === +id) {
                if (this.products[i].count > 1) {
                    this.products[i].count--;
                    fetch(`/cart/${id}`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({count: this.products[i].count}),
                    });

                    isLastProduct = false;
                }
            }
            if (+$items[i].dataset.id === +id) {
                if (isLastProduct) {
                    fetch(`/cart/${id}`, {method: 'DELETE'});
                    this.products.splice(i, 1);
                    $items[i].remove();
                }
            }
        }
        this.reload();
    }
    reload() {
        document.querySelector('.cart__container').innerHTML = this.render();
    }

    getCartCount() {
        const $cartCount = document.querySelector('.cart-items-total');
        let total = 0;
        this.products.forEach(e => {
            total += +e.count;
        });
        $cartCount.textContent = total;
    }

    getCartPrice() {
        let price = 0;
        const $priceBlock = document.querySelector('.cart-total__price');
        this.products.forEach(e => {
            if (!isNaN(+e.price)) {
                price += +e.price * e.count;
            }
        });
        $priceBlock.textContent = this.currency + price;
    }
}

class Item {
    constructor (id, name, price, photo, count = 1, currency = '$', size, color, shipping = 'FREE') {
        this.id = id;
        this.name = name;
        this.price = price;
        this.photo = photo;
        this.count = count;
        this.currency = currency;
        this.size = size;
        this.color = color;
        this.shipping = shipping;
    }
//добавить стили  класс для img
//     width: 100%;
    // height: 100%;
    render () {
        return  `<div class="table-row">
                    <div class="product-details">
                        <a href="single-page.html" class="photo-link">
                            <div class="photo"">
                                <img class="photo_img" src="${this.photo}" alt="photo">
                            </div>
                        </a>
                       <div class="product-desc">
                           <h3>${this.name}</h3>
                           <h4>Color:<span>${this.color}</span></h4>
                           <h4>Size:<span>${this.size}</span></h4>
                       </div>
                    </div>
                    <div class="buing-info">
                        <div class="buing-info-div">${this.currency} ${this.price}</div>
                        <div class="buing-info-div">
                            <input class="buing-info-input" type="number" value="${this.count}"></div>
                        <div class="buing-info-div">${this.shipping}</div>
                        <div class="buing-info-div">${this.currency} ${this.getTotalPrice()} </div>
                        <div class="buing-info-div">
                            <i class="fas fa-times-circle"></i>
                        </div>
                    </div>
                </div>`;
    }

    getTotalPrice() {
        return this.count * this.price;
    }
}

const cartPage = new CartPage();
cartPage.fetchItems().then(() => document.querySelector('.cart-container').innerHTML = cartPage.render());
