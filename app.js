// BUDGET CONTROLLER
const budgetController = (function () {

    let Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        }
        else {
            this.percentage = -1;
        }

    }

    Expense.prototype.getPercent = function () {
        return this.percentage;
    }


    let Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    let calculateTotal = function (type) {
        let sum = 0;
        data.allItems[type].forEach(elem =>
            sum += parseFloat(elem.value));
        data.totals[type] = sum;
    }

    let data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };


    return {
        addItem: function (type, des, val) {
            let newItem, ID;

            //[1 2 3 4 5], next ID = 6
            //[1 2 4 6 8], next ID = 9
            // ID = last ID + 1

            // Create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            // Create new item based on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            // Push it into our data structure
            data.allItems[type].push(newItem);

            // Return the new element
            return newItem;
        },


        deleteItem: function (type, id) {
            let Ids = data.allItems[type].map(x=>x.id)

            index = Ids.indexOf(id);
            if (index != -1) {
                console.log('IN');
                data.allItems[type].splice(index, 1);
            }

        },


        calculateBudget: function () {
            //calclate total income and expenses 
            calculateTotal('exp');
            calculateTotal('inc');

            //calculate the budget:
            data.budget = data.totals.inc - data.totals.exp;

            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }
            else {
                data.percentage = -1;
            }

        },

        calculatePersantages: function () {
            data.allItems.exp.forEach(curr=>
                curr.calcPercentage(data.totals.inc)
            )
        },

        getPercentages: function () {
            let allPerc = data.allItems.exp.map(cur=>
                 cur.getPercent())
            return allPerc;
        },

        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },


        testing: function () {
            console.log(data);
        }
    };

})();


// UI CONTROLLER
const UIController = (function () {

    const DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };


    let  formatNumber=function (num, type) {
        let numSplit, int, dec;
        num = Math.abs(num).toFixed(2);


        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, int.length);
        }

        dec = numSplit[1];

       return (type=='exp' ? '-': '+') +  ' ' + int + '.'+ dec;

    }

    let nodeListForEach = function (list, callback) {
        for (let index = 0; index < list.length; index++) {
            callback(list[index], index)
        }
    }

    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMstrings.inputType).value, // Will be either inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },

        displayBudget: function (obj) {

            obj.budget>0 ? type='inc': type='exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget,type );
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc,'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp,'exp');


            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            }
            else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }

        },

        displayMonth:function(){
            let now = new Date();
            let mL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            let month= now.getMonth();
            let year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = mL[month] + ' ' + year;
        },

        updatepercentages: function (persantages) {
            let fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

           

            nodeListForEach(fields, function (current, index) {
                if (persantages[index] > 0) {
                    current.textContent = persantages[index] + '%';
                }
                else {
                    current.textContent = '---';
                }
            })
        },

       
        addListItem: function (obj, type) {

            let html, newHtml, element;
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = ' <div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }

            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value,type));

            document.querySelector(element).insertAdjacentHTML('beforeEnd', newHtml);
        },


        deleteListItem: function (selectorId) {
            let element = document.getElementById(selectorId);
            element.parentNode.removeChild(element);
        },


        clearFields: function () {
            let fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);

            let filedsArray = Array.prototype.slice.call(fields);

            filedsArray.forEach(curr => 
                curr.value = ""
            );

            filedsArray[0].focus();

        },

        changedType : function(){
            let fields = document.querySelectorAll(
                DOMstrings.inputType + ',' + DOMstrings.inputDescription + ',' + DOMstrings.inputValue
            );

                nodeListForEach(fields,function(curr){
                    curr.classList.toggle('red-focus');
                })
                document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },

        getDOMstrings: function () {
            return DOMstrings;
        }
    };

})();


// GLOBAL APP CONTROLLER
let controller = (function (budgetCtrl, UICtrl) {

    let setupEventListeners = function () {
        let DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UIController.changedType);
    };

    let updateBudget = function () {
        budgetController.calculateBudget();
        let budget = budgetController.getBudget();
        UIController.displayBudget(budget);
    };

    let updatePersantages = function () {
        //Calculate persantages
        budgetController.calculatePersantages();
        //Read the persantages from the budgetController
        let persantages = budgetController.getPercentages();

        //Update the UI
        UIController.updatepercentages(persantages);

    }



    let ctrlAddItem = function () {
        let input, newItem;

        // 1. Get the field input data
        input = UICtrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // 2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Add the item to the UI
            UIController.addListItem(newItem, input.type);

            // 4. Clear the fields
            UIController.clearFields();

            // 5. Calculate and update budget
            updateBudget();

            updatePersantages();
        }
    };


    let ctrlDeleteItem = function (event) {
        let splitId, type, Id;
        let itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemId) {
            splitId = itemId.split('-');
            type = splitId[0];
            Id = parseInt(splitId[1]);
        }

        //Del from data structure
        budgetController.deleteItem(type, Id);

        //Delete the item from UI
        UIController.deleteListItem(itemId);

        //Update and show the new budget
        updateBudget();


        updatePersantages();
    };


    return {
        init: function () {
            console.log('Application has started.');
            UIController.displayMonth();
            UIController.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: 0
            });
            setupEventListeners();
        }
    };

})(budgetController, UIController);


controller.init();