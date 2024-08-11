

// BUDGET CONTROLLER
const budgetController = (function () {
  const Expense = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function (totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function () {
    return this.percentage;
  };

  const Income = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  const calculateTotal = function (type) {
    let sum = 0;
    data.allItems[type].forEach(function (current) {
      sum += current.value;
    });
    data.totals[type] = sum;
  };

  const data = {
    allItems: {
      exp: [],
      inc: [],
    },
    totals: {
      exp: 0,
      inc: 0,
    },
    budget: 0,
    percentage: -1,
  };

  return {
    addItem: function (type, des, val) {
      let newItem, ID;

      // create new ID
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      // create new item
      if (type === 'inc') {
        newItem = new Income(ID, des, val);
      } else if (type === 'exp') {
        newItem = new Expense(ID, des, val);
      }

      // push it into data structure
      data.allItems[type].push(newItem);

      // return the new element
      return newItem;
    },

    deleteItem: function (type, id) {
      const ids = data.allItems[type].map(function (current) {
        return current.id;
      });

      const index = ids.indexOf(id);

      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },

    calculateBudget: function () {
      // calculate total income and expenses
      calculateTotal('exp');
      calculateTotal('inc');

      // calculate the budget: income - expenses
      data.budget = data.totals.inc - data.totals.exp;

      // calculate percentage of spent income
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1; // non-existence
      }
    },

    getBudget: function () {
      return {
        budget: data.budget,
        totalIncome: data.totals.inc,
        totalExpenses: data.totals.exp,
        percentage: data.percentage,
      };
    },

    calculatePercentages: function () {
      data.allItems.exp.forEach(function (current) {
        current.calcPercentage(data.totals.inc);
      });
    },

    getPercentages: function () {
      const allPerc = data.allItems.exp.map(function (current) {
        return current.getPercentage();
      });
      return allPerc;
    },
  };
})();

// UI CONTROLLER
const UIController = (function () {
  const DOMStrings = {
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
    expensesPercentageLabel: '.item__percentage',
    dateLabel: '.budget__title--month',
  };

  const formatNumber = function (number, type) {
    number = Math.abs(number);
    number = number.toFixed(2);

    const numSplit = number.split('.');

    let int = numSplit[0];

    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
    }

    const dec = numSplit[1];

    return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
  };

  const nodeListForEach = function (list, callback) {
    for (let i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };

  return {
    getInput: function () {
      return {
        type: document.querySelector(DOMStrings.inputType).value,
        description: document.querySelector(DOMStrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMStrings.inputValue).value),
      };
    },

    getDOMStrings: function () {
      return DOMStrings;
    },

    addListItem: function (obj, type) {
      let html, newHtml, element;

      // create html string with placeholder text
      if (type === 'inc') {
        element = DOMStrings.incomeContainer;
        html =
          '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"> <div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === 'exp') {
        element = DOMStrings.expensesContainer;

        html =
          '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div> <div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div> </div></div>';
      }

      // replace placeholder with data
      newHtml = html
        .replace('%id%', obj.id)
        .replace('%description%', obj.description)
        .replace('%value%', formatNumber(obj.value, type));

      // insert the HTML into the DOM
      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
    },

    deleteListItem: function (selectorID) {
      const element = document.getElementById(selectorID);
      element.parentNode.removeChild(element);
    },

    clearFields: function () {
      const fields = document.querySelectorAll(
        DOMStrings.inputDescription + ', ' + DOMStrings.inputValue
      );

      const fieldsArr = Array.prototype.slice.call(fields);

      fieldsArr.forEach(function (current) {
        current.value = '';
      });

      fieldsArr[0].focus();
    },

    displayBudget: function (obj) {
      let type;
      type = obj.budget > 0 ? 'inc' : 'exp';

      document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(
        obj.budget,
        type
      );
      document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(
        obj.totalIncome,
        'inc'
      );
      document.querySelector(
        DOMStrings.expensesLabel
      ).textContent = formatNumber(obj.totalExpenses, 'exp');

      if (obj.percentage > 0) {
        document.querySelector(DOMStrings.percentageLabel).textContent =
          obj.percentage + '%';
      } else {
        document.querySelector(DOMStrings.percentageLabel).textContent = '---';
      }
    },

    displayPercentages: function (percentages) {
      const fields = document.querySelectorAll(
        DOMStrings.expensesPercentageLabel
      );

      nodeListForEach(fields, function (current, index) {
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + '%';
        } else {
          current.textContent = '---';
        }
      });
    },

    displayMonth: function () {
      const months = [
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
        'December',
      ];

      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();

      document.querySelector(DOMStrings.dateLabel).textContent =
        months[month] + ' ' + year;
    },

    changeType: function () {
      const fields = document.querySelectorAll(
        DOMStrings.inputType +
          ',' +
          DOMStrings.inputDescription +
          ',' +
          DOMStrings.inputValue
      );

      nodeListForEach(fields, function (current) {
        current.classList.toggle('red-focus');
      });

      document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
    },
  };
})();

// APP CONTROLLER
const controller = (function (budgetCtrl, UICtrl) {
  const setupEventListener = function () {
    const DOM = UICtrl.getDOMStrings();

   

 document
      .querySelector(DOM.inputBtn)
      .addEventListener('click', ctrlAddItem);

    document.addEventListener('keypress', function (event) {
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });

    document
      .querySelector(DOM.container)
      .addEventListener('click', ctrlDeleteItem);

    document
      .querySelector(DOM.inputType)
      .addEventListener('change', UICtrl.changeType);
  };

  const updateBudget = function () {
    // calculate the budget
    budgetCtrl.calculateBudget();

    // return the budget
    const budget = budgetCtrl.getBudget();

    // display the budget on the UI
    UICtrl.displayBudget(budget);
  };

  const updatePercentages = function () {
    // calculate percentages
    budgetCtrl.calculatePercentages();

    // read percentages from the budget controller
    const percentages = budgetCtrl.getPercentages();

    // update the UI with the new percentages
    UICtrl.displayPercentages(percentages);
  };

  const ctrlAddItem = function () {
    // get the input data
    const input = UICtrl.getInput();

    if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
      // add the item to the budget controller
      const newItem = budgetCtrl.addItem(input.type, input.description, input.value);

      // add the item to the UI
      UICtrl.addListItem(newItem, input.type);

      // clear the fields
      UICtrl.clearFields();

      // calculate and update budget
      updateBudget();

      // calculate and update percentages
      updatePercentages();
    }
  };

  const ctrlDeleteItem = function (event) {
    const itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemID) {
      const splitID = itemID.split('-');
      const type = splitID[0];
      const ID = parseInt(splitID[1]);

      // delete the item from the data structure
      budgetCtrl.deleteItem(type, ID);

      // delete the item from the UI
      UICtrl.deleteListItem(itemID);

      // update and show the new budget
      updateBudget();

      // calculate and update percentages
      updatePercentages();
    }
  };

  return {
    init: function () {
      console.log('Application has started');
      UICtrl.displayMonth();
      UICtrl.displayBudget({
        budget: 0,
        totalIncome: 0,
        totalExpenses: 0,
        percentage: -1,
      });
      setupEventListener();
    },
  };
})(budgetController, UIController);

controller.init();
