var budgetController = (function() {
    var Income = function(ID, description, value) {
        this.ID = ID;
        this.description = description;
        this.value = value;
    };

    var Expense = function(ID, description, value) {
        this.ID = ID;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    //-- Object for budget controll
    var data = {
        total: {
            inc: 0,
            exp: 0,
            totalBudget: 0,
            totalExpensesPercentage: -1
        },
        items: {
            inc: [],
            exp: []
        }
    };

    /* Getting ID of last element of type and returning last ID + 1 as and ID for the new element */
    var createItemID = function(type) {
        var lastID = 0,
            itemsList;
        itemsList = data.items[type];
        if (itemsList.length > 0) lastID = itemsList[itemsList.length - 1].ID;

        return lastID + 1;
    };

    //-- Calculating percentage of expenses compared to the total income
    var calculatePercentage = function(value) {
        var perc = 0;
        if (value != 0 && data.total.inc != 0) perc = Math.round((value / data.total.inc) * 100);
        else if (data.total.inc == 0) perc = -1;

        return perc;
    };

    return {
        addItem: function(type, description, value) {
            var ID, item;

            ID = createItemID(type);
            if (type === 'inc') {
                item = new Income(ID, description, value);
            } else if (type === 'exp') {
                item = new Expense(ID, description, value);
                item.percentage = calculatePercentage(value);
            }

            data.items[type].push(item);
            return item;
        },
        removeItem: function(type, id) {
            var elIndex = data.items[type].findIndex(function(i, index) {
                if (i.ID == id) {
                    elIndex = index;
                    return i;
                }
            });

            //-- Removing the item from an array
            data.items[type].splice(elIndex, 1);
        },
        calculateBudget: function() {
            var totalIncome = 0,
                totalExpenses = 0;

            data.items.inc.forEach(function(income) {
                totalIncome += parseFloat(income.value);
            });

            data.items.exp.forEach(function(expense) {
                totalExpenses += parseFloat(expense.value);
            });

            data.total.inc = totalIncome;
            data.total.exp = totalExpenses;
            data.total.totalBudget = totalIncome - totalExpenses;
            data.total.totalExpensesPercentage = calculatePercentage(totalExpenses);

            data.items.exp.forEach(function(expense) {
                expense.percentage = calculatePercentage(expense.value);
            });
        },
        getData: function() {
            return data;
        }
    };
})();

var UIController = (function() {
    var formatPrices, resetInputStyle;
    /*-- Created object with selectors, so in the future if we modify some class or id
         inside of HTML, we will modify it only inside of this object in js file.
    */
    var DOMStrings = {
        currentDate: '.budget-container__label-date',
        totalBudget: '.budget-container__summary',
        totalIncome: '.budget-container__income-value',
        totalExpenses: '.budget-container__expenses-value',
        totalExpensesPerc: '.budget-container__expenses-percentage',
        selectType: '.new-item__select',
        inputDescription: '.new-item__description',
        inputValue: '.new-item__value',
        addItem: '.new-item__button',
        addItemIcon: '.new-item__button-icon',
        listContainer: '.list-container',
        incomeList: '.income-list',
        expenseList: '.expense-list',
        incomeRemoveItem: '.income-list__button-icon',
        expenseRemoveItem: '.expense-list__button-icon'
    };

    /* Prices formating (1236.56 => + 1.236,56) */
    formatPrices = function(value, type = '') {
        var intPart,
            decimalPart,
            type,
            isNegative = false;
        parsedIntPart = '';

        value = parseFloat(value).toFixed(2);

        //-- Get corresponding sign
        if (type) {
            type = type === 'inc' ? '+' : '-';
        } else {
            type = value >= 0 ? '+' : '-';
        }

        //-- Split value on integer and decimal part
        priceSplit = value.toString().split('.');
        intPart = priceSplit[0];
        decimalPart = priceSplit[1];

        intPart = Math.abs(intPart);
        intPart = intPart.toString();
        //-- Separate thousands with '.'
        if (intPart.length > 3) {
            var counter = 0;
            for (var i = intPart.length - 1; i >= 0; i--) {
                if (counter % 3 === 0 && counter > 0) {
                    parsedIntPart = intPart[i] + '.' + parsedIntPart;
                } else {
                    parsedIntPart = intPart[i] + parsedIntPart;
                }
                counter++;
            }
        } else {
            parsedIntPart = intPart;
        }

        return `${type} ${parsedIntPart},${decimalPart} &euro;`;
    };

    resetInputStyle = function() {
        var elements = document.querySelectorAll(
            `${DOMStrings.selectType}, ${DOMStrings.inputDescription}, ${DOMStrings.inputValue}`
        );
        elements.forEach(function(el) {
            el.classList.remove('red-outline');
        });

        document.querySelector(DOMStrings.addItemIcon).classList.remove('red');
    };

    return {
        displayItem: function(item, type) {
            var elementHtml, listSelector, price;
            price = formatPrices(item.value, type);

            if (type === 'inc') {
                listSelector = DOMStrings.incomeList;
                elementHtml = `<li class="income-list__item" id="${type}-${item.ID}">
                                    <div class="income-list__item-description">${item.description}</div>
                                    <div class="income-list__item-value">${price}</div>
                                    <button class="btn-icon income-list__button">
                                        <i class="income-list__button-icon icon ion-ios-close-circle-outline"></i>
                                    </button>
                                </li>`;
            } else if (type === 'exp') {
                percentage = item.percentage === -1 ? '---' : `${item.percentage} %`;

                listSelector = DOMStrings.expenseList;
                elementHtml = `<li class="expense-list__item" id="${type}-${item.ID}">
                                    <div class="expense-list__item-description">${item.description}</div>
                                    <div class="expense-list__item-value">${price}</div>
                                    <div class="expense-list__item-percentage">${percentage}</div>
                                    <button class="btn-icon expense-list__button">
                                        <i class="expense-list__button-icon icon ion-ios-close-circle-outline"></i>
                                    </button>
                                </li>`;
            }

            //-- Adding item to the coresponding list inside of HTML
            var listEl = document.querySelector(listSelector);
            listEl.insertAdjacentHTML('beforeend', elementHtml);
        },
        removeItem: function(id) {
            var element = document.getElementById(id);
            element.parentNode.removeChild(element);
        },
        displayBudget: function(data) {
            document.querySelector(DOMStrings.totalBudget).innerHTML = formatPrices(data.total.totalBudget);
            document.querySelector(DOMStrings.totalIncome).innerHTML = formatPrices(data.total.inc, 'inc');
            document.querySelector(DOMStrings.totalExpenses).innerHTML = formatPrices(data.total.exp, 'exp');

            document.querySelector(DOMStrings.totalExpensesPerc).innerHTML =
                data.total.totalExpensesPercentage !== -1 ? `${data.total.totalExpensesPercentage}%` : '---';

            data.items.exp.forEach(function(expense) {
                var selector = `#exp-${expense.ID}>.expense-list__item-percentage`;
                document.querySelector(selector).textContent =
                    expense.percentage === -1 ? '---' : `${expense.percentage} %`;
            });
        },
        displayMonth: function() {
            var date, year, months, currentMonth;

            date = new Date();
            year = date.getFullYear();
            months = [
                'January',
                'February',
                'March',
                'April',
                'May',
                'June',
                'July',
                'August',
                'September',
                'October',
                'November',
                'December'
            ];
            currentMonth = months[date.getMonth()];

            document.querySelector(DOMStrings.currentDate).textContent = `${currentMonth} ${year}`;
        },
        updateInputStyle: function(e) {
            var elements = document.querySelectorAll(
                `${DOMStrings.selectType}, ${DOMStrings.inputDescription}, ${DOMStrings.inputValue}`
            );
            elements.forEach(function(el) {
                el.classList.toggle('red-outline');
            });

            document.querySelector(DOMStrings.addItemIcon).classList.toggle('red');
        },
        clearInputs: function() {
            //-- Clear inputs
            document.querySelector(DOMStrings.inputValue).value = '';
            document.querySelector(DOMStrings.inputDescription).value = '';
            document.querySelector(DOMStrings.selectType).value = 'inc';

            //-- Set focus on description input
            document.querySelector(DOMStrings.inputDescription).focus();

            //-- Set inputs style to initial state
            resetInputStyle();
        },
        getInputs: function() {
            var type, description, value;

            type = document.querySelector(DOMStrings.selectType).value;
            description = document.querySelector(DOMStrings.inputDescription).value.trim();
            value = parseFloat(document.querySelector(DOMStrings.inputValue).value).toFixed(2);

            return {
                type: type,
                description: description,
                value: value
            };
        },
        getSelectors: function() {
            return DOMStrings;
        }
    };
})();

var appController = (function(budgetCtrl, UICtrl) {
    var DOM, addItemCtrl, setupEventListeners, data, getTypeAndId;

    //-- Get DOM selectors
    DOM = UIController.getSelectors();
    //-- Budget data object
    data = budgetCtrl.getData();

    //-- All event listeners are inside of this function
    setupEventListeners = function() {
        var btnAdd;
        btnAdd = document.querySelector(DOM.addItem);
        btnAdd.addEventListener('click', addItemCtrl); //-- Adding item when button is clicked

        document.addEventListener('keyup', function(e) {
            if (e.code === 'Enter') addItemCtrl(); //-- Adding item only if 'ENTER' button is clicked
        });

        document.querySelector(DOM.listContainer).addEventListener('click', removeItemCtrl);

        //-- On dropdown change, toogle of classes for red and green borders because of UX
        const selectElement = document.querySelector(DOM.selectType);
        selectElement.addEventListener('change', UICtrl.updateInputStyle);
    };

    //-- Getting item type and item id from id selector => inc-5 => type = inc; ID = 5
    getTypeAndId = function(idItem) {
        var idSplit, type, id;

        idSplit = idItem.split('-');
        type = idSplit[0];
        id = idSplit[1];
        return {
            type: type,
            id: id
        };
    };

    //-- Adding of new item to the budget
    addItemCtrl = function() {
        var item, itemObj;
        //-- 1. Get input values of the new item from the UI
        item = UICtrl.getInputs();

        //-- Validation
        if (!item.description || item.value < 1) return;

        //-- 2. Add item to the list of items (inc or epx)
        itemObj = budgetCtrl.addItem(item.type, item.description, item.value);

        //-- 3. Update UI with new item
        UICtrl.displayItem(itemObj, item.type);

        //-- 4. Calculate budget
        budgetCtrl.calculateBudget();

        //-- 5. Update UI with new budget
        UICtrl.displayBudget(data);

        //-- 6. Clear input fields
        UICtrl.clearInputs();
    };

    removeItemCtrl = function(event) {
        itemID = event.target.parentNode.parentNode.id;
        if (!itemID) return; //-- If itemID is undefined, it means the user didn't click on 'delete' btn

        var element = getTypeAndId(itemID);
        //-- 1. Remove item from the array
        budgetCtrl.removeItem(element.type, element.id);

        //-- 2. Remove item from the UI
        UICtrl.removeItem(itemID);

        //-- 3. Recalculate budget
        budgetCtrl.calculateBudget();

        //-- 4. Update budget interface
        UICtrl.displayBudget(data);
    };

    return {
        init: function() {
            console.log('The application has started!');
            UICtrl.displayMonth();
            UICtrl.displayBudget(data);
            setupEventListeners();
        }
    };
})(budgetController, UIController);

appController.init();
