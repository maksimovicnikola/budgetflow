let items = document.querySelectorAll('.expense-list__item');

items.forEach(element => {
    element.addEventListener('mouseenter', function(e) {
        var btnItem = e.target.querySelector('.expense-list__item-percentage');

        btnItem.classList.remove('d-none');
    });

    element.addEventListener('mouseleave', function(e) {
        var btnItem = e.target.querySelector('.expense-list__item-percentage');

        btnItem.classList.add('d-none');
    });
});
