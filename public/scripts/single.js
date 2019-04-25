class Product {
    constructor(id, photo, name, price, size, count, color, material, brand, type, category, desc ='', currency = "$", photos ) {
        this.id = id;
        this.photo = photo;
        this.name = name;
        this.price = price;
        this.size = size;
        this.count = count;
        this.color = color;
        this.material = material;
        this.brand = brand;
        this.type = type;
        this.category = category;
        this.desc = desc;
        this.currency = currency;
        this.photos = photos;
        this.colors = ['red','black','yellow','green','white'];
        this.sizes = ['XXL', 'XL', 'L', 'M', 'S', 'XS', 'XXS'];
    }

    renderSlider() {
         return ` <a href="#" class="arrow left"><i class="fas fa-angle-right"></i></a>
                    <div class="photo">
                        <div class="photo-link">
                            <img class="photo_img"src="${this.photo}">
                        </div>
                        <div class="all-photos hide">
                            ${this.setProductPhotos()}
                        </div>
                    </div>
                    <a href="#" class="arrow right"><i class="fas fa-angle-left"></i></a>`;
    }

    renderProduct() {
        return ` <h3 class="product-desc-h3">${this.type} COLLECTION</h3>
                    <div class="line">
                        <div class="line-color"></div>
                    </div>
                    <article class="product-desc-article single_product" data-id="${this.id}">
                        <h3 class="article-h3">${this.name}</h3>
                        <p class="article-p">${this.desc}</p>
                        <div class="material-desinger">
                            <div class="material-desinger-el">MATERIAL:
                                <a class="material-desinger-link" href="#">${this.material}</a>
                            </div>
                            <div class="material-desinger-el">DESIGNER:
                                <a class="material-desinger-link" href="#">${this.brand}</a>
                            </div>
                        </div>
                        <div class="product-price">${this.currency}${this.price}</div>
                    </article>

                    <div class="product-params">
                        <div class="choise">
                            <h3 class="product-params-h3">CHOOSE COLOR</h3>
                            <select class="product-params-select select_color">
                                ${this.renderOptions(this.colors)}
                            </select>
                            <div class="color-example red"></div>
                        </div>
            
                        <div class="choise size">
                            <h3 class="product-params-h3">CHOOSE SIZE</h3>
                            <select class="product-params-select select_size">
                               ${this.renderOptions(this.sizes)}
                            </select>
                        </div>
                        <div class="choise">
                            <h3 class="product-params-h3">QUANTITY</h3>
                            <input class="product-params-input input_count" type="number" min="1" value="1">
                        </div>

                        <a data-id="${this.id}" class="product-params-a btn_buy" href="#"><img  class="product-params-img" src="images/single-page-cart.svg" alt="cart">
                            <span class="product-params-span">
                                Add to Cart
                            </span>
                        </a> `;
    }

    renderOptions(array) {
        return  array.reduce((acc, el) => acc +`<option value="${el}">${el}</option>`, 0);
    }

    render() {
        return `<div class="product" data-size="${this.size}" data-color="${this.color}" data-type="${this.type}" data-category="${this.category}">
                    <a href="single-page.html" class="photo-link">
                        <div class="photo">
                            <img class="photo_img" src="${this.photo}" alt="photo" data-id="${this.id}">
                        </div>
                    </a>
                    <div class="buttons">
                        <a href="#" class="product-btn add-to-cart" data-id="${this.id}" >
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
                            ${this.currency}<span class="price_value">${this.price}</span>
                        </div>
                    </div>
                </div>`
    }

    setProductPhotos() {
        return this.photos.reduce((acc, item) => acc + `<img class="photo_img" src="${item}" alt="photo">`, 0);
    }

}

class RecomendedProducts {
    constructor() {
        this.products = []
    }

    fetchItems(id, type) {
        return sendRequest(`${API_URL}/products?type=${type}`).then((value) => {
            value = value.filter((item) => item.id !== id);
            this.products = value.map(product => new Product(
                product.id, product.photo, product.name, product.price, product.size,
                product.count, product.color, product.material, product.brand, product.type, product.category
            ));
        });
    }

    render() {
        const itemsHtmls = this.products.map(product => product.render());
        return itemsHtmls.join('');
    }
}

const recomended = new RecomendedProducts();
const username = document.cookie.trim() !== '' ? document.cookie : '0';

