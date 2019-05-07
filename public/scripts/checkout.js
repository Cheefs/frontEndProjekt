window.addEventListener('load', () => {
    loginUser.login(LOGIN_MODE_AUTO);
});

const $accordeonContainer = document.querySelector('.checkout__accordeon');
$accordeonContainer.addEventListener('click', (e) => {
    e.preventDefault();
    const $parent = e.target.classList.contains('header-h3')? e.target.parentElement.parentElement : e.target.parentElement;
    if ($parent.classList.contains('checkout-element')) {
        if (!($parent.classList.contains('selected')) ) {
           const $selected = document.querySelector('.selected');
           if ($selected !== null) {
                $selected.classList.remove('selected'); 
           }
            $parent.classList.add('selected');      
        } else {
            $parent.classList.remove('selected'); 
        } 
    }
});
