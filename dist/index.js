"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// *document connections
const myDisplayArea = document.getElementById("display-area");
const mySearchButton = document.querySelector(".search-button");
const mySearchInput = document.querySelector(".search-input");
const myDisplayChartsArea = document.querySelector(".chartsDisplay");
// *define parameters
let allCoinsArray = [];
let coinsDataFromStorage = ``;
let allCoinsArrayFromStorage = [];
let coinMoreInfoData = {};
let selectedCoins = [];
const maxSelections = 5;
mySearchButton.addEventListener("click", function () {
    filterCards(mySearchInput.value);
});
// *main async function when loading page
document.addEventListener("DOMContentLoaded", function () {
    return __awaiter(this, void 0, void 0, function* () {
        allCoinsArray = getCoinsDataFromStorage("allCoins");
        if (!allCoinsArray || !allCoinsArray.length) {
            allCoinsArray = yield getAllCoinsData();
            keepCoinDataLocalStorage("allCoins", allCoinsArray);
        }
        createCoinCard(allCoinsArray, myDisplayArea);
    });
});
// *function to save to local storage and one to retrieve
function keepCoinDataLocalStorage(arrayName, array) {
    const myCoinsToString = JSON.stringify(array);
    localStorage.setItem(arrayName, myCoinsToString);
}
function getCoinsDataFromStorage(arrayName) {
    coinsDataFromStorage = localStorage.getItem(arrayName) || '';
    let coinDataBack = [];
    if (coinsDataFromStorage) {
        coinDataBack = JSON.parse(coinsDataFromStorage);
    }
    return coinDataBack;
}
// *function to create a coin card and button
function createCoinCard(coinArray, parameter) {
    coinArray.forEach((obj) => {
        let divDisplay = document.createElement("div");
        divDisplay.classList.add("card");
        let divDisplayBody = document.createElement("div");
        divDisplayBody.classList.add("card-body");
        for (const key in obj) {
            if (key !== "id") {
                const coinData = document.createElement("li");
                coinData.innerText = `${key}: ${obj[key]}`;
                coinData.classList.add("card-text");
                divDisplayBody.appendChild(coinData);
            }
            divDisplay.appendChild(divDisplayBody);
        }
        let index = obj.id;
        const moreInfoButton = createButton(index, divDisplay);
        moreInfoButton.addEventListener("click", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const coinMoreInfoData = yield getMoreCoinInfo(index);
                displayMoreInfoCoin(coinMoreInfoData, divDisplayBody, moreInfoButton);
                moreInfoButton.style.display = "none";
            });
        });
        let isSelected = false;
        const selectButtonDiv = createSelectButton(index, divDisplay);
        selectButtonDiv.addEventListener("click", function () {
            isSelected = !isSelected;
            if (isSelected) {
                if (selectedCoins.length >= maxSelections) {
                    isSelected = false;
                    alert("No more selections allowed. " + maxSelections + " coins.");
                }
                else {
                    selectedCoins.push(index);
                    alert("selected " + index);
                }
            }
            else {
                const coinIndex = selectedCoins.indexOf(index);
                if (coinIndex > -1) {
                    selectedCoins.splice(coinIndex, 1);
                }
                alert("not selected");
            }
            console.log(selectedCoins);
            if (selectedCoins.length === maxSelections) {
                displaySelectedCoins(selectedCoins);
            }
        });
        parameter.appendChild(divDisplay);
    });
}
// Function to display selected coins in the modal
function displaySelectedCoins(coins) {
    const selectedCoinsList = document.getElementById('selectedCoinsList');
    const list = document.createElement('ul');
    selectedCoinsList.innerHTML = "";
    selectedCoinsList.innerHTML = "<h3>Selected Coins:</h3>";
    coins.forEach(coin => {
        const listItem = document.createElement('li');
        listItem.textContent = `Coin ${coin}`;
        const removeButton = document.createElement('button');
        removeButton.textContent = 'X';
        removeButton.classList.add("remove-from-list");
        removeButton.addEventListener('click', function () {
            const coinIndex = selectedCoins.indexOf(coin);
            if (coinIndex > -1) {
                selectedCoins.splice(coinIndex, 1);
            }
            displaySelectedCoins(selectedCoins);
        });
        listItem.appendChild(removeButton);
        list.appendChild(listItem);
    });
    selectedCoinsList.appendChild(list);
    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save Selection';
    saveButton.classList.add("save-button");
    saveButton.addEventListener('click', function () {
        promptRetrieveSavedData();
        console.log(selectedCoins);
        keepCoinDataLocalStorage("selectedCoins", selectedCoins);
        alert("Selections saved!");
    });
    const displayCoinsToChartsButton = document.createElement('button');
    displayCoinsToChartsButton.textContent = "Display in charts";
    displayCoinsToChartsButton.classList.add("display-in-chart-button");
    displayCoinsToChartsButton.addEventListener('click', function () {
        return __awaiter(this, void 0, void 0, function* () {
            // let selectedCoinsData = await getAllCoinsForCharts(selectedCoins);
            // console.log(selectedCoinsData);
            ;
        });
    });
    selectedCoinsList.appendChild(displayCoinsToChartsButton);
    selectedCoinsList.appendChild(saveButton);
    const modal = document.getElementById("myModal");
    modal.style.display = "block";
}
// Handle closing the modal
const span = document.getElementsByClassName("close")[0];
span.onclick = function () {
    const modal = document.getElementById("myModal");
    modal.style.display = "none";
};
// Close the modal if the user clicks outside of it
window.onclick = function (event) {
    const modal = document.getElementById("myModal");
    if (event.target == modal) {
        modal.style.display = "none";
    }
};
// *function fetch all coin data+function to fetch one coin more data
function getAllCoinsData() {
    return __awaiter(this, void 0, void 0, function* () {
        let response = yield fetch("https://api.coingecko.com/api/v3/coins/list");
        let allCoinsData = yield response.json();
        return allCoinsData;
    });
}
function getMoreCoinInfo(coinId) {
    return __awaiter(this, void 0, void 0, function* () {
        let response = yield fetch("https://api.coingecko.com/api/v3/coins/" + coinId);
        let coinMoreData = yield response.json();
        return coinMoreData;
    });
}
// *function for more info button
function displayMoreInfoCoin(coinObj, parameter2, button) {
    let divMoreInfoDisplay = document.createElement("div");
    divMoreInfoDisplay.classList.add("card-body");
    for (const key in coinObj) {
        if (key === "market_data") {
            const coinData = document.createElement("p");
            coinData.innerHTML = coinObj[key].current_price.usd + "$";
            divMoreInfoDisplay.appendChild(coinData);
            const coinDataEur = document.createElement("p");
            coinDataEur.innerHTML = coinObj[key].current_price.eur + "€";
            divMoreInfoDisplay.appendChild(coinDataEur);
            const coinDataIls = document.createElement("p");
            coinDataIls.innerHTML = coinObj[key].current_price.ils + "₪";
            divMoreInfoDisplay.appendChild(coinDataIls);
        }
        else if (key === "image") {
            const coinImage = document.createElement("img");
            coinImage.classList.add("card-img-top");
            coinImage.src = coinObj[key].large;
            divMoreInfoDisplay.appendChild(coinImage);
        }
    }
    const deleteButton = createDeleteButton(divMoreInfoDisplay);
    deleteButton.addEventListener("click", function () {
        divMoreInfoDisplay.remove();
        deleteButton.remove();
        button.style.display = "block";
    });
    parameter2.appendChild(divMoreInfoDisplay);
}
function filterCards(searchQuery) {
    const cards = document.querySelectorAll(".card");
    cards.forEach((card) => {
        var _a;
        const cardContent = ((_a = card.textContent) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || '';
        const query = searchQuery.toLowerCase();
        if (cardContent.includes(query)) {
            card.style.display = "block";
        }
        else {
            card.style.display = "none";
        }
    });
}
function createButton(objData, divDisplayData) {
    const moreInfoButtonData = document.createElement("button");
    moreInfoButtonData.classList.add("more-info-btn", "btn", "btn-primary");
    let index = objData;
    moreInfoButtonData.classList.add(index);
    moreInfoButtonData.setAttribute("type", "button");
    moreInfoButtonData.innerHTML = "More Info";
    divDisplayData.appendChild(moreInfoButtonData);
    return moreInfoButtonData;
}
function createSelectButton(objData, divDisplayData) {
    const selectButtonDiv = document.createElement("div");
    selectButtonDiv.classList.add("form-check", "form-switch");
    const selectButton = document.createElement("input");
    selectButton.type = "checkbox";
    selectButton.classList.add("form-check-input");
    selectButton.classList.add(objData);
    selectButton.setAttribute("role", "switch");
    selectButton.setAttribute("id", "flexSwitchCheckDefault");
    selectButtonDiv.appendChild(selectButton);
    divDisplayData.appendChild(selectButtonDiv);
    return selectButtonDiv;
}
function createDeleteButton(divMoreInfoDisplay) {
    const deleteButton = document.createElement("button");
    deleteButton.classList.add("btn", "btn-danger");
    deleteButton.innerHTML = "Less Info";
    divMoreInfoDisplay.appendChild(deleteButton);
    return deleteButton;
}
function promptRetrieveSavedData() {
    const retrieveSavedData = confirm("Would you like to retrieve previously selected data?");
    if (retrieveSavedData) {
        const savedCoins = getCoinsDataFromStorage("selectedCoins"); // Assuming getCoinsDataFromStorage returns a string array
        if (savedCoins) {
            selectedCoins = savedCoins;
            return selectedCoins; // Update the global array with saved data
        }
    }
    return null;
}