window.addEventListener('load', (e)=> {
    loginUser.login(LOGIN_MODE_AUTO);
    let id = 1;
    if (location.search.trim() !== '') {
        id = location.search.split('=')[1];
    }
    sendRequest(`${API_URL}/products?id=${id}`).then((data) => {
        data = data[0];
        const singleProduct = new Product( 
            data.id, data.photo, data.name, data.price, data.size, data.count,
            data.color, data.material, data.brand, data.type, data.category, data.desc, data.currency, data.photos 
        );
        document.querySelector('.slider').innerHTML = singleProduct.renderSlider();
        document.querySelector('.product-desc').innerHTML = singleProduct.renderProduct();
        return singleProduct;
    }).then((product) => { recomended.fetchItems(product.id, product.type).then(() => 
                document.querySelector('.product-container').innerHTML = recomended.render());
    }).then(() => {
        const $colorPicker = document.querySelector('.select_color');
        const $colorExample = document.querySelector('.color-example');

        $colorPicker.addEventListener('change', (e) => {
            let color = document.querySelector('.select_color').selectedIndex;
            color = $colorPicker.options[color].value;
            $colorExample.classList = `color-example ${color}`;
        });
        reviewList.init();
    });
});

const $productContainer = document.querySelector('.product-desc');
$productContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn_buy') || e.target.parentElement.classList.contains('btn_buy')) {
        const id = (e.target.parentElement.classList.contains('btn_buy'))? e.target.parentElement.dataset.id : e.target.dataset.id;
        e.preventDefault();

       const sizeAvailable = document.querySelector('.select_size').options;
       let size = document.querySelector('.select_size').selectedIndex;
       size = sizeAvailable[size].value;

       const colorsAvailable = document.querySelector('.select_color').options;
       let color = document.querySelector('.select_color').selectedIndex;
       color = colorsAvailable[color].value;
        
       const count = document.querySelector('.input_count').value;

        sendRequest(`${API_URL}/products/${id}`).then((value) => {
            const product = new CartItem(null, value[0].id, username, value[0].name, value[0].price, 
                value[0].photo, size, color, value[0].category, value[0].type, count
            );
            cart.addProduct(product);
        });
    }
});

const $products = document.querySelector('.product-container');
    $products.addEventListener('click', (e) => {
    e.preventDefault();
    if (e.target.parentElement.classList.contains('add-to-cart') || e.target.classList.contains('add-to-cart')) {
        let $productData = e.target.parentElement.parentElement.parentElement;
        const id = e.target.classList.contains('add-to-cart')? e.target.dataset.id : $productData.querySelector('.add-to-cart').dataset.id;
        sendRequest(`${API_URL}/products?id=${id}`).then((value) => {
            value = value[0];
            const product = new CartItem(null, value.id, username, value.name, value.price, 
                value.photo, value.size, value.color, value.category, value.type, value.count
            );
            cart.addProduct(product);
        });

    } else if (e.target.classList.contains('photo_img')) {
        window.location.href = `${API_URL}/single-page.html?id=${e.target.dataset.id}`;
    }
});

class ReviewsList {
    constructor() {
        this.reviews = [];
        this.user = {};
    }

    fetch() {
        const id = document.querySelector('.single_product').dataset.id;
        return sendRequest(`${API_URL}/reviews?status=moderate&product_id=${id}`).then((value) => {
            this.reviews = value.map((rev) => new Review(rev.id, rev.username, rev.comment, rev.datetime, rev.status));
        });
    }

    render() {
        const itemsHtmls = this.reviews.map(rev => rev.render());
        return itemsHtmls.join('');
    }

    init() {
       return  this.fetch().then(() => document.querySelector('.product__comments').innerHTML = this.render());
    }
}

const reviewList = new ReviewsList();
const $btnAddComment = document.querySelector('.add_button');

$btnAddComment.addEventListener('click', (e) => {
    const rev = new Review();
    rev.add();
    reviewList.init();
    document.querySelector('.comment__input').value = '';
    showHelpModal('ваш отзыв отправлен на модерацию');
});

const $sliderContainer = document.querySelector('.slider');
let activeIndex = 1;
$sliderContainer.addEventListener('click', (e) => {
    e.preventDefault();
    if (e.target.classList.contains('arrow') || e.target.parentElement.classList.contains('arrow')) {
        const target = e.target.classList.contains('arrow')? e.target : e.target.parentElement;
        const $listPhotos = document.querySelector('.all-photos').children;

        if ($listPhotos.length > 0) {
            const $currPhoto = document.querySelector('.photo_img');
            if (target.classList.contains('right')) {
                if (activeIndex > 1) {
                    activeIndex--;
                } else {
                    activeIndex = $listPhotos.length;
                }
            } else {
                if (activeIndex < $listPhotos.length) {
                    activeIndex++;
                } else {
                    activeIndex = 1;
                }
            }
            $currPhoto.src = $listPhotos[activeIndex - 1].src;
        }
    }
});